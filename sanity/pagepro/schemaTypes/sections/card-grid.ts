import { VscLinkExternal, VscPreview } from "react-icons/vsc";
import { defineArrayMember, defineField, defineType } from "sanity";

import { count } from "@/sanity/pagepro/stubs/utils";
import { getBlockText } from "@/sanity/pagepro/lib/utils";

/**
 * Card grid (spec W5) — the section behind the Storyblok `postCard` blok
 * (9 occurrences, laid out in three `grid` bloks, all
 * `columnsNumberDesktop: 3`).
 *
 * This is a GENERIC editorial link card, not a case-study listing. Every one of
 * the nine source cards carries an absolute `https://pagepro.co/blog/…` link
 * (`linktype: "url"`), so the destination is arbitrary by construction — a blog
 * post today, an external article or another page tomorrow. The `link` field is
 * therefore the starter's full `link` object rather than a reference to any one
 * document type: the transformer classifies each target and never fabricates a
 * case-study document (ruling R-3B-13).
 *
 * `categories` is free text, not a reference. The source values came from a
 * Storyblok `categories` datasource (observed: `Jamstack` ×3, `React Native`
 * ×3, `React JS` ×3, `Next.JS`, `Gatsby`); whether they should become a shared
 * taxonomy is an owner decision logged as NO-13. Until then a chip is a label.
 * `categoriesBackground` is dropped — present on 3 of 9 and `#ffffff` on all
 * three, so the chips take the theme colour instead (ruling R-3B-13).
 */
export default defineType({
  name: "card-grid",
  title: "Card grid",
  icon: VscPreview,
  type: "object",
  groups: [{ name: "content", default: true }, { name: "options" }],
  /* Object-level: this is what Sanity seeds when the section is inserted into a
     page's `sections` array, so the `columns` field needs no second one. */
  initialValue: { columns: 3 },
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
      description: "Short uppercase label above the heading, e.g. “From the blog”.",
      type: "string",
      group: "content",
    }),
    defineField({
      name: "content",
      title: "Content",
      description:
        "Optional heading and supporting copy above the cards. Leave empty for a bare grid.",
      type: "simpleRichText",
      group: "content",
    }),
    defineField({
      name: "columns",
      title: "Columns",
      description:
        "Desktop columns. All three source grids of these cards used 3. Tablet shows at most 2 (3 at four columns); mobile stacks.",
      type: "number",
      options: {
        list: [
          { title: "2", value: 2 },
          { title: "3", value: 3 },
          { title: "4", value: 4 },
        ],
      },
      group: "options",
    }),
    defineField({
      name: "items",
      title: "Cards",
      description:
        "Each card is a single link: the whole card is clickable, so keep the description plain copy.",
      type: "array",
      group: "content",
      of: [
        defineArrayMember({
          type: "object",
          name: "linkCard",
          title: "Card",
          icon: VscLinkExternal,
          fields: [
            defineField({
              name: "title",
              title: "Title",
              description:
                "The card’s headline. It is also the link’s accessible name, so make it read on its own.",
              type: "string",
              validation: (Rule) =>
                Rule.required().error(
                  "A card with no title is an unnamed link — a screen reader announces it as its URL.",
                ),
            }),
            defineField({
              name: "description",
              title: "Description",
              description: "One or two sentences under the title. Plain text.",
              type: "text",
              rows: 3,
            }),
            defineField({
              name: "image",
              title: "Image",
              description:
                "Cover image at the top of the card. Aspect ratio 4:3, recommended 1200×900px (landscape).",
              type: "img",
            }),
            defineField({
              name: "link",
              title: "Link",
              description:
                "Where the card goes — another page on this site, an external article, or a file.",
              type: "link",
              validation: (Rule) =>
                Rule.required().error(
                  "The whole card is this link; without it, it does nothing.",
                ),
            }),
            defineField({
              name: "categories",
              title: "Categories",
              description:
                "Free-text labels shown as chips (source values come from the Storyblok `categories` datasource — see NO-13).",
              type: "array",
              of: [defineArrayMember({ type: "string" })],
              options: { layout: "tags" },
            }),
          ],
          preview: {
            select: {
              title: "title",
              subtitle: "description",
              media: "image.image",
            },
          },
        }),
      ],
      validation: (Rule) =>
        Rule.required().min(1).error("A card grid needs at least one card."),
    }),
  ],
  preview: {
    select: { content: "content", items: "items" },
    prepare: ({ content, items }) => ({
      title: getBlockText(content) || "Card grid",
      subtitle: items?.length ? count(items, "card") : "Card grid",
    }),
  },
});
