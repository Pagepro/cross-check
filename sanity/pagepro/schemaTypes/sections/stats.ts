import { BarChartIcon } from "@sanity/icons/BarChart";
import { defineArrayMember, defineField, defineType } from "sanity";

import { count } from "@/sanity/pagepro/stubs/utils";
import { getBlockText } from "@/sanity/pagepro/lib/utils";

export default defineType({
  name: "stats",
  title: "Stats",
  icon: BarChartIcon,
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
      title: "Section title",
      description:
        "Heading and supporting copy shown in the left column. Use the heading-2 block style for the heading. Leave empty to render the stats as a single full-width row with no title column (the source layout).",
      type: "simpleRichText",
      group: "content",
    }),
    defineField({
      name: "stats",
      title: "Stats",
      description:
        "With a section title set, renders as a 2-column grid beside it (stacking to 1 column on mobile). With no section title, renders as a single staggered row (source layout).",
      type: "array",
      group: "content",
      of: [
        defineArrayMember({
          type: "object",
          name: "stat",
          fields: [
            defineField({
              name: "value",
              title: "Value",
              description: "The metric itself, e.g. “43%”, “2.4×”, “11 days”.",
              type: "string",
              validation: (Rule) => Rule.required().error("Each stat needs a value."),
            }),
            defineField({
              name: "superscript",
              title: "Superscript",
              description: "Raised suffix after the value, e.g. %, +, k",
              type: "string",
            }),
            defineField({
              name: "label",
              title: "Label",
              description: "Short description of what the value measures.",
              type: "text",
              rows: 2,
              validation: (Rule) => Rule.required().error("Each stat needs a label."),
            }),
          ],
          preview: {
            select: { title: "value", subtitle: "label", superscript: "superscript" },
            prepare: ({ title, subtitle, superscript }) => ({
              title: title ? `${title}${superscript || ""}` : "Stat",
              subtitle,
            }),
          },
        }),
      ],
      validation: (Rule) => Rule.max(6).warning("Source sections carry 4–5 stats."),
    }),
  ],
  preview: {
    select: { content: "content", stats: "stats" },
    prepare: ({ content, stats }) => ({
      title: getBlockText(content) || "Stats",
      subtitle: stats?.length ? count(stats, "stat") : "No stats yet",
    }),
  },
});
