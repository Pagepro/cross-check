import 'server-only'

import {createMCPClient} from '@ai-sdk/mcp'

import {serverEnv} from '../env'

type Endpoint = 'live' | 'kb'

/**
 * Connect to a Sanity Context MCP endpoint.
 * `live` = GROQ mode over the dataset, narrowed to one scan with groqFilter.
 * `kb`   = Knowledge Base mode over the curated demo (ground truth).
 */
export async function connectContext(endpoint: Endpoint, opts: {scanId?: string} = {}) {
  const base = serverEnv(endpoint === 'live' ? 'SANITY_MCP_LIVE_URL' : 'SANITY_MCP_KB_URL')
  const token = serverEnv('SANITY_ORG_TOKEN')

  const url = new URL(base)
  if (endpoint === 'live' && opts.scanId) {
    // groqFilter narrows the endpoint's own filter for this request only (it is not a security boundary).
    url.searchParams.set('groqFilter', `scan._ref == "${opts.scanId}" || _id == "${opts.scanId}"`)
  }

  const initialContextUrl = new URL(url)
  initialContextUrl.pathname = `${initialContextUrl.pathname.replace(/\/$/, '')}/initial-context`
  const initialContext = await fetch(initialContextUrl, {headers: {Authorization: `Bearer ${token}`}}).then((r) => {
    if (!r.ok) throw new Error(`Context initial-context ${r.status} for ${endpoint}`)
    return r.text()
  })

  const client = await createMCPClient({
    transport: {type: 'http', url: url.toString(), headers: {Authorization: `Bearer ${token}`}},
  })
  // initial_context is already inlined in the system prompt; drop the tool to save a round trip.
  const tools = await client.tools()
  delete tools.initial_context

  return {initialContext, tools, close: () => client.close()}
}

export function contextConfigured(endpoint: Endpoint) {
  return Boolean(process.env.SANITY_ORG_TOKEN && process.env[endpoint === 'live' ? 'SANITY_MCP_LIVE_URL' : 'SANITY_MCP_KB_URL'])
}
