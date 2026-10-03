import { VscListOrdered } from "react-icons/vsc";
import { defineArrayMember, defineField, defineType } from "sanity";

import { getBlockText } from "@/sanity/pagepro/lib/utils";

/**
 * Numbered / ordered list with a decorated marker column.
 *
 * Ports the source's two list bloks — `numberedList` (items with a number, a
 * rich-text title + description and an optional accent colour) and
 * `orderedList` (items with a free-text `incrementor` instead of a number).
 * They share one schema: the only real difference is the marker's meaning and
 * the row layout, which `style` selects.
 *
 * Not a Portable Text `list` — each item carries its own rich-text title AND
 * description, which a `bullet`/`number` list item cannot express.
 */
export default defineType({
  name: "decoratedList",
  title: "Decorated list",
  icon: VscListOrdered,
  type: "object",
  description:
    "A numbered (or free-text “incrementor”) list where every row has its own title and description.",
  fields: [
    defineField({
      name: "style",
      title: "Style",
      type: "string",
      description:
        "Numbered — big number per row, separated by hairlines. Ordered — accent incrementor label in front of each row.",
      options: {
        layout: "radio",
        list: [
          { title: "Numbered", value: "numbered" },
          { title: "Ordered", value: "ordered" },
        ],
      },
      initialValue: "numbered",
    }),
    defineField({
      name: "items",
      title: "Items",
      type: "array",
      validation: (Rule) => Rule.required().min(1).error("Add at least one row."),
      of: [
        defineArrayMember({
          type: "object",
          name: "decoratedListItem",
          title: "Row",
          fields: [
            defineField({
              name: "marker",
              title: "Marker",
              type: "string",
              description:
                "The number (“1”, “2”, …) or, for the ordered style, the short label in front of the row.",
              validation: (Rule) => Rule.required().error("A row needs a marker."),
            }),
            defineField({
              name: "title",
              title: "Title",
              type: "simpleRichText",
            }),
            defineField({
              name: "description",
              title: "Description",
              type: "simpleRichText",
            }),
            defineField({
              name: "color",
              title: "Marker colour",
              type: "string",
              description: "Accent paints the marker in the brand red.",
              options: {
                layout: "radio",
                list: [
                  { title: "Default", value: "default" },
                  { title: "Accent", value: "accent" },
                ],
              },
              initialValue: "default",
            }),
          ],
          preview: {
            select: { marker: "marker", title: "title", color: "color" },
            prepare: ({ marker, title, color }) => ({
              title: [marker, getBlockText(title)].filter(Boolean).join(" — "),
              subtitle: color === "accent" ? "Accent marker" : undefined,
            }),
          },
        }),
      ],
    }),
  ],
  preview: {
    select: { style: "style", items: "items" },
    prepare: ({ style, items }) => ({
      title: "Decorated list",
      subtitle: [
        style === "ordered" ? "Ordered" : "Numbered",
        items?.length ? `${items.length} row${items.length === 1 ? "" : "s"}` : "Empty",
      ].join(" · "),
    }),
  },
  initialValue: {
    style: "numbered",
  },
});
