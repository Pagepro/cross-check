import { SplitVerticalIcon } from "@sanity/icons/SplitVertical";
import { defineArrayMember, defineField, defineType } from "sanity";

import { count } from "@/sanity/pagepro/stubs/utils";
import { getBlockText } from "@/sanity/pagepro/lib/utils";

export default defineType({
  name: "split-sections",
  title: "Split sections",
  icon: SplitVerticalIcon,
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
      name: "rows",
      title: "Rows",
      description:
        "Each row is a two-column block (text + image). Rows alternate the image side automatically — first row image right, second image left, and so on.",
      type: "array",
      group: "content",
      of: [
        defineArrayMember({
          type: "object",
          name: "row",
          fields: [
            defineField({
              name: "eyebrow",
              title: "Eyebrow",
              description:
                "Short uppercase label above the heading, e.g. “Win/Loss analysis”.",
              type: "string",
            }),
            defineField({
              name: "content",
              title: "Content",
              description:
                "Heading and supporting copy. Use the heading-2 block style for the heading and body-2 for the description.",
              type: "simpleRichText",
              validation: (Rule) => Rule.required().error("Each row needs heading copy."),
            }),
            defineField({
              name: "ctas",
              title: "Call-to-actions",
              description: "Optional button shown below the copy.",
              type: "array",
              of: [{ type: "cta" }],
              validation: (Rule) =>
                Rule.max(2).warning(
                  "The layout is designed for a single button per row.",
                ),
            }),
            defineField({
              name: "image",
              title: "Image",
              description:
                "Shown in a tinted rounded frame beside the copy. Aspect ratio 4:3, recommended 1360×1020px (landscape).",
              type: "img",
            }),
          ],
          preview: {
            select: { eyebrow: "eyebrow", content: "content", media: "image.image" },
            prepare: ({ eyebrow, content, media }) => ({
              title: getBlockText(content) || "Row",
              subtitle: eyebrow || "Split row",
              media,
            }),
          },
        }),
      ],
      validation: (Rule) =>
        Rule.min(1).max(6).warning("Up to 6 rows render comfortably."),
    }),
  ],
  preview: {
    select: { rows: "rows" },
    prepare: ({ rows }) => ({
      title: "Split sections",
      subtitle: rows?.length ? count(rows, "row") : "No rows yet",
    }),
  },
});
