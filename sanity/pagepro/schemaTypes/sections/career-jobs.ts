import { VscBriefcase } from "react-icons/vsc";
import { defineField, defineType } from "sanity";

/**
 * Career openings section (phase 3D Task 2).
 *
 * Source: the career page's `CareerContent`
 * (`apps/site/src/pages/page/sections/CareerContent/index.tsx:15-40`), which is
 * NOT a Storyblok blok at all — `pages/page/index.tsx:31-42` injects it in code
 * whenever the story's `type` is `career`, and it reads its list from Traffit,
 * never from the CMS.
 *
 * So there is nothing here to author but the page's supporting copy:
 *
 *  - **The openings are never CMS content** (R-3D-3). They are fetched from
 *    Traffit at request time and injected into this section by the catchall
 *    route (`web/src/app/(frontend)/[[...slug]]/career-jobs.ts`). There is no
 *    items array to fill in, and an editor must not go looking for one — the
 *    `content` field description says so in the Studio.
 *  - **The heading is built in** (P3D-14). "Career / Open Positions in Białystok
 *    or Remote" is the page's `<h1>` and is rendered unconditionally by the
 *    component from `CareerJobs/constants.ts`, transcribed from
 *    `CareerContent/index.tsx:30-34`.
 *
 * Because the section owns the page `<h1>`, it cannot share a page with a
 * `hero`: `page.sections` carries a `hasCareerJobsWithHero` validation built on
 * the shared `@/sanity/pagepro/lib/sectionPlacement` predicate, beside the identical
 * `case-study-hero` guard.
 *
 * Ruling P3A-2: the colour band, vertical rhythm, dividers and anchor id all
 * belong to the `section-options` wrapper — this section declares none of them.
 */
export default defineType({
  name: "career-jobs",
  title: "Career openings",
  icon: VscBriefcase,
  type: "object",
  groups: [{ name: "content", default: true }, { name: "options" }],
  fields: [
    defineField({
      name: "options",
      title: "Section options",
      type: "section-options",
      group: "options",
    }),
    defineField({
      name: "pretitle",
      title: "Pretitle",
      description: "Short uppercase label above the heading, e.g. “Career”.",
      type: "string",
      group: "content",
    }),
    defineField({
      name: "content",
      title: "Supporting copy",
      description:
        '**Supporting copy under the page heading.** The heading itself ("Career / Open Positions in Białystok or Remote") is built in and always rendered — it is the page\'s `<h1>`, and this `simpleRichText` field cannot emit one (its style list excludes `heading-1`) — so write intro copy here, not a title. The openings themselves are not authored anywhere: they come live from Traffit.',
      type: "simpleRichText",
      group: "content",
    }),
  ],
  /* No defaults: the section carries no other stored field, and neither the
     heading nor the openings are CMS values. */
  initialValue: {},
  preview: {
    select: { pretitle: "pretitle" },
    prepare: ({ pretitle }) => ({
      title: "Career openings",
      subtitle: pretitle || "Live Traffit openings (not authored here)",
    }),
  },
});
