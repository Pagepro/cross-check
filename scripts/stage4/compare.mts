// Stage 4, answer drift: which facts about us do models get wrong today, even with our site in reach?
// Each buyer question goes three ways in parallel: the model alone, the same model with web search, our agent with
// the Knowledge Base. Both outside answers are graded against the KB answer (gradeAnswer) and the verdict is derived
// in code (lib/probe/drift.ts). Rows that missed get a suggested fix for the editor (lib/probe/recommend.ts). Every run is kept as dated `comparison` documents; the Studio tab shows the latest.
//
// Usage: npm run stage4                    12 questions, spread across categories
//        npm run stage4 -- --all           every eligible question (~55, slow and costly: web search on each)
//        npm run stage4 -- 24 44 84        just these buyer question numbers
//
// Gaps are excluded: there the KB agent rightly says "not in our content" while a model invents an answer,
// so the comparison would read backwards.
import {driftVerdict, DRIFT_PRIORITY} from '../../lib/probe/drift'
import {askKnowledgeBase, askWithoutKnowledgeBase, askWithWebSearch} from '../../lib/probe/kb-agent'
import {MODELS} from '../../lib/models'
import {gradeAnswer} from '../../lib/probe/grade'
import {type CitedPage, recommendFix} from '../../lib/probe/recommend'
import {pageproClient} from '../../lib/sanity/client'

const DEFAULT_LIMIT = 12
const CONCURRENCY = 3

type Question = {_id: string; number: number; category: string; question: string; priorLabel?: string; findingVerdict?: string; siteCoverage?: string}

const client = pageproClient()
const args = process.argv.slice(2)
const numbers = args.map(Number).filter(Boolean)

const all = await client.fetch<Question[]>(
  `*[_type == "buyerQuestion"] | order(number asc){
    _id, number, category, question, priorLabel, siteCoverage,
    "findingVerdict": *[_type == "finding" && question._ref == ^._id][0].verdict
  }`,
)
// Measured coverage (npm run coverage) beats a finding's verdict, which beats the corpus label written before the
// site was checked.
const isGap = (q: Question) =>
  q.siteCoverage ? q.siteCoverage === 'no' : q.findingVerdict ? q.findingVerdict === 'gap' : q.priorLabel === 'gap'
const eligible = all.filter((q) => !isGap(q))

let questions: Question[]
if (numbers.length) {
  questions = all.filter((q) => numbers.includes(q.number))
} else if (args.includes('--all')) {
  questions = eligible
} else {
  // Round-robin over categories so a small run still covers pricing, team, process, support…
  const byCategory = new Map<string, Question[]>()
  for (const q of eligible) byCategory.set(q.category, [...(byCategory.get(q.category) ?? []), q])
  questions = []
  while (questions.length < DEFAULT_LIMIT && [...byCategory.values()].some((list) => list.length)) {
    for (const list of byCategory.values()) if (list.length && questions.length < DEFAULT_LIMIT) questions.push(list.shift()!)
  }
}

const runAt = new Date()
const runId = runAt.toISOString().slice(0, 16).replace(/[-:]/g, '').replace('T', '-') // 20261002-1130
console.log(`run ${runId}: ${questions.length} of ${eligible.length} eligible questions (${all.length - eligible.length} gaps excluded), ${MODELS.agent}`)

async function compare(q: Question, order: number) {
  const started = Date.now()
  const [kb, alone, withSearch] = await Promise.all([
    askKnowledgeBase(q.question, {brief: true}),
    askWithoutKnowledgeBase(q.question, {brief: true}),
    askWithWebSearch(q.question, {brief: true}),
  ])
  // A question the corpus marked as covered can still be a gap on the site. Same reason as excluding gaps up front:
  // with no answer in our content there is nothing to grade the outside answers against.
  if (!kb.found) {
    console.log(`#${String(q.number).padStart(2)} skipped: the Knowledge Base has no answer, so this is a gap (Content audit), not drift · ${q.question}`)
    return null
  }
  const truth = [{id: 'kb', quote: kb.answer, pageUrl: kb.citations[0]?.url ?? 'knowledge base'}]
  const [aloneGrade, searchGrade] = await Promise.all([
    gradeAnswer({question: q.question, answer: alone.answer, claims: truth, truthClaimId: 'kb'}),
    gradeAnswer({question: q.question, answer: withSearch.answer, claims: truth, truthClaimId: 'kb'}),
  ])
  const verdict = driftVerdict({alone: aloneGrade.grade, withSearch: searchGrade.grade, kbConflicted: kb.conflicted})
  const fix =
    verdict === 'aligned'
      ? null
      : await recommendFix({
          question: q.question,
          verdict,
          kb: {
            answer: kb.answer,
            conflicted: kb.conflicted,
            pages: await client.fetch<CitedPage[]>(`*[_id in $ids]{title, url, body}`, {ids: kb.citations.map((c) => c.id)}),
          },
          alone: {answer: alone.answer, reason: aloneGrade.reason},
          withSearch: {answer: withSearch.answer, reason: searchGrade.reason, sources: withSearch.sources},
        })

  await client.createOrReplace({
    _id: `comparison.${runId}.${String(order).padStart(2, '0')}`,
    _type: 'comparison',
    runId,
    runAt: runAt.toISOString(),
    order,
    question: {_type: 'reference', _ref: q._id},
    questionNumber: q.number,
    questionText: q.question,
    verdict,
    priority: DRIFT_PRIORITY[verdict],
    alone: alone.answer,
    aloneGrade: aloneGrade.grade,
    aloneGradeReason: aloneGrade.reason,
    withSearch: withSearch.answer,
    withSearchGrade: searchGrade.grade,
    withSearchGradeReason: searchGrade.reason,
    searchSources: withSearch.sources.slice(0, 10),
    withKb: kb.answer,
    kbConflicted: kb.conflicted,
    citations: kb.citations.map((c, i) => ({_key: `c${i}`, _type: 'citation', title: c.title, url: c.url})),
    suggestedFix: fix?.suggestedFix,
    model: MODELS.agent,
  })
  console.log(
    `#${String(q.number).padStart(2)} ${verdict.padEnd(17)} alone:${aloneGrade.grade.padEnd(8)} search:${searchGrade.grade.padEnd(8)}${kb.conflicted ? ' kb-conflicted' : ''} ${Math.round((Date.now() - started) / 1000)}s · ${q.question}`,
  )
  return verdict
}

const queue = questions.map((q, i) => ({q, order: i + 1}))
const verdicts: string[] = []
let skipped = 0
await Promise.all(
  Array.from({length: CONCURRENCY}, async () => {
    for (let item = queue.shift(); item; item = queue.shift()) {
      try {
        const verdict = await compare(item.q, item.order)
        if (verdict) verdicts.push(verdict)
        else skipped++
      } catch (error) {
        console.log(`#${item.q.number} FAILED: ${error instanceof Error ? error.message : error}`)
      }
    }
  }),
)
const counts = Object.entries(Object.groupBy(verdicts, (v) => v)).map(([v, list]) => `${v} ${list?.length}`)
console.log(`\ndone · ${counts.join(' · ')}${skipped ? ` · ${skipped} skipped as gaps` : ''}`)
