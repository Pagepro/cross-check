import { VscDashboard } from "react-icons/vsc";
import { defineField, defineType } from "sanity";

/**
 * AI readiness assessment section (phase 3C Task 6).
 *
 * Source: `aiAssessment` — 1 published instance, rendered by
 * `organisms/forms/AiAssessment/*` through a wrapper
 * (`storyblok/AiAssessmentStoryblok/index.tsx`) that passes it **nothing**.
 *
 * **The blok declares no fields at all.** Every string the tool shows — the 15
 * questions and their 55 options, the block labels, the intro checkpoints, the
 * risk explanations, the four stage labels and the five recommended paths — is
 * hard-coded in the source's own `AiAssessment/assessment.ts`, and ruling P3C-2
 * (with R-3C-10 / NO-23) keeps it in code here too:
 * `web/src/ui/sections/AiAssessment/assessment.ts`, a 1:1 transcription. The
 * scoring is entirely client-side and submits nothing.
 *
 * What this schema adds is therefore only the standard optional section header —
 * a `pretitle` and a `content` heading — so an editor can introduce the tool on
 * the page. Neither has a source value to migrate.
 *
 * Ruling P3A-2: the colour band, vertical rhythm, dividers and anchor id all
 * belong to the `section-options` wrapper — this section declares none of them.
 */
export default defineType({
  name: "ai-assessment",
  title: "AI assessment",
  icon: VscDashboard,
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
      description: "Small label above the heading.",
      type: "string",
      group: "content",
    }),
    defineField({
      name: "content",
      title: "Heading and intro",
      description:
        "The section's own heading and the copy above the assessment. The assessment itself — its 15 questions, every answer option, the risk wording and the recommended paths — is code (`web/src/ui/sections/AiAssessment/assessment.ts`) and has no fields here.",
      type: "simpleRichText",
      group: "content",
    }),
  ],
  preview: {
    select: { pretitle: "pretitle" },
    prepare: ({ pretitle }) => ({
      title: "AI assessment",
      subtitle: pretitle || "15-question readiness assessment (questions are code)",
    }),
  },
});
