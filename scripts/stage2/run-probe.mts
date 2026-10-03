// Stage 2: run the sampled buyer questions through the Knowledge Base agent, check page text before calling
// anything a gap, compare with what sales told clients, and write one `finding` per question to the private dataset.
// Usage: npm run stage2                          the 20-question sample below
//        npm run stage2 -- 3 66 85                only those question numbers
//        npm run stage2 -- --remaining            every question without a finding yet
//        npm run stage2 -- --remaining --limit 20 --budget 10
//          --limit: at most this many questions; --budget: start no new question once this run has spent that many
//          US dollars on AI Gateway (credit usage lags by seconds, so the last few questions can go a little over)
import {gateway} from 'ai'

import {askKnowledgeBase} from '../../lib/probe/kb-agent'
import {judge, type PageText, pickSalesEvidence, type SalesAnswer, searchPageText} from '../../lib/probe/judge'
import {pageproClient} from '../../lib/sanity/client'

// All 9 questions labelled "contradiction" (all money-related), 7 gaps and 4 weak ones closest to money, across categories.
const SAMPLE = [3, 4, 48, 59, 60, 66, 67, 68, 85, 7, 8, 17, 22, 43, 58, 61, 1, 14, 24, 69]
const CONCURRENCY = 4

const client = pageproClient()
const args = process.argv.slice(2)
const flag = (name: string) => {
  const at = args.indexOf(name)
  return at >= 0 ? Number(args[at + 1]) : undefined
}
const limit = flag('--limit')
const budget = flag('--budget')
const only = args.filter((a, i) => !a.startsWith('--') && !['--limit', '--budget'].includes(args[i - 1])).map(Number).filter(Boolean)
const remaining = args.includes('--remaining')
const runId = new Date().toISOString()

const [all, sales, pages] = await Promise.all([
  client.fetch<{_id: string; number: number; category: string; question: string; probed: boolean}[]>(
    `*[_type == "buyerQuestion"] | order(number asc){_id, number, category, question, "probed": count(*[_type == "finding" && question._ref == ^._id]) > 0}`,
  ),
  client.fetch<SalesAnswer[]>(`*[_type == "salesAnswer"]{_id, topic, client, text} | order(_id asc)`),
  client.fetch<PageText[]>(`*[_type == "kbSource"]{_id, title, url, body}`),
])
const picked = remaining ? all.filter((q) => !q.probed) : all.filter((q) => (only.length ? only : SAMPLE).includes(q.number))
const questions = picked.slice(0, limit)

// Mark what was run so the Studio shows which questions have been through the probe.
await client.transaction(questions.map((q) => ({patch: {id: q._id, set: {inSample: true}}}))).commit()

const usedAtStart = Number((await gateway.getCredits()).totalUsed)
const spent = async () => Number((await gateway.getCredits()).totalUsed) - usedAtStart

async function probe(q: (typeof questions)[number]) {
  const started = Date.now()
  const [kb, evidence] = await Promise.all([askKnowledgeBase(q.question), pickSalesEvidence(q.question, sales)])
  const pageText = await searchPageText(q.question, pages)
  const verdict = await judge({question: q.question, category: q.category, kb, pageText, sales: evidence.picks})
  // A gap filed by the agent but answered in page text is a retrieval miss, not a content gap.
  const verdictChanged = !kb.found && verdict.siteAnswersIt

  // Keep what people decided about this finding: a rerun replaces the probe's output, not the editor's review.
  const findingId = `finding.${String(q.number).padStart(2, '0')}`
  const kept = await client.fetch<{review?: string; duplicateOf?: {_ref: string}} | null>(`*[_id == $id][0]{review, duplicateOf}`, {id: findingId})

  await client.createOrReplace({
    _id: findingId,
    _type: 'finding',
    question: {_type: 'reference', _ref: q._id},
    questionText: q.question,
    category: q.category,
    verdict: verdict.verdict,
    priority: verdict.priority,
    headline: verdict.headline,
    explanation: verdict.explanation,
    suggestedFix: verdict.suggestedFix,
    siteAnswer: kb.answer,
    siteFound: kb.found,
    siteCitations: kb.citations.map((c) => ({_key: c.id.replace(/[^a-zA-Z0-9]/g, '').slice(-12), _type: 'citation', title: c.title, url: c.url})),
    salesEvidence: evidence.picks.map((p, i) => ({
      _key: `e${i}`,
      _type: 'evidence',
      answer: {_type: 'reference', _ref: p.id},
      quote: p.quote,
      client: p.record.client ?? null,
    })),
    retrievalCheck: {
      searches: [...kb.searches, ...pageText.terms.map((t) => `page text: ${t}`)],
      pageTextHits: pageText.hits.map((h) => h.page.url),
      verdictChanged,
    },
    review: kept?.review ?? 'unreviewed',
    ...(kept?.duplicateOf ? {duplicateOf: {_type: 'reference', _ref: kept.duplicateOf._ref}} : {}),
    runId,
  })
  const tokens = kb.tokens + evidence.tokens + pageText.tokens + verdict.tokens
  console.log(
    `#${String(q.number).padStart(2)} ${verdict.verdict.padEnd(13)} ${verdict.priority.padEnd(6)} kb:${kb.found ? 'found' : 'none '} sales:${evidence.picks.length} pages:${pageText.hits.length}${verdictChanged ? ' (agent missed, page text answers)' : ''} ${Math.round((Date.now() - started) / 1000)}s ${tokens}tok · ${verdict.headline}`,
  )
  return tokens
}

console.log(
  `probing ${questions.length} questions${remaining ? ` (${picked.length} without a finding)` : ''}, ${CONCURRENCY} at a time${budget ? `, budget $${budget}` : ''}, run ${runId}`,
)
const queue = [...questions].sort((a, b) => a.number - b.number)
let total = 0
await Promise.all(
  Array.from({length: CONCURRENCY}, async () => {
    for (let q = queue.shift(); q; q = queue.shift()) {
      if (budget && (await spent()) >= budget) {
        console.log(`#${q.number} not started: budget $${budget} reached`)
        continue
      }
      try {
        const tokens = await probe(q)
        total += tokens
      } catch (error) {
        console.log(`#${q.number} FAILED: ${error instanceof Error ? error.message : error}`)
      }
    }
  }),
)
await new Promise((r) => setTimeout(r, 15_000)) // let the Gateway catch up on usage
console.log(`done · ${total} tokens · $${(await spent()).toFixed(2)} spent`)
