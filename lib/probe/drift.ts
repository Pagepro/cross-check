// Stage 4 verdict: what the world says about us, compared with what our own content says.
// Pure on purpose: computed in code from grades, not written by a model, so it can be counted, sorted and tested.

export type Grade = 'correct' | 'evasive' | 'wrong'

export type DriftVerdict = 'aligned' | 'stale-priors' | 'search-misled' | 'world-guesses' | 'not-communicated'

export const DRIFT_VERDICTS: {value: DriftVerdict; title: string; meaning: string}[] = [
  {value: 'not-communicated', title: 'Not communicated', meaning: 'The model had our site in reach and still answered wrong: the content exists but does not land.'},
  {value: 'world-guesses', title: 'World guesses for us', meaning: 'Our own content disagrees with itself, so the models fill the gap with a guess.'},
  {value: 'search-misled', title: 'Search misled', meaning: 'Right from memory, wrong after searching: something on the web points the wrong way.'},
  {value: 'stale-priors', title: 'Stale priors', meaning: 'Wrong from memory, right once it searched: the site works, the model is out of date.'},
  {value: 'aligned', title: 'Aligned', meaning: 'Both answers match what our content says.'},
]

export const DRIFT_PRIORITY: Record<DriftVerdict, 'high' | 'medium' | 'low'> = {
  'not-communicated': 'high',
  'world-guesses': 'high',
  'search-misled': 'medium',
  'stale-priors': 'low',
  aligned: 'low',
}

/**
 * Grades are against the Knowledge Base answer. The middle column decides, because it is what a buyer gets today:
 * - search right: aligned if memory was right too, otherwise the model is merely out of date (stale priors);
 * - search wrong while memory was right: something on the web points the wrong way (search misled);
 * - otherwise the site was in reach and the fact did not come through (not communicated). An evasive search answer
 *   ("contact them to confirm") counts here: the buyer leaves without the fact our content states.
 * When our own content disagrees with itself there is no single truth to grade against, so any miss is a guess
 * the world makes for us.
 */
export function driftVerdict(input: {alone: Grade; withSearch: Grade; kbConflicted: boolean}): DriftVerdict {
  const aloneRight = input.alone === 'correct'
  if (aloneRight && input.withSearch === 'correct') return 'aligned'
  if (input.kbConflicted) return 'world-guesses'
  if (input.withSearch === 'correct') return 'stale-priors'
  if (input.withSearch === 'wrong' && aloneRight) return 'search-misled'
  return 'not-communicated'
}
