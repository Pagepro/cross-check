// Loads the sales corpus (data/*.json, parsed from the Cross-Check concept page) into the private `pagepro` dataset.
// Run: npx sanity exec scripts/stage2/load-corpus.mjs --with-user-token
import {readFile} from 'node:fs/promises'

import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2026-09-01'}).withConfig({dataset: 'pagepro'})
const sales = JSON.parse(await readFile('data/sales-answers.json', 'utf8'))
const questions = JSON.parse(await readFile('data/buyer-questions.json', 'utf8'))

// The corpus files were written in Polish. Everything stored here is English, so the Studio needs no translation layer.
const CATEGORY = {
  Wycena: 'Pricing',
  'Terminy i start': 'Timeline and start',
  Zespół: 'Team',
  'Dowody i referencje': 'Proof and references',
  'NDA, IP i umowy': 'NDA, IP and contracts',
  'Proces i przejęcie': 'Process and takeover',
  'Bezpieczeństwo i dane': 'Security and data',
  'Wsparcie i SLA': 'Support and SLA',
  Stawki: 'Rates',
  'Ryzyko, exit i AI': 'Risk, exit and AI',
  Płatności: 'Payments',
}
const PRIOR_LABEL = {luka: 'gap', pokryte: 'covered', 'sprzeczność': 'contradiction', 'słabe': 'weak'}
const en = (map, value) => (value ? (map[value] ?? value) : value)

const tx = client.transaction()
sales.forEach((s, i) =>
  tx.createOrReplace({
    _id: `salesAnswer.${String(i + 1).padStart(2, '0')}`,
    _type: 'salesAnswer',
    topic: s.topic,
    client: s.clients.join(', ') || null,
    text: s.text,
  }),
)
for (const q of questions) {
  tx.createOrReplace({
    _id: `buyerQuestion.${String(q.number).padStart(2, '0')}`,
    _type: 'buyerQuestion',
    number: q.number,
    category: en(CATEGORY, q.topic),
    question: q.text,
    priorLabel: en(PRIOR_LABEL, q.label),
  })
}
await tx.commit()
console.log(`loaded ${sales.length} sales answers and ${questions.length} buyer questions`)
