// Public values are safe in the browser. Everything else must only be read on the server.
export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? 'missing-project-id'
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production'
export const apiVersion = '2026-09-01'

export function serverEnv(name: 'SANITY_WRITE_TOKEN' | 'SANITY_ORG_TOKEN' | 'SANITY_MCP_LIVE_URL' | 'SANITY_MCP_KB_URL') {
  const value = process.env[name]
  if (!value) throw new Error(`Missing env var ${name}. See .env.example.`)
  return value
}
