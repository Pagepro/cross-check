import { VscListFlat } from "react-icons/vsc";
import { defineArrayMember, defineField, defineType } from "sanity";

/**
 * One row of the SLA comparison matrix (phase 3C Task 5).
 *
 * Imported from the source's `slaPackages.comparisonJson` — a 3,168-byte JSON
 * string of 5 columns × 15 rows of plain strings, which the transformer unpacks
 * into these fields so editors never have to hand-edit JSON again.
 *
 * `values` is positional: the nth value belongs to the nth column. Rows shorter
 * than the column list simply render fewer cells, which is what the source did
 * (`SlaPackages/index.tsx:250-270`).
 */
export default defineType({
  name: "slaComparisonRow",
  title: "Comparison row",
  icon: VscListFlat,
  type: "object",
  fields: [
    defineField({
      name: "label",
      title: "Row label",
      description:
        "The feature being compared, e.g. “Response — investigation begins”. “Price” is RESERVED: any row with that label is discarded and rebuilt from the tier prices in `web/src/ui/sections/SlaPackages/data.ts` (`SlaPackages/index.tsx:45-80`), so a currency switch always re-prices the table.",
      type: "string",
      validation: (Rule) =>
        Rule.required().error("A row with no label has nothing to compare."),
    }),
    defineField({
      name: "values",
      title: "Values",
      description:
        "One value per column, in column order. Plain text — the source matrix carries no formatting.",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
      validation: (Rule) => Rule.max(6),
    }),
  ],
  preview: {
    select: { label: "label", values: "values" },
    prepare: ({ label, values }) => ({
      title: label || "Comparison row",
      subtitle:
        (values as string[] | undefined)?.filter(Boolean).join(" · ") || "No values",
    }),
  },
});
