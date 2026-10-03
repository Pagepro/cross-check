import { VscSymbolMisc } from "react-icons/vsc";
import { defineArrayMember, defineField, defineType } from "sanity";

import { count } from "@/sanity/pagepro/stubs/utils";
import { getBlockText } from "@/sanity/pagepro/lib/utils";

/**
 * Technologies grid (Task 10) — the section behind the Storyblok
 * `technologyCards` blok (13 occurrences), each holding one or more
 * `technologyCard` items (39 total: `title` + a multiasset `icons` array).
 *
 * `cards` caps at 4 (component schema `max=4`; observed counts across the 13
 * source sections were 1, 2, 3 ×8, 4 ×3) and each card's `logos` caps at 12
 * (observed 3–8 logos per card, 48×48 SVGs in the source).
 *
 * Six of the 39 `technologyCard` occurrences don't belong here at all: the
 * separate `technologyTile` blok (6 occurrences, `label`/`href`/`icon`) sits in
 * `menu_link.links` — header mega-menu content, not a page section — and is
 * deferred to the header mega-menu build (owner decision NO-12, ruling
 * R-3B-15), same treatment as the `serviceTile` mega-menu occurrences in Task 9.
 *
 * `title` is `Rule.required()` going forward, but one imported card (1 of 39,
 * classification row `technologyCard.title`) is blank in the source corpus —
 * the transformer preserves it as-is rather than fabricating a name, so that
 * one document surfaces as invalid in the Studio until an editor fills in a
 * title. This is expected on import, not a bug: it is a one-time editorial
 * to-do, not a data-loss risk (the card and its logos are otherwise intact).
 */
export default defineType({
  name: "technologies-grid",
  title: "Technologies grid",
  icon: VscSymbolMisc,
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
      description: "Short uppercase label above the heading, e.g. “How we work”.",
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
      name: "cards",
      title: "Cards",
      description:
        "Grouped technology logos, e.g. “Design”, “Develop with”, “Deploy to”.",
      type: "array",
      group: "content",
      of: [
        defineArrayMember({
          type: "object",
          name: "technologyCard",
          title: "Card",
          icon: VscSymbolMisc,
          fields: [
            defineField({
              name: "title",
              title: "Title",
              description:
                "The group's name, e.g. “Design”, “Develop with”, “Deploy to”.",
              type: "string",
              validation: (Rule) =>
                Rule.required().error(
                  "The title labels this card's logo list for every visitor, including screen reader users — it cannot be blank.",
                ),
            }),
            defineField({
              name: "logos",
              title: "Logos",
              description:
                "Technology logos, 48×48 SVG in the source; 3–8 observed per card.",
              type: "array",
              of: [defineArrayMember({ type: "img" })],
              validation: (Rule) => Rule.required().min(1).max(12),
            }),
          ],
          preview: {
            select: { title: "title", logos: "logos" },
            prepare: ({ title, logos }) => ({
              title: title || "Card",
              subtitle: count(logos, "logo"),
            }),
          },
        }),
      ],
      validation: (Rule) =>
        Rule.required().min(1).max(4).error("The source layout fits up to four cards."),
    }),
  ],
  preview: {
    select: { content: "content", cards: "cards" },
    prepare: ({ content, cards }) => ({
      title: getBlockText(content) || "Technologies grid",
      subtitle: cards?.length ? count(cards, "card") : "Technologies grid",
    }),
  },
});
