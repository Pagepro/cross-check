// Checks that the model and Anthropic's provider-executed web search pass the AI Gateway (stage 4 depends on both).
// Usage: npm run spike:gateway
import {anthropic} from '@ai-sdk/anthropic'
import {generateText} from 'ai'

import {MODELS} from '../lib/models'

if (!process.env.AI_GATEWAY_API_KEY) {
  console.error('Set AI_GATEWAY_API_KEY first (Vercel dashboard → AI Gateway → API keys).')
  process.exit(1)
}

const started = Date.now()
try {
  const result = await generateText({
    model: MODELS.agent,
    tools: {web_search: anthropic.tools.webSearch_20260318({maxUses: 5})},
    prompt: 'Do unused support hours roll over to the next month at Pagepro (pagepro.co)? Answer in one sentence and name the page.',
  })
  const calls = result.steps.flatMap((s) => s.toolCalls.map((c) => c.toolName))
  const sources = result.sources.flatMap((s) => (s.sourceType === 'url' ? [s.url] : []))
  console.log(`web_search through the Gateway: ok in ${Date.now() - started} ms · tool calls: ${calls.join(', ') || 'none'} · ${sources.length} sources`)
  console.log(sources.slice(0, 5).join('\n'))
  console.log(`\n${result.text}`)
} catch (error) {
  console.log(`web_search through the Gateway: FAILED in ${Date.now() - started} ms\n${error instanceof Error ? error.message : error}`)
  process.exitCode = 1
}
