import {describe, expect, test} from 'vitest'

import {DRIFT_PRIORITY, driftVerdict, type Grade} from '../lib/probe/drift'

const v = (alone: Grade, withSearch: Grade, kbConflicted = false) => driftVerdict({alone, withSearch, kbConflicted})

describe('driftVerdict', () => {
  test('both right is aligned', () => {
    expect(v('correct', 'correct')).toBe('aligned')
  })

  test('wrong alone, right with search: the model is out of date, the site works', () => {
    expect(v('wrong', 'correct')).toBe('stale-priors')
    expect(v('evasive', 'correct')).toBe('stale-priors')
  })

  test('right alone, wrong with search: search pointed the wrong way', () => {
    expect(v('correct', 'wrong')).toBe('search-misled')
  })

  test('an evasive search answer is not "misled": the site was in reach and the fact did not come through', () => {
    expect(v('correct', 'evasive')).toBe('not-communicated')
    expect(v('evasive', 'evasive')).toBe('not-communicated')
  })

  test('wrong with the site in reach is the real finding', () => {
    expect(v('wrong', 'wrong')).toBe('not-communicated')
    expect(v('evasive', 'wrong')).toBe('not-communicated')
    expect(v('wrong', 'evasive')).toBe('not-communicated')
  })

  test('both answers diverge and the KB is itself conflicted: the world guesses for us', () => {
    expect(v('wrong', 'wrong', true)).toBe('world-guesses')
    expect(v('correct', 'wrong', true)).toBe('world-guesses')
    expect(v('wrong', 'correct', true)).toBe('world-guesses')
  })

  test('a conflicted KB does not turn agreement into a finding', () => {
    expect(v('correct', 'correct', true)).toBe('aligned')
  })

  test('priority follows the verdict', () => {
    expect(DRIFT_PRIORITY[v('wrong', 'wrong')]).toBe('high')
    expect(DRIFT_PRIORITY[v('wrong', 'wrong', true)]).toBe('high')
    expect(DRIFT_PRIORITY[v('correct', 'wrong')]).toBe('medium')
    expect(DRIFT_PRIORITY[v('wrong', 'correct')]).toBe('low')
    expect(DRIFT_PRIORITY[v('correct', 'correct')]).toBe('low')
  })
})
