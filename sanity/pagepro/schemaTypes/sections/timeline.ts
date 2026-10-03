import { VscCircleFilled, VscGitCommit } from "react-icons/vsc";
import { defineArrayMember, defineField, defineType } from "sanity";

import { count } from "@/sanity/pagepro/stubs/utils";
import { getBlockText } from "@/sanity/pagepro/lib/utils";

/**
 * Timeline (ruling R-3B-10) — the section behind the Storyblok `timeline` blok
 * (15 occurrences, 4–20 `timelineItem` steps each).
 *
 * Rendered as the source's 360° dial and looping carousel
 * (`web/src/ui/sections/Timeline/client.tsx`; owner P0 A 2026-09-17 superseded
 * the R-3B-10 linear rail).
 *
 * A step body is `timelineRichText` (owner P0 2026-09-17, superseding the
 * `listBlock()` array): the source step body is one whole rich-text blok
 * (`storyblok/TimelineStoryblok/index.tsx:15`) with lists, paragraph looks and
 * inline colours; `SIMPLE_RICHTEXT_QUERY` still projects it completely (blocks
 * plus their `markDefs`).
 */
export default defineType({
  name: "timeline",
  title: "Timeline",
  icon: VscGitCommit,
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
      description: "Short uppercase label above the heading, e.g. “Our process”.",
      type: "string",
      group: "content",
    }),
    defineField({
      name: "content",
      title: "Content",
      description:
        "Optional heading and supporting copy above the rail. Leave empty for a bare timeline.",
      type: "simpleRichText",
      group: "content",
    }),
    defineField({
      name: "items",
      title: "Steps",
      description:
        "Each step is a marker on the rail; selecting one shows its panel below. Steps read left to right from tablet up, top to bottom on a phone.",
      type: "array",
      group: "content",
      of: [
        defineArrayMember({
          type: "object",
          name: "timelineItem",
          title: "Step",
          icon: VscCircleFilled,
          fields: [
            defineField({
              name: "label",
              title: "Label",
              description: "The step marker’s name, e.g. “Sprint 1”. Shown in capitals.",
              type: "string",
              validation: (Rule) =>
                Rule.required().error("A step with no label is an unlabelled dot."),
            }),
            defineField({
              name: "note",
              title: "Note",
              description:
                "Optional second line under the label, e.g. “Epic 1”. Leave empty when the label says enough.",
              type: "string",
            }),
            defineField({
              name: "body",
              title: "Body",
              description:
                "Shown when the step is selected. Paragraphs, bullet/numbered lists, source looks and colour.",
              type: "timelineRichText",
              validation: (Rule) =>
                Rule.required()
                  .min(1)
                  .error("A step with no body selects onto an empty panel."),
            }),
          ],
          preview: {
            select: { title: "label", subtitle: "note" },
          },
        }),
      ],
      validation: (Rule) =>
        Rule.required().min(2).error("A timeline needs at least two steps."),
    }),
  ],
  preview: {
    select: { content: "content", items: "items" },
    prepare: ({ content, items }) => ({
      title: getBlockText(content) || "Timeline",
      subtitle: items?.length ? count(items, "step") : "Timeline",
    }),
  },
});
