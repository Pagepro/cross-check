import { VscLayout } from "react-icons/vsc";
import { defineArrayMember, defineField, defineType } from "sanity";

/**
 * The two-column panel that drops under one header item (phase 3D Task 6,
 * R-3D-13 — NO-12 resolved 2026-09-12 by owner instruction: build).
 *
 * Source: the `menu_link` fields `links*` / `cards*` / `*Bottom*`, rendered by
 * `Header/partials/HeaderContent/index.tsx:22-72`. 3 occurrences of the field
 * set in the published snapshot, 2 of them non-empty ("Services",
 * "Resources"); the third ("Nexity") is empty on every one of them.
 *
 * **Two strings per heading (P3D-11).** Each source heading is ONE `rich_text`
 * blok whose paragraph holds two spans split by a `hard_break`, the first
 * carrying `textStyle` colour `#F5333F` and both carrying `styled heading3`.
 * The colour is this repo's `--accent` token and the heading level belongs to
 * the component, so the marks are dropped and the two spans become two plain
 * strings: `…TitleAccent` (line 1, accent) + `…Title` (line 2, default ink).
 */
export default defineType({
  name: "headerMegaMenu",
  title: "Mega menu",
  icon: VscLayout,
  type: "object",
  options: {
    collapsible: true,
  },
  fields: [
    defineField({
      name: "linksTitleAccent",
      title: "Links heading — accent line",
      type: "string",
      description: "First line of the column heading. Shown in the accent colour.",
    }),
    defineField({
      name: "linksTitle",
      title: "Links heading",
      type: "string",
      description: "Second line of the column heading, in the default ink.",
    }),
    defineField({
      name: "links",
      title: "Links",
      type: "array",
      of: [defineArrayMember({ type: "megaMenuTile" })],
      description: "The left column: compact icon + label rows. Both source menus use 3.",
      validation: (Rule) =>
        Rule.max(6).error(
          "The left column holds at most 6 rows before it outgrows the panel.",
        ),
    }),
    defineField({
      name: "linksBottomLabel",
      title: "Links footer label",
      type: "string",
      description:
        "Optional “see everything” row under the left column, e.g. “All technologies”. The row renders only when this label AND its destination are both set.",
    }),
    defineField({
      name: "linksBottomLink",
      title: "Links footer destination",
      type: "link",
    }),
    defineField({
      name: "cardsTitleAccent",
      title: "Cards heading — accent line",
      type: "string",
      description: "First line of the column heading. Shown in the accent colour.",
    }),
    defineField({
      name: "cardsTitle",
      title: "Cards heading",
      type: "string",
      description: "Second line of the column heading, in the default ink.",
    }),
    defineField({
      name: "cards",
      title: "Cards",
      type: "array",
      of: [defineArrayMember({ type: "megaMenuCard" })],
      description: "The right column: tall picture cards. Both source menus use 3.",
      validation: (Rule) =>
        Rule.max(4).error("The right column holds at most 4 cards on one row."),
    }),
    defineField({
      name: "cardsBottomLabel",
      title: "Cards footer label",
      type: "string",
      description:
        "Optional “see everything” row under the right column, e.g. “All services”. The row renders only when this label AND its destination are both set.",
    }),
    defineField({
      name: "cardsBottomLink",
      title: "Cards footer destination",
      type: "link",
    }),
  ],
  preview: {
    select: {
      linksTitleAccent: "linksTitleAccent",
      linksTitle: "linksTitle",
      links: "links",
      cards: "cards",
    },
    prepare: ({ linksTitleAccent, linksTitle, links, cards }) => ({
      title: [linksTitleAccent, linksTitle].filter(Boolean).join(" ") || "Mega menu",
      subtitle: `${(links as unknown[] | undefined)?.length ?? 0} links · ${
        (cards as unknown[] | undefined)?.length ?? 0
      } cards`,
    }),
  },
});
