import 'server-only'

import {anthropic} from '@ai-sdk/anthropic'
import {generateText, isStepCount, Output} from 'ai'
import {z} from 'zod'

import {connectContext} from '../context/mcp'
import {MODELS} from '../models'
import {pageproClient} from '../sanity/client'

const SYSTEM = `You answer a prospective client's question about Pagepro, a Next.js and Sanity development agency, using ONLY the knowledge base.

- Search before answering, and run at least three searches with different wordings: matching is by exact keywords, so try synonyms and the words the site itself would use ("price", "rate", "cost"; "onboarding", "new clients", "receive").
- Search with return: "entries" and limit 3, so each hit comes back with its full text. Read the text of every hit before deciding; a hit on a broad entry (company, process) often holds the one sentence you need.
- Answer only from what the entries say. Quote figures exactly. Do not use anything you know about Pagepro from elsewhere.
- Only set "found" to false after those searches and reads turned up nothing. Then say plainly that the knowledge base does not answer it. Never fill the gap.
- If entries disagree, give every value and say they disagree.
- In "sources", copy the titles from the "## Sources" list of the entries you used, exactly as written, without the trailing " — Dataset".`

const BRIEF = '\n- Keep "answer" to at most three short sentences a buyer reads at a glance: the concrete fact first, then the condition that matters.'

const answerSchema = z.object({
  found: z.boolean().describe('false when the knowledge base does not answer the question'),
  answer: z.string(),
  conflicted: z.boolean().describe('true when the entries you read give disagreeing values for what the question asks'),
  sources: z.array(z.string()).describe('source titles from the entries you relied on'),
  searches: z.array(z.string()).describe('the keyword searches you ran'),
})

export type KbAnswer = z.infer<typeof answerSchema> & {citations: {id: string; title: string; url: string}[]; tokens: number}

/** The Knowledge Base agent: reads the Pagepro site KB through Context MCP (Knowledge Base mode). */
export async function askKnowledgeBase(question: string, opts: {brief?: boolean} = {}): Promise<KbAnswer> {
  const context = await connectContext('kb')
  try {
    const result = await generateText({
      model: MODELS.agent,
      system: `${SYSTEM}${opts.brief ? BRIEF : ''}\n\n${context.initialContext}`,
      tools: context.tools,
      stopWhen: isStepCount(16),
      prompt: question,
      output: Output.object({schema: answerSchema}),
    })
    // Entries list their sources by page title; map those titles back to the page URLs. Titles carry stray tabs and
    // double spaces, and the agent does not always copy them exactly, so compare them normalised.
    const norm = (t: string) => t.replace(/\s+—\s+Dataset$/, '').replace(/\s+/g, ' ').trim().toLowerCase()
    const wanted = new Set(result.output.sources.map(norm).filter(Boolean))
    const pages = wanted.size
      ? await pageproClient().fetch<{id: string; title: string; url: string}[]>(`*[_type == "kbSource"]{"id": _id, title, url}`)
      : []
    const citations = pages.filter((p) => wanted.has(norm(p.title)))
    return {...result.output, citations, tokens: result.totalUsage.totalTokens ?? 0}
  } finally {
    await context.close()
  }
}

const PLAIN_SYSTEM = "You answer a prospective client's question about Pagepro, a Next.js and Sanity development agency. Answer briefly from what you know."
const BRIEF_PLAIN = ' At most three short sentences.'

/** Baseline for comparison: the same model with no knowledge base and no web search. */
export async function askWithoutKnowledgeBase(question: string, opts: {brief?: boolean} = {}) {
  const result = await generateText({
    model: MODELS.agent,
    system: PLAIN_SYSTEM + (opts.brief ? BRIEF_PLAIN : ''),
    prompt: question,
  })
  return {answer: result.text, tokens: result.totalUsage.totalTokens ?? 0}
}

/**
 * What a buyer gets today from an assistant with web access: the same model and the same system prompt as
 * `askWithoutKnowledgeBase`, plus Anthropic's web search, so the only variable is the tool. Passes the AI Gateway
 * (checked with `npm run spike:gateway -- --web-search`).
 */
export async function askWithWebSearch(question: string, opts: {brief?: boolean} = {}) {
  const result = await generateText({
    model: MODELS.agent,
    system: PLAIN_SYSTEM + (opts.brief ? BRIEF_PLAIN : ''),
    tools: {web_search: anthropic.tools.webSearch_20260318({maxUses: 5})},
    prompt: question,
  })
  const sources = [...new Set(result.sources.flatMap((s) => (s.sourceType === 'url' ? [s.url] : [])))]
  return {answer: finalAnswer(result.content) || result.text, sources, tokens: result.totalUsage.totalTokens ?? 0}
}

/** The answer itself: text after the last tool result, without the "let me search…" narration between searches. */
function finalAnswer(content: {type: string; text?: string}[]) {
  const lastTool = content.findLastIndex((part) => part.type === 'tool-result')
  return content
    .slice(lastTool + 1)
    .flatMap((part) => (part.type === 'text' && part.text ? [part.text] : []))
    .join('')
    .trim()
}
