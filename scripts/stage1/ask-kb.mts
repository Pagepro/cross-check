// Stage 1 checks: the Knowledge Base agent cites pages, admits what is missing, finds a specific fact,
// and differs from the same model without the KB. Usage: npm run stage1 · npm run stage1 -- "your question"
import {askKnowledgeBase, askWithoutKnowledgeBase} from '../../lib/probe/kb-agent'

const CHECKS = [
  {kind: 'on the site', question: 'How long does it take to see a demo of our site rebuilt with Nexity?'},
  {kind: 'not on the site', question: 'Do you hold ISO 27001 certification?'},
  {kind: 'specific fact', question: 'Do unused support hours roll over to the next month?'},
  {kind: 'compare', question: 'How many people work at Pagepro?'},
]

const custom = process.argv.slice(2).join(' ').trim()
const checks = custom ? [{kind: 'custom', question: custom}] : CHECKS

for (const check of checks) {
  const [kb, plain] = await Promise.all([askKnowledgeBase(check.question), askWithoutKnowledgeBase(check.question)])
  console.log(`\n=== [${check.kind}] ${check.question}`)
  console.log(`KB agent (found: ${kb.found}, searches: ${kb.searches.join(' | ')}):\n${kb.answer}`)
  console.log(kb.citations.length ? kb.citations.map((c) => `  ↳ ${c.title} — ${c.url}`).join('\n') : '  ↳ no citations')
  console.log(`Without KB:\n${plain.answer}`)
}
