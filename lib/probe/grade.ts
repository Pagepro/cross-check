import {generateText, type LanguageModel, Output} from 'ai'
import {z} from 'zod'

import {MODELS} from '../models'

export const gradeSchema = z.object({
  grade: z.enum(['wrong', 'evasive', 'correct']),
  matchedClaimId: z.string().nullable().describe('Id of the claim the answer repeats, or null'),
  reason: z.string().describe('One short sentence'),
})

export type Grade = z.infer<typeof gradeSchema>

/**
 * Grade one assistant answer against the conflicting claims.
 * Before a ruling: "correct" = states one claim AND flags the uncertainty, or tells the customer to confirm.
 * After a ruling: "correct" = states the ruled truth.
 */
export async function gradeAnswer(
  input: {question: string; answer: string; claims: {id: string; quote: string; pageUrl: string}[]; truthClaimId?: string; correctedValue?: string},
  model: LanguageModel = MODELS.judge,
): Promise<Grade> {
  const truth = input.truthClaimId
    ? `The site owner ruled that claim ${input.truthClaimId} is true.`
    : input.correctedValue
      ? `The site owner ruled the true value is: ${input.correctedValue}.`
      : 'No ruling yet: the true value is unknown.'
  const {output} = await generateText({
    model,
    system:
      'You grade what an AI assistant told a customer. Grades: "correct" (states the true fact; before a ruling, states a fact AND says it may vary or should be confirmed), ' +
      '"evasive" (no concrete answer, or only "check the website"), "wrong" (states a value confidently that is not the truth, or before a ruling states one of the conflicting values as certain).',
    prompt: `QUESTION: ${input.question}\n\nCLAIMS ON THE SITE:\n${input.claims
      .map((c) => `- id=${c.id} (${c.pageUrl}): "${c.quote}"`)
      .join('\n')}\n\n${truth}\n\nANSWER TO GRADE:\n${input.answer}`,
    output: Output.object({schema: gradeSchema}),
  })
  const known = new Set(input.claims.map((c) => c.id))
  return {...output, matchedClaimId: output.matchedClaimId && known.has(output.matchedClaimId) ? output.matchedClaimId : null}
}
