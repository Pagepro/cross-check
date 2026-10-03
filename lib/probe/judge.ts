import 'server-only'

import {generateText, Output} from 'ai'
import {z} from 'zod'

import {MODELS} from '../models'

export type SalesAnswer = {_id: string; topic: string; client?: string | null; text: string}
export type PageText = {_id: string; title: string; url: string; body: string}

// ---------- Which sales answers speak to this question

const salesPickSchema = z.object({
  picks: z.array(z.object({id: z.string(), quote: z.string().describe('The exact words from that record that answer the question')})),
})

export async function pickSalesEvidence(question: string, sales: SalesAnswer[]) {
  const {output, usage} = await generateText({
    model: MODELS.judge,
    system:
      'You match a buyer question to records of what a sales team told clients. Pick only records that directly answer the question (a figure, a term, a commitment). ' +
      'Copy the quote verbatim from the record. Pick none if no record answers it.',
    prompt: `QUESTION: ${question}\n\nRECORDS:\n${sales.map((s) => `[${s._id}] (${s.topic}) ${s.text}`).join('\n')}`,
    output: Output.object({schema: salesPickSchema}),
  })
  const byId = new Map(sales.map((s) => [s._id, s]))
  const picks = output.picks.filter((p) => byId.has(p.id) && byId.get(p.id)!.text.includes(p.quote.slice(0, 40)))
  return {picks: picks.map((p) => ({...p, record: byId.get(p.id)!})), tokens: usage.totalTokens ?? 0}
}

// ---------- Before filing a gap: search the page text itself, independent of the Knowledge Base

const termsSchema = z.object({terms: z.array(z.string()).describe('6 to 10 short words or phrases the site would use if it answered this')})

export async function searchPageText(question: string, pages: PageText[]) {
  const {output, usage} = await generateText({
    model: MODELS.judge,
    system: 'List short search terms (single words or two-word phrases, lowercase) that a web page answering this question would contain. Include synonyms.',
    prompt: question,
    output: Output.object({schema: termsSchema}),
  })
  const terms = output.terms.map((t) => t.toLowerCase().trim()).filter((t) => t.length > 2)
  const hits: {page: PageText; paragraphs: string[]}[] = []
  for (const page of pages) {
    const paragraphs = page.body.split(/\n\n+/).filter((p) => terms.some((t) => p.toLowerCase().includes(t)))
    if (paragraphs.length) hits.push({page, paragraphs})
  }
  // Most matching paragraphs first; cap what the judge reads.
  hits.sort((a, b) => b.paragraphs.length - a.paragraphs.length)
  return {terms, hits: hits.slice(0, 8).map((h) => ({...h, paragraphs: h.paragraphs.slice(0, 6)})), tokens: usage.totalTokens ?? 0}
}

// ---------- The verdict

export const verdictSchema = z.object({
  verdict: z.enum(['gap', 'ambiguity', 'contradiction', 'covered']),
  priority: z.enum(['high', 'medium', 'low']).describe('high = the answer changes what the buyer pays or signs (prices, rates, payment, SLA fees, contract terms)'),
  headline: z.string().describe('One line an editor understands, naming the topic and the mismatch, e.g. "Senior rate: site says nothing, offers quoted a specific band"'),
  explanation: z.string().describe('Two or three sentences: what the site says, what sales said, why that is a problem'),
  suggestedFix: z.string().describe('What to add or change on which page, concretely'),
  siteAnswersIt: z.boolean().describe('false if the site, including the page-text excerpts, does not answer the question'),
})

const JUDGE_SYSTEM = `You audit a company's website against what its sales team actually told prospects.

Verdicts:
- "gap": buyers ask this, but the site does not answer it (sales had to answer it by email). Only use it when neither the knowledge-base answer nor the page-text excerpts answer the question.
- "ambiguity": the site answers it, but in a way a buyer could read two ways, or so vaguely that sales had to clarify.
- "contradiction": the site states something that disagrees with what sales told clients, or the site disagrees with itself.
- "covered": the site answers it clearly and consistently with sales.

Different figures for different scopes, tiers or dates are not a contradiction by themselves; say so when that is the case.
If the page-text excerpts answer the question even though the knowledge-base agent did not find it, the verdict cannot be "gap".
Write for the editor who will fix the page. Quote figures exactly.`

export async function judge(input: {
  question: string
  category: string
  kb: {found: boolean; answer: string; citations: {title: string; url: string}[]}
  pageText: {terms: string[]; hits: {page: PageText; paragraphs: string[]}[]}
  sales: {quote: string; record: SalesAnswer}[]
}) {
  const excerpts = input.pageText.hits.length
    ? input.pageText.hits.map((h) => `From ${h.page.url}:\n${h.paragraphs.map((p) => `  > ${p}`).join('\n')}`).join('\n\n')
    : '(no page text matched the search terms)'
  const {output, usage} = await generateText({
    model: MODELS.judge,
    system: JUDGE_SYSTEM,
    prompt: `QUESTION (${input.category}): ${input.question}

KNOWLEDGE-BASE AGENT (found: ${input.kb.found}):
${input.kb.answer}
Cited: ${input.kb.citations.map((c) => c.url).join(', ') || 'none'}

PAGE-TEXT SEARCH (terms: ${input.pageText.terms.join(', ')}):
${excerpts}

WHAT SALES TOLD CLIENTS:
${input.sales.map((s) => `- ${s.record.client ?? 'unnamed client'}: "${s.quote}"`).join('\n') || '(no sales record answers this)'}`,
    output: Output.object({schema: verdictSchema}),
  })
  return {...output, tokens: usage.totalTokens ?? 0}
}
