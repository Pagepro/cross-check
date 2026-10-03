// How many of the 87 buyer questions does our site answer? A measured number for the post, stored on each question.
// Per question: the Knowledge Base agent answers; the page text is searched independently (as in stage 2); one call
// decides from both whether the site answers it: yes, partly (some of it, or only vaguely), or no.
// Usage: npm run coverage (skips questions already checked) · -- --force (recheck all) · -- 24 44 (only those numbers)
import {generateText, Output} from 'ai'
import {z} from 'zod'

import {MODELS} from '../../lib/models'
import {searchPageText, type PageText} from '../../lib/probe/judge'
import {askKnowledgeBase} from '../../lib/probe/kb-agent'
import {pageproClient} from '../../lib/sanity/client'

const CONCURRENCY = 4
const client = pageproClient()
const only = process.argv.slice(2).map(Number).filter(Boolean)

const [questions, pages] = await Promise.all([
  client.fetch<{_id: string; number: number; question: string; priorLabel?: string}[]>(
    `*[_type == "buyerQuestion" ${only.length ? '&& number in $only' : process.argv.includes('--force') ? '' : '&& !defined(siteCoverage)'}] | order(number asc){_id, number, question, priorLabel}`,
    {only},
  ),
  client.fetch<PageText[]>(`*[_type == "kbSource"]{_id, title, url, body}`),
])

const coverageSchema = z.object({
  answers: z.enum(['yes', 'partly', 'no']).describe('yes = a buyer gets the fact; partly = some of it, or only vaguely; no = the site does not answer it'),
  reason: z.string().describe('One short sentence'),
})

async function check(q: (typeof questions)[number]) {
  const [kb, pageText] = await Promise.all([askKnowledgeBase(q.question, {brief: true}), searchPageText(q.question, pages)])
  const excerpts = pageText.hits.map((h) => `From ${h.page.url}:\n${h.paragraphs.map((p) => `  > ${p}`).join('\n')}`).join('\n\n')
  const {output} = await generateText({
    model: MODELS.judge,
    system:
      'You decide whether a company website answers a buyer question. Use the knowledge-base answer and the page excerpts. ' +
      'A generic statement that does not give the buyer the fact they asked for is "partly" at best. If neither source answers it, say "no".',
    prompt: `QUESTION: ${q.question}\n\nKNOWLEDGE-BASE ANSWER (found: ${kb.found}):\n${kb.answer}\n\nPAGE EXCERPTS:\n${excerpts || '(none matched)'}`,
    output: Output.object({schema: coverageSchema}),
  })
  await client
    .patch(q._id)
    .set({
      siteCoverage: output.answers,
      siteCoverageReason: output.reason,
      siteCoverageAnswer: kb.answer,
      siteCoverageCitations: kb.citations.map((c) => c.url),
      siteCoverageCheckedAt: new Date().toISOString(),
    })
    .commit()
  console.log(`#${String(q.number).padStart(2)} ${output.answers.padEnd(6)} (corpus: ${q.priorLabel ?? '—'}) · ${q.question}`)
  return {number: q.number, answers: output.answers, prior: q.priorLabel}
}

const queue = [...questions]
const results: Awaited<ReturnType<typeof check>>[] = []
await Promise.all(
  Array.from({length: CONCURRENCY}, async () => {
    for (let q = queue.shift(); q; q = queue.shift()) {
      try {
        results.push(await check(q))
      } catch (error) {
        console.log(`#${q.number} FAILED: ${error instanceof Error ? error.message : error}`)
      }
    }
  }),
)
// Totals cover every question checked so far, not just this run.
const allChecked = await client.fetch<{number: number; answers: string; prior?: string}[]>(
  `*[_type == "buyerQuestion" && defined(siteCoverage)]{number, "answers": siteCoverage, "prior": priorLabel}`,
)
console.log(`this run: ${results.length} checked`)
const count = (a: string) => allChecked.filter((r) => r.answers === a).length
const labelledGaps = allChecked.filter((r) => r.prior === 'gap')
console.log(`\nall checked so far: ${allChecked.length} of 87 · yes ${count('yes')} · partly ${count('partly')} · no ${count('no')}`)
console.log(`of the ${labelledGaps.length} the corpus marked as gaps: no ${labelledGaps.filter((r) => r.answers === 'no').length}, partly ${labelledGaps.filter((r) => r.answers === 'partly').length}, yes ${labelledGaps.filter((r) => r.answers === 'yes').length}`)
