// Recompute stage 4 verdicts from the stored grades, without calling any model. Run after changing lib/probe/drift.ts.
// Usage: npx sanity exec scripts/stage4/reverdict.mts --with-user-token   (latest run; pass a runId to pick another)
import {getCliClient} from 'sanity/cli'

import {DRIFT_PRIORITY, driftVerdict, type Grade} from '../../lib/probe/drift'

const client = getCliClient({apiVersion: '2026-09-01'}).withConfig({dataset: 'pagepro'})
const runId: string =
  process.argv.slice(2).find((a) => /^\d{8}-\d{4}$/.test(a)) ??
  (await client.fetch(`*[_type == "comparison" && defined(runId)] | order(runAt desc)[0].runId`))

const rows = await client.fetch<{_id: string; questionNumber: number; verdict: string; aloneGrade: Grade; withSearchGrade: Grade; kbConflicted?: boolean}[]>(
  `*[_type == "comparison" && runId == $runId]{_id, questionNumber, verdict, aloneGrade, withSearchGrade, kbConflicted}`,
  {runId},
)
const tx = client.transaction()
for (const r of rows) {
  const verdict = driftVerdict({alone: r.aloneGrade, withSearch: r.withSearchGrade, kbConflicted: Boolean(r.kbConflicted)})
  if (verdict !== r.verdict) console.log(`#${r.questionNumber} ${r.verdict} → ${verdict}`)
  tx.patch(r._id, (p) => p.set({verdict, priority: DRIFT_PRIORITY[verdict]}))
}
await tx.commit()
console.log(`run ${runId}: ${rows.length} verdicts recomputed`)
