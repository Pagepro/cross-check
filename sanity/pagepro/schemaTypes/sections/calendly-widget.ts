import { VscCalendar } from "react-icons/vsc";
import { defineField, defineType } from "sanity";

import { getBlockText } from "@/sanity/pagepro/lib/utils";

/**
 * Calendly widget (Task 12) — the section behind the Storyblok `calendlyWidget`
 * blok (2 occurrences, source `molecules/CalendlyWidget/index.tsx`).
 *
 * The embed is third-party and mounts on page view, so the renderer keeps it
 * behind the `functionality` consent gate (R-3B-17, NO-10): nothing reaches
 * calendly.com until the visitor allows it.
 *
 * The source component is a `calendly-inline-widget` div that
 * `assets.calendly.com/assets/external/widget.js` turns into an iframe. We own
 * the iframe instead (see `web/src/ui/sections/CalendlyWidget/client.tsx`), so
 * `url` is the scheduling page URL, not a widget argument — hence the strict
 * `https` validation, backed by a host check in the renderer.
 */
export default defineType({
  name: "calendly-widget",
  title: "Calendly scheduler",
  icon: VscCalendar,
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
      title: "Tagline",
      description: "Short uppercase label above the heading, e.g. “Book a call”.",
      type: "string",
      group: "content",
    }),
    defineField({
      name: "content",
      title: "Content",
      description:
        "Optional heading and supporting copy above the scheduler. Leave empty for a bare embed.",
      type: "simpleRichText",
      group: "content",
    }),
    defineField({
      name: "url",
      title: "Calendly URL",
      description:
        "Calendly scheduling URL, e.g. `https://calendly.com/chris8/30min?hide_gdpr_banner=1`. Must be a calendly.com address — the section renders nothing for anything else.",
      type: "url",
      validation: (Rule) =>
        Rule.required()
          .uri({ scheme: ["https"] })
          .error("Without a Calendly URL the section renders nothing."),
      group: "content",
    }),
    defineField({
      name: "minHeight",
      title: "Initial height (px)",
      description:
        "Initial iframe height in px before Calendly reports its own (source default 700, `molecules/CalendlyWidget/index.tsx:8`). Also reserves the box while the visitor has not consented yet, so loading the scheduler does not shift the page.",
      type: "number",
      initialValue: 700,
      validation: (Rule) => Rule.min(300).max(3000),
      group: "options",
    }),
  ],
  initialValue: { minHeight: 700 },
  preview: {
    select: { content: "content", url: "url" },
    prepare: ({ content, url }) => ({
      title: getBlockText(content) || "Calendly scheduler",
      subtitle: url || "No Calendly URL yet",
    }),
  },
});
