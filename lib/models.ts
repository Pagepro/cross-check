// Every model id lives here. AI Gateway routes them; swap a string to change provider.
export const MODELS = {
  // Grades answers and judges findings.
  judge: 'anthropic/claude-sonnet-5',
  // The Knowledge Base agent, and the same model without the KB (stage 4).
  agent: 'anthropic/claude-sonnet-5',
} as const
