import { VscLocation } from "react-icons/vsc";
import { defineArrayMember, defineField, defineType } from "sanity";

import { count } from "@/sanity/pagepro/stubs/utils";
import { getBlockText } from "@/sanity/pagepro/lib/utils";
import { listBlock } from "@/sanity/pagepro/schemaTypes/objects/richText/list-block";

/**
 * Offices (Task 11) — the section behind the Storyblok `branches` blok (2
 * occurrences, source `organisms/Branches/index.tsx`), each holding one or
 * more `branch` blocks (4 total: `title`, `description`, `icon`, `features`).
 *
 * `items` caps at 2 (component schema `max=2`; both source occurrences used
 * exactly 2) and each item's `details` caps at 4 (component schema `max=4`;
 * observed maximum 3) — a wrapper object (`officeDetail`) rather than an array
 * of arrays, because Sanity cannot nest an array directly inside an array.
 *
 * `title` is a plain string, not rich text: the source `branch.title` was one
 * `rich_text` blok holding a level-2 heading with hard breaks ("LONDON." /
 * "UNITED " / "KINGDOM."), flattened here to a single location name rendered
 * as the source `Branch` `<h2>`, one line per line break (contact route contract C4).
 */
export default defineType({
  name: "offices",
  title: "Offices",
  icon: VscLocation,
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
      description: "Short uppercase label above the heading, e.g. “Where we work”.",
      type: "string",
      group: "content",
    }),
    defineField({
      name: "content",
      title: "Content",
      description:
        "Optional heading and supporting copy above the office cards. Leave empty for a bare grid.",
      type: "simpleRichText",
      group: "content",
    }),
    defineField({
      name: "items",
      title: "Offices",
      description: "Branch location cards, two per row from desktop.",
      type: "array",
      group: "content",
      of: [
        defineArrayMember({
          type: "object",
          name: "office",
          title: "Office",
          icon: VscLocation,
          fields: [
            defineField({
              name: "icon",
              title: "Icon",
              description:
                "Location mark (source `branch.icon`: `icon-london.svg`, `icon-bialystok.svg`).",
              type: "img",
            }),
            defineField({
              name: "title",
              title: "Location name",
              description:
                "Location name as the card heading, one line per line break, e.g. “LONDON.” / “UNITED” / “KINGDOM.”.",
              type: "text",
              rows: 3,
              validation: (Rule) =>
                Rule.required().error(
                  "The location name is the card's only heading — it cannot be blank.",
                ),
            }),
            defineField({
              name: "address",
              title: "Address",
              description: "Legal entity and address (source `branch.description`).",
              type: "array",
              of: [listBlock()],
            }),
            defineField({
              name: "details",
              title: "Details",
              description:
                "Up to four extra blocks — company number, VAT, phone, e-mail (source `branch.features`, component schema `max=4`; observed maximum 3).",
              type: "array",
              of: [
                defineArrayMember({
                  type: "object",
                  name: "officeDetail",
                  title: "Detail",
                  fields: [
                    defineField({
                      name: "body",
                      title: "Body",
                      type: "array",
                      of: [listBlock()],
                    }),
                  ],
                  preview: {
                    select: { body: "body" },
                    prepare: ({ body }) => ({
                      title: getBlockText(body) || "Detail",
                    }),
                  },
                }),
              ],
              validation: (Rule) =>
                Rule.max(4).error("The source layout fits up to four details."),
            }),
          ],
          preview: {
            select: { title: "title", media: "icon.image" },
            prepare: ({ title, media }) => ({
              title: title || "Office",
              media,
            }),
          },
        }),
      ],
      validation: (Rule) =>
        Rule.required().min(1).max(2).error("The source layout fits up to two offices."),
    }),
  ],
  preview: {
    select: { content: "content", items: "items" },
    prepare: ({ content, items }) => ({
      title: getBlockText(content) || "Offices",
      subtitle: items?.length ? count(items, "office") : "Offices",
    }),
  },
});
