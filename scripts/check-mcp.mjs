// Smoke test for a Sanity Context MCP endpoint. Prints status, server info and tool names; never prints the token.
// Usage: npm run check:mcp -- [live|kb] [--kb <knowledgeBaseId>] [--full] [--schemas] [--call <tool> '<json args>']
const endpoint = process.argv[2] === 'kb' ? 'SANITY_MCP_KB_URL' : 'SANITY_MCP_LIVE_URL'
const kbAt = process.argv.indexOf('--kb')
const url = kbAt > 0 ? `${process.env[endpoint]}?mode=knowledge_base&knowledgeBases=${process.argv[kbAt + 1]}` : process.env[endpoint]
if (!url || !process.env.SANITY_ORG_TOKEN) throw new Error(`Set ${endpoint} and SANITY_ORG_TOKEN in .env.local`)
const auth = {Authorization: `Bearer ${process.env.SANITY_ORG_TOKEN}`}

const icUrl = new URL(url)
icUrl.pathname = icUrl.pathname.replace(/\/$/, '') + '/initial-context'
const ic = await fetch(icUrl, {headers: auth})
const icText = await ic.text()
console.log('initial-context', ic.status, process.argv.includes('--full') ? `\n${icText}` : icText.slice(0, 400).replace(/\s+/g, ' '))

async function rpc(body, session) {
  const r = await fetch(url, {
    method: 'POST',
    headers: {...auth, 'content-type': 'application/json', accept: 'application/json, text/event-stream', ...(session && {'mcp-session-id': session})},
    body: JSON.stringify(body),
  })
  const text = await r.text()
  const payload = text.includes('data:') ? text.split('\n').filter((l) => l.startsWith('data:')).pop().slice(5) : text
  return {status: r.status, session: r.headers.get('mcp-session-id'), json: payload ? JSON.parse(payload) : {}}
}

const init = await rpc({jsonrpc: '2.0', id: 1, method: 'initialize', params: {protocolVersion: '2025-06-18', capabilities: {}, clientInfo: {name: 'check-mcp', version: '0'}}})
console.log('initialize', init.status, init.json.result?.serverInfo ?? init.json.error)
await rpc({jsonrpc: '2.0', method: 'notifications/initialized'}, init.session)
const tools = await rpc({jsonrpc: '2.0', id: 2, method: 'tools/list'}, init.session)
console.log('tools', tools.status, (tools.json.result?.tools ?? []).map((t) => t.name), tools.json.error ?? '')

if (process.argv.includes('--schemas')) {
  for (const t of tools.json.result?.tools ?? []) console.log(`\n${t.name}: ${t.description}\n${JSON.stringify(t.inputSchema)}`)
}
const callAt = process.argv.indexOf('--call')
if (callAt > 0) {
  const name = process.argv[callAt + 1]
  const args = JSON.parse(process.argv[callAt + 2] ?? '{}')
  const res = await rpc({jsonrpc: '2.0', id: 3, method: 'tools/call', params: {name, arguments: args}}, init.session)
  console.log(`\ncall ${name}`, res.status, JSON.stringify(res.json.result ?? res.json.error, null, 2).slice(0, 30000))
}
