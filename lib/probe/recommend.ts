import 'server-only'

import {generateText, Output} from 'ai'
import {z} from 'zod'

import {MODELS} from '../models'
import {DRIFT_VERDICTS, type DriftVerdict} from './drift'

// Stage 4 suggested fix: the drift tab says which fact does not reach buyers; this says what the editor changes so it does.

export type CitedPage = {title: string; url: string; body: string}

const PAGE_CHARS = 6000

const fixSchema = z.object({
  suggestedFix: z.string().describe('What to add, clarify or change on which page: at most three sentences, under 450 characters'),
})

const SYSTEM = `You advise the editor of a company's website. A buyer question was answered three ways: by a model from memory, by the same model with web search, and by an agent reading the site's own Knowledge Base, which is the truth to grade against. The outside answers missed. Say what to change on the site so the fact reaches buyers who ask an AI assistant.

Fit the advice to why the answers missed:
- "Not communicated": the site states the fact, but search did not surface it or it was too buried or hedged to quote. Point to the page that should state it plainly, near the top, in a sentence that can be quoted on its own, and say where the current wording hides it.
- "World guesses for us": the site disagrees with itself. Name each page and the value it gives, and say which wording to align, or how to state that the figures cover different scopes if that is why they differ.
- "Search misled": something the search read points the wrong way. Name that source if it is one of ours, and what to correct; if it is a third party, say which of our pages should state the fact more clearly to outweigh it.
- "Stale priors": search already gets it right; only suggest something if the page could state the fact more directly. Keep it to one sentence.

Name pages by their path, and only pages listed under "pages the Knowledge Base cited" or "pages it read"; never guess a page that may not exist. Quote figures exactly as the Knowledge Base gives them. Do not invent facts the Knowledge Base does not state.
Write for the editor who will fix the page, not for the buyer: plain words, no labels from these instructions, at most three sentences. Lead with the page and the change; a short example sentence to add is welcome.`

export async function recommendFix(input: {
  question: string
  verdict: Exclude<DriftVerdict, 'aligned'>
  kb: {answer: string; conflicted: boolean; pages: CitedPage[]}
  alone: {answer: string; reason?: string}
  withSearch: {answer: string; reason?: string; sources: string[]}
}) {
  const verdict = DRIFT_VERDICTS.find((v) => v.value === input.verdict)!
  const pages = input.kb.pages.length
    ? input.kb.pages.map((p) => `--- ${p.url} (${p.title})\n${p.body.slice(0, PAGE_CHARS)}`).join('\n\n')
    : '(no cited page text)'
  const {output, usage} = await generateText({
    model: MODELS.judge,
    system: SYSTEM,
    prompt: `QUESTION: ${input.question}

VERDICT: "${verdict.title}": ${verdict.meaning}

KNOWLEDGE BASE ANSWER${input.kb.conflicted ? ' (the entries disagree with each other)' : ''}:
${input.kb.answer}

MODEL FROM MEMORY:
${input.alone.answer}
Why it missed: ${input.alone.reason ?? 'graded correct'}

MODEL WITH WEB SEARCH:
${input.withSearch.answer}
Why it missed: ${input.withSearch.reason ?? 'graded correct'}
Pages it read: ${input.withSearch.sources.join(', ') || 'none'}

PAGES THE KNOWLEDGE BASE CITED:
${pages}`,
    output: Output.object({schema: fixSchema}),
  })
  return {suggestedFix: output.suggestedFix, tokens: usage.totalTokens ?? 0}
}
