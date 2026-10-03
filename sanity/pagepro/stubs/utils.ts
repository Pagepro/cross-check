// Stand-in for the Pagepro web app's `@/lib/utils`, which the exported schema imports but the export omits.

/** "3 offices", "1 question", "2 case studies": a count with its noun, for list previews. */
export function count(items: unknown[] | null | undefined, noun: string, plural = `${noun}s`) {
  const n = items?.length ?? 0
  return `${n} ${n === 1 ? noun : plural}`
}
