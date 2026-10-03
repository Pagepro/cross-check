import { ThLargeIcon } from "@sanity/icons/ThLarge";
import { VscListSelection } from "react-icons/vsc";
import { defineArrayMember, defineField, defineType } from "sanity";

import { getBlockText } from "@/sanity/pagepro/lib/utils";
import { listBlock } from "@/sanity/pagepro/schemaTypes/objects/richText/list-block";

/**
 * Generic data table (ruling R-3A-1). One section replaces three Storyblok
 * bloks:
 *
 * - `extendedTable` (25) — header row + body rows + caption. Its `header` is a
 *   FLAT `tableColumn[]` in the snapshot (not a nested `tableRow`), which is why
 *   `header` here is an array of cells rather than a row (ruling P3A-43).
 * - `table` (1) — the Storyblok NATIVE table field (a cookies table of
 *   `_table_col` strings). Its thead/tbody strings become header cells and
 *   single-paragraph row cells (ruling P3A-45).
 * - `prosAndCons` (1) — two rich-text columns of bullet lists. Carried by the
 *   `pros-cons` variant rather than a section of its own (ruling P3A-47).
 *
 * NOT to be confused with the starter's `comparison-table`, which is a pricing
 * matrix with plan columns and check/cross cells. This one is a plain table of
 * editor-authored cells.
 */
export default defineType({
  name: "data-table",
  title: "Data table",
  icon: ThLargeIcon,
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
      name: "variant",
      title: "Variant",
      description:
        "Table — a header row plus body rows. Pros and cons — two side-by-side lists with + / − markers instead of bullets.",
      type: "string",
      initialValue: "table",
      options: {
        layout: "radio",
        list: [
          { title: "Table", value: "table" },
          { title: "Pros and cons", value: "pros-cons" },
        ],
      },
      group: "options",
    }),
    defineField({
      name: "pretitle",
      title: "Tagline",
      description: "Short uppercase label above the heading, e.g. “Comparison”.",
      type: "string",
      group: "content",
    }),
    defineField({
      name: "content",
      title: "Content",
      description:
        "Optional heading and supporting copy above the table. Leave empty for a bare table.",
      type: "simpleRichText",
      group: "content",
    }),
    defineField({
      name: "caption",
      title: "Caption",
      description:
        "Describes what the table shows. Always read out by screen readers; see “Show the caption” below for whether it is also drawn above the table.",
      type: "string",
      group: "content",
      hidden: ({ parent }) => parent?.variant === "pros-cons",
    }),
    /* A real boolean rather than the house `string` + `options.list` pattern:
       this is the source's binary `isCaptionVisible` with no third state to
       name — the same exception `marquee-band`'s two toggles document. */
    defineField({
      name: "captionVisible",
      title: "Show the caption",
      description:
        "Show the caption above the table; hidden captions stay available to screen readers",
      type: "boolean",
      initialValue: false,
      group: "content",
      hidden: ({ parent }) => parent?.variant === "pros-cons",
    }),
    defineField({
      name: "header",
      title: "Header row",
      description:
        "Header row cells (source extendedTable.header). Leave empty for a table with no header row. Keep the number of cells equal to the number of cells in each body row.",
      type: "array",
      group: "content",
      of: [defineArrayMember({ type: "dataTableCell" })],
      hidden: ({ parent }) => parent?.variant === "pros-cons",
    }),
    defineField({
      name: "rows",
      title: "Rows",
      description: "The body rows of the table, top to bottom.",
      type: "array",
      group: "content",
      of: [
        defineArrayMember({
          type: "object",
          name: "dataTableRow",
          title: "Row",
          icon: VscListSelection,
          fields: [
            defineField({
              name: "cells",
              title: "Cells",
              description: "The row's cells, left to right.",
              type: "array",
              of: [defineArrayMember({ type: "dataTableCell" })],
              validation: (Rule) => Rule.min(1).error("A row needs at least one cell."),
            }),
          ],
          preview: {
            /* `cells.0.text` is the idiomatic path selector (same shape as the
               section preview's `header.0.text` below); the whole `cells` array
               is selected only for the count in the subtitle. */
            select: { text: "cells.0.text", cells: "cells" },
            prepare: ({
              text,
              cells,
            }: {
              text?: { children?: { text: string }[] }[];
              cells?: unknown[];
            }) => ({
              title: getBlockText(text) || "Row",
              subtitle: `${cells?.length ?? 0} cell${cells?.length === 1 ? "" : "s"}`,
            }),
          },
        }),
      ],
      hidden: ({ parent }) => parent?.variant === "pros-cons",
    }),
    /* `listBlock()` (ruling P3A-57): paragraphs and lists, nothing else. These
       were `pageRichText`, which also allows `img` / `pullquote` / `callout` /
       `code` / `table` / `videoEmbed` / `checklist` / `decoratedList`
       (`objects/richText/pageRichText.ts:30-38`). The GROQ side reads them with
       a deliberately light projection (`PROS_CONS_QUERY`, ruling P3A-52) that
       does not expand those members' nested references — so a `callout` authored
       into Pros would render with an empty `href` on any internal link inside
       it, and a `pullquote` with no avatar. Rather than pay ~9.5KB of query
       budget to expand blocks this section never draws, the fields are narrowed
       to what they actually render. */
    defineField({
      name: "pros",
      title: "Pros",
      description:
        "The upside column. Use a bullet list — each item is drawn with a “+” marker in the accent colour.",
      type: "array",
      of: [listBlock()],
      group: "content",
      hidden: ({ parent }) => parent?.variant !== "pros-cons",
    }),
    defineField({
      name: "cons",
      title: "Cons",
      description:
        "The downside column. Use a bullet list — each item is drawn with a “−” marker in the body colour.",
      type: "array",
      of: [listBlock()],
      group: "content",
      hidden: ({ parent }) => parent?.variant !== "pros-cons",
    }),
  ],
  /* Each variant reads a different half of the form, so neither half can be
     `required()` on its own — the rule has to see the whole section. */
  validation: (Rule) =>
    Rule.custom((section) => {
      const { variant, rows, pros, cons } =
        (section as
          | { variant?: string; rows?: unknown[]; pros?: unknown[]; cons?: unknown[] }
          | undefined) ?? {};

      if (variant === "pros-cons") {
        return pros?.length || cons?.length
          ? true
          : "Add pros or cons — the section renders nothing without either.";
      }

      return rows?.length
        ? true
        : "Add at least one row — an empty table renders nothing.";
    }),
  preview: {
    select: { caption: "caption", variant: "variant", headerText: "header.0.text" },
    prepare: ({ caption, variant, headerText }) => ({
      title: caption || getBlockText(headerText) || "Data table",
      subtitle: variant === "pros-cons" ? "Data table · Pros and cons" : "Data table",
    }),
  },
});
