import { VscSymbolField } from "react-icons/vsc";
import { defineField, defineType } from "sanity";

import { getBlockText } from "@/sanity/pagepro/lib/utils";

/**
 * One cell of the `data-table` section — shared by the header row and every
 * body row so both sides of the table are authored with exactly the same
 * fields (source `tableColumn`, 418 occurrences).
 *
 * Named `dataTableCell`, not `tableCell`, because `@sanity/table` (registered
 * in `config.ts` for the rich-text `table` block) already owns the `tableRow`
 * type name; keeping both halves of this pair under the `dataTable*` prefix
 * avoids one type being prefixed and its sibling not.
 *
 * `width` is a MINIMUM width in PIXELS (ruling P3A-44), matching the source:
 * `ExtendedTable/styles.ts:56-60` sets `min-width: ${width / 16}rem` — i.e. the
 * stored number is a px value. In the snapshot it is empty on 386 of 418 cells
 * and otherwise one of "100" / "300" / "400".
 */
export default defineType({
  name: "dataTableCell",
  title: "Cell",
  icon: VscSymbolField,
  type: "object",
  fields: [
    defineField({
      name: "text",
      title: "Text",
      description: "The cell's copy. Short rich text, optionally a bullet list.",
      type: "tableCellRichText",
    }),
    defineField({
      name: "icon",
      title: "Icon",
      description:
        "Optional graphic shown above the cell text. Rendered 48px tall with the width left to the artwork, so use a transparent square or landscape mark — recommended 192×192px (1:1) for a square icon.",
      type: "img",
    }),
    defineField({
      name: "width",
      title: "Minimum column width",
      description:
        "Minimum column width in px (source tableColumn.width). Leave blank to let the column size itself; a value here keeps the column readable while the table scrolls sideways.",
      type: "number",
      validation: (Rule) => Rule.min(1).max(2000).integer(),
    }),
  ],
  preview: {
    select: { text: "text", media: "icon.image" },
    prepare: ({ text, media }) => ({
      title: getBlockText(text) || "Cell",
      media,
    }),
  },
});
