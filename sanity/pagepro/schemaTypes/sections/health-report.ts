import { VscPulse } from "react-icons/vsc";
import { defineField, defineType } from "sanity";

/**
 * Health report section (phase 3C Task 5).
 *
 * Source: `SLAReport` — 1 published instance, on `services/nextjs-support`
 * (`content.body[8]`), rendered by `organisms/HealthReport/*`.
 *
 * **One field, deliberately.** The blok itself is a single `text` richtext, and
 * its renderer pairs that prose with a SAMPLE monthly report card — eight
 * metrics plus a tech-state row, counting up as it scrolls into view — which the
 * source hard-codes at `organisms/HealthReport/index.tsx:40-98`. Ruling P3C-2 /
 * R-3C-9 keeps that illustration in code
 * (`web/src/ui/sections/HealthReport/data.ts`) rather than inventing eight
 * metric documents for content nobody edits. NO-22 asks the owner whether it
 * should ever become editable.
 *
 * It is its own section rather than a `sla-packages` variant (a stated deviation
 * from spec §2, which maps `SLAReport` onto `sla-packages`): the two render
 * nothing in common.
 *
 * Ruling P3A-2: the colour band, vertical rhythm, dividers and anchor id all
 * belong to the `section-options` wrapper — this section declares none of them.
 */
export default defineType({
  name: "health-report",
  title: "Health report",
  icon: VscPulse,
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
      name: "content",
      title: "Heading and copy",
      description:
        "The section's heading and the prose beside the report card. The card itself — its title, its tech-state row and its eight sample metrics — is code (`web/src/ui/sections/HealthReport/data.ts`) and has no fields here.",
      type: "simpleRichText",
      group: "content",
    }),
  ],
  preview: {
    prepare: () => ({
      title: "Health report",
      subtitle: "Copy beside the sample monthly report card",
    }),
  },
});
