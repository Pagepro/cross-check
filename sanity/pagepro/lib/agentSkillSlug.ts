/**
 * The charset an `agent-skill` slug is allowed to use (ruling **P3D-23**).
 *
 * The slug is not an internal id: it is published VERBATIM in two machine-read
 * places — as the `name:` key of the SKILL.md YAML frontmatter and as a path
 * segment of `/.well-known/agent-skills/{slug}/SKILL.md`. Sanity's slugify only
 * runs behind the *Generate* button, so a hand-typed value (or one written
 * straight through the API by the phase-6 import, where no input widget exists
 * at all) reaches the store unnormalised. Without this rule `a: b` composes an
 * ambiguous YAML scalar and an unescaped URL, and a value carrying a newline
 * injects a second frontmatter key.
 *
 * This is the FIRST of two defences; the composer quotes the name and the index
 * encodes the URL segment regardless, so a document that predates this rule
 * still cannot emit broken bytes (see `web/src/lib/agent-skills/compose.ts`).
 *
 * Pure + dependency-free so the Studio validation rule and the unit test can
 * both use it (same shape as `reservedSlug.ts` / `sectionPlacement.ts`).
 */
export const AGENT_SKILL_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Matches the `options.maxLength` the Generate button slugifies down to. */
export const AGENT_SKILL_SLUG_MAX_LENGTH = 96;

export const AGENT_SKILL_SLUG_MESSAGE =
  "Use lower-case letters, digits and single hyphens (max 96 characters) — the slug is published verbatim as a URL segment and as the frontmatter name.";

/** True for `engage-pagepro`; false for ``, `A b`, `a: b`, `a--b`, `-a`, `a-`. */
export function isAgentSkillSlug(value: string | null | undefined): boolean {
  if (!value) return false;

  return (
    value.length <= AGENT_SKILL_SLUG_MAX_LENGTH && AGENT_SKILL_SLUG_PATTERN.test(value)
  );
}
