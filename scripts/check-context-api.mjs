// Can the server token call the Context knowledge-base HTTP API (the API the `sanity context` CLI wraps)?
// Read-only: lists knowledge bases, then one knowledge base's sources and the first source's content. Never prints the token.
// Usage: npm run check:context-api -- [knowledgeBaseId] [url fragment to show that page's content] [line filter]
//        npm run check:context-api -- <knowledgeBaseId> --build   starts a build (a write) to test the token's permissions
const API = 'https://api.sanity.io/v2026-08-25/context'
const ORG = 'ofijSgqoX'
const token = process.env.SANITY_ORG_TOKEN
if (!token) throw new Error('Set SANITY_ORG_TOKEN in .env.local')
const headers = {Authorization: `Bearer ${token}`}

async function get(path) {
  const res = await fetch(`${API}${path}`, {headers})
  const text = await res.text()
  let body
  try {
    body = JSON.parse(text)
  } catch {
    body = text
  }
  return {status: res.status, body}
}

const list = await get(`/knowledge-bases?organizationId=${ORG}`)
console.log('list knowledge bases', list.status, list.status === 200 ? list.body.data.map((kb) => `${kb.publicId} "${kb.title}"`) : list.body)

const kb = process.argv[2]
const sourceAt = process.argv.indexOf('--source')
if (kb && sourceAt > 0) {
  const all = (await get(`/knowledge-bases/${kb}/sources?limit=100`)).body.data
  const hit = all.find((s) => `${s.externalId} ${s.filename}`.includes(process.argv[sourceAt + 1]))
  const one = await get(`/knowledge-bases/${kb}/sources/${hit.id}`)
  console.log('source', one.status, JSON.stringify(one.body, null, 2))
  const content = await get(`/knowledge-bases/${kb}/sources/${hit.id}/content?format=plain`)
  console.log('content', content.status, typeof content.body === 'string' ? content.body.slice(0, 1500) : JSON.stringify(content.body).slice(0, 1500))
} else if (kb && process.argv[3] === '--build') {
  const res = await fetch(`${API}/knowledge-bases/${kb}/build`, {method: 'POST', headers})
  console.log('start build', res.status, await res.text())
} else if (kb) {
  const all = []
  let cursor = ''
  let status = 200
  do {
    const page = await get(`/knowledge-bases/${kb}/sources?limit=100${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ''}`)
    status = page.status
    if (status !== 200) {
      console.log('\nlist sources', status, page.body)
      break
    }
    all.push(...page.body.data)
    cursor = page.body.nextCursor ?? ''
  } while (cursor)
  const byStatus = Object.groupBy(all, (s) => s.status)
  console.log(`\nlist sources ${status}: ${all.length} total`, Object.fromEntries(Object.entries(byStatus).map(([k, v]) => [k, v.length])))
  console.log((process.argv.includes('--list') ? all : all.slice(0, 8)).map((s) => `  ${s.status.padEnd(10)} ${String(s.sizeBytes).padStart(7)} ${s.kind} ${s.externalId ?? ''} ${s.canonicalUrl ?? s.filename}`).join('\n'))
  const match = process.argv[3]
  const first = all.find((s) => s.status !== 'skipped' && (!match || `${s.externalId ?? ''} ${s.canonicalUrl ?? s.filename}`.includes(match)))
  if (first) {
    const content = await get(`/knowledge-bases/${kb}/sources/${first.id}/content?format=json`)
    console.log(`\nsource content ${first.canonicalUrl ?? first.filename}`, content.status, content.status === 200 ? `${content.body.totalLines} lines\n${(process.argv[4] ? content.body.content.split("\n").flatMap((l, i, all) => (l.toLowerCase().includes(process.argv[4].toLowerCase()) ? [all.slice(Math.max(0, i - 3), i + 2).join("\n"), "…"] : [])).join("\n") : content.body.content.slice(0, process.argv[3] ? 4000 : 600))}` : content.body)
  }
}
