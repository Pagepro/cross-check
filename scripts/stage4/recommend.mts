// Write the suggested fix onto stage 4 rows that missed, from the stored answers and grades: no web search, no KB agent.
// Use it to fill a run made before fixes existed, or after changing lib/probe/recommend.ts.
// Usage: npm run stage4:recommend              latest run, rows without a fix
//        npm run stage4:recommend -- --force   latest run, rewrite every fix
//        npm run stage4:recommend -- 20261002-1130
import {type DriftVerdict} from '../../lib/probe/drift'
import {type CitedPage, recommendFix} from '../../lib/probe/recommend'
import {pageproClient} from '../../lib/sanity/client'

const CONCURRENCY = 4

type Row = {
  _id: string
  questionNumber?: number
  questionText: string
  verdict: DriftVerdict
  alone: string
  aloneGradeReason?: string
  withSearch: string
  withSearchGradeReason?: string
  searchSources?: string[]
  withKb: string
  kbConflicted?: boolean
  pages: CitedPage[]
  suggestedFix?: string
}

const client = pageproClient()
const args = process.argv.slice(2)
const runId: string =
  args.find((a) => /^\d{8}-\d{4}$/.test(a)) ??
  (await client.fetch(`*[_type == "comparison" && defined(runId)] | order(runAt desc)[0].runId`))

const rows = await client.fetch<Row[]>(
  `*[_type == "comparison" && runId == $runId && verdict != "aligned"] | order(order asc){
    _id, questionNumber, questionText, verdict, alone, aloneGradeReason, withSearch, withSearchGradeReason, searchSources,
    withKb, kbConflicted, suggestedFix,
    "pages": *[_type == "kbSource" && url in ^.citations[].url]{title, url, body}
  }`,
  {runId},
)
const todo = args.includes('--force') ? rows : rows.filter((r) => !r.suggestedFix)
console.log(`run ${runId}: ${todo.length} of ${rows.length} rows that missed need a fix`)

const queue = [...todo]
await Promise.all(
  Array.from({length: CONCURRENCY}, async () => {
    for (let r = queue.shift(); r; r = queue.shift()) {
      try {
        const fix = await recommendFix({
          question: r.questionText,
          verdict: r.verdict as Exclude<DriftVerdict, 'aligned'>,
          kb: {answer: r.withKb, conflicted: Boolean(r.kbConflicted), pages: r.pages},
          alone: {answer: r.alone, reason: r.aloneGradeReason},
          withSearch: {answer: r.withSearch, reason: r.withSearchGradeReason, sources: r.searchSources ?? []},
        })
        await client.patch(r._id).set({suggestedFix: fix.suggestedFix}).commit()
        console.log(`#${String(r.questionNumber).padStart(2)} ${r.verdict.padEnd(17)} ${fix.tokens}tok · ${fix.suggestedFix}`)
      } catch (error) {
        console.log(`#${r.questionNumber} FAILED: ${error instanceof Error ? error.message : error}`)
      }
    }
  }),
)
