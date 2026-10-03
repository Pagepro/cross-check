/**
 * `case-study-hero` is the one section that renders a page's `<h1>` (see
 * `web/src/ui/sections/CaseStudyHero`), and the `case-study` route contract puts
 * it first on every case study. It shares the `sections` fragment with `page`,
 * which is right for reuse but bidirectional — so without this guard an editor
 * can drop a case-study hero into an ordinary page that already has a `hero`,
 * and the page ships two `<h1>`s.
 *
 * Pure + dependency-free so both the Studio validation rule and the unit test
 * can use it (same shape as `reservedSlug.ts`).
 */
export const CASE_STUDY_HERO_TYPE = "case-study-hero";

export const CASE_STUDY_HERO_ON_PAGE_MESSAGE = "Case study hero is only for case studies";

/** True when a `sections` array holds at least one `case-study-hero` member. */
export function hasCaseStudyHeroSection(sections: unknown): boolean {
  if (!Array.isArray(sections)) return false;

  return sections.some(
    (section) =>
      typeof section === "object" &&
      section !== null &&
      (section as { _type?: unknown })._type === CASE_STUDY_HERO_TYPE,
  );
}

/**
 * The same hazard, one wave later: `career-jobs` renders the career page's
 * `<h1>` (ruling P3D-14 — the built-in "Career / Open Positions in Białystok or
 * Remote" heading is code, and the section's `simpleRichText` field cannot emit
 * an `<h1>` of its own), so a page that already has a `hero` would ship two.
 * `career-jobs` sits in the generic `content` insert group, so an editor can
 * reach it from any page — the guard is what keeps the invariant a mechanism
 * rather than an assumption.
 *
 * KNOWN LIMIT, inherited from `hasCaseStudyHeroSection` and recorded rather than
 * fixed in this wave — the shared-section blind spot recorded in
 * `docs/parity/section-list.md`'s "Known gaps at 3D close" (NOT ruling P3D-10,
 * which is the `useDisclosure`-extraction gate; the earlier citation here was a
 * mis-numbering): the predicate reads the `page` document's OWN
 * `sections` array, so a `career-jobs` (or a `hero`) reached through a
 * `shared-section-ref` bundle is invisible to it. The route injector still fills
 * such a section with live openings — only this placement hint is skipped.
 */
export const CAREER_JOBS_TYPE = "career-jobs";

export const HERO_TYPE = "hero";

export const CAREER_JOBS_WITH_HERO_MESSAGE =
  "A career openings block renders the page heading, so it cannot sit on a page that also has a Hero.";

/** The `_type` of a `sections` array member, or `null` for a malformed one. */
const memberType = (section: unknown): string | null =>
  typeof section === "object" && section !== null
    ? ((section as { _type?: unknown })._type as string) || null
    : null;

/** True when a `sections` array holds BOTH a `hero` and a `career-jobs`. */
export function hasCareerJobsWithHero(sections: unknown): boolean {
  if (!Array.isArray(sections)) return false;

  const types = sections.map(memberType);

  return types.includes(CAREER_JOBS_TYPE) && types.includes(HERO_TYPE);
}
