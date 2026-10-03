// What did the knowledge base build file as issues? Conflicts list both sides with their sources.
// Read-only, uses the server token. Usage: npm run check:kb-issues -- [knowledgeBaseId]
import {createClient} from '@sanity/client'

const token = process.env.SANITY_ORG_TOKEN
if (!token) throw new Error('Set SANITY_ORG_TOKEN in .env.local')
const kb = process.argv[2] ?? 'kbi0gfXDPOux'

const client = createClient({apiVersion: 'v2026-08-25', useCdn: false, token, resource: {type: 'knowledge-base', id: kb}, context: {organizationId: 'ofijSgqoX'}})
const issues = await client.context.issues.list()

const counts = {}
for (const i of issues) counts[`${i.status} ${i.content?.kind}`] = (counts[`${i.status} ${i.content?.kind}`] ?? 0) + 1
console.log(`${issues.length} issues`, counts)

for (const i of issues) {
  const c = i.content ?? {}
  console.log(`\n[${i.status} · ${c.kind} · ${c.severity}] ${c.scopePath ?? ''}\n  ${c.issue}`)
  for (const side of c.sides ?? []) console.log(`   - ${side.value ?? ''} | ${side.claim}`.slice(0, 220))
}
