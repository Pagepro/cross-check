import { VscChecklist } from "react-icons/vsc";
import { defineArrayMember, defineField, defineType } from "sanity";

/**
 * SLA packages section (phase 3C Task 5).
 *
 * Source: `slaPackages` — 1 published instance, on `services/nextjs-support`
 * (`content.body[5]`), rendered by `organisms/SlaPackages/*`.
 *
 * **Most of this section is code, on purpose (ruling P3C-2 / NO-21.)** The five
 * tiers, their names, the 5 × 3 price matrix, the included hours, the CTA
 * labels, the trust line and the “Most popular” flag live in
 * `web/src/ui/sections/SlaPackages/data.ts`, transcribed from the source's own
 * `organisms/SlaPackages/consts.ts:14-72` — whose header already declared prices
 * “code-controlled (not CMS-editable) by design”. What Storyblok held, and what
 * this schema therefore holds, is the intro, one tagline + body per tier, and
 * the comparison matrix.
 *
 * Ruling P3A-2: the colour band, vertical rhythm, dividers and anchor id all
 * belong to the `section-options` wrapper — this section declares none of them.
 */
export default defineType({
  name: "sla-packages",
  title: "SLA packages",
  icon: VscChecklist,
  type: "object",
  groups: [
    { name: "content", default: true },
    { name: "comparison" },
    { name: "options" },
  ],
  fields: [
    defineField({
      name: "options",
      title: "Section options",
      type: "section-options",
      group: "options",
    }),
    defineField({
      name: "intro",
      title: "Heading and intro",
      description: "The section's own heading and the copy above the package cards.",
      type: "simpleRichText",
      group: "content",
    }),
    defineField({
      name: "packages",
      title: "Package copy",
      description:
        "One entry per tier you want to write copy for. The tiers themselves — name, price, hours, CTA label, “Most popular” — are code (`web/src/ui/sections/SlaPackages/data.ts`); a tier with no entry here still renders, from those constants alone.",
      type: "array",
      group: "content",
      of: [defineArrayMember({ type: "slaPackageCopy" })],
      validation: (Rule) => Rule.max(6),
    }),
    defineField({
      name: "comparison",
      title: "Comparison table",
      description:
        "Imported from the source's `comparisonJson` (5 columns × 15 rows). The **Price** row is generated from the tier prices in `data.ts` and must not be authored here (`SlaPackages/index.tsx:45-80`).",
      type: "object",
      group: "comparison",
      fields: [
        defineField({
          name: "columns",
          title: "Columns",
          description:
            "One per plan, in table order. Match each name to a tier name (Care, Maintain, …) — the generated Price row is looked up BY NAME, so a column whose name matches no tier prices as an em dash.",
          type: "array",
          of: [
            defineArrayMember({
              type: "object",
              name: "slaComparisonColumn",
              title: "Column",
              fields: [
                defineField({
                  name: "name",
                  title: "Column name",
                  type: "string",
                  validation: (Rule) =>
                    Rule.required().error(
                      "The column name is what the generated Price row is matched against.",
                    ),
                }),
                defineField({
                  name: "highlighted",
                  title: "Emphasised column",
                  description:
                    "Tints the whole column. True on Maintain, Evolve and Accelerate in the source JSON.",
                  type: "boolean",
                  initialValue: false,
                }),
                defineField({
                  name: "popular",
                  title: "Most popular",
                  description:
                    "Adds the “Most popular” tag above the column name. A SEPARATE signal from the emphasis above: the source JSON carried one `popularIndex` alongside three highlighted columns. Set it on one column only.",
                  type: "boolean",
                  initialValue: false,
                }),
              ],
              preview: {
                select: { name: "name", highlighted: "highlighted", popular: "popular" },
                prepare: ({ name, highlighted, popular }) => ({
                  title: name || "Column",
                  subtitle:
                    [popular && "Most popular", highlighted && "Emphasised"]
                      .filter(Boolean)
                      .join(" · ") || "Plain",
                }),
              },
            }),
          ],
          validation: (Rule) => Rule.max(6),
        }),
        defineField({
          name: "rows",
          title: "Rows",
          description:
            "One row per compared feature. Do not add a “Price” row — it is generated.",
          type: "array",
          of: [defineArrayMember({ type: "slaComparisonRow" })],
        }),
      ],
    }),
  ],
  preview: {
    select: { packages: "packages", rows: "comparison.rows" },
    prepare: ({ packages, rows }) => ({
      title: "SLA packages",
      subtitle: [
        `${(packages as unknown[] | undefined)?.length ?? 0} tier(s) with copy`,
        `${(rows as unknown[] | undefined)?.length ?? 0} comparison row(s)`,
      ].join(" · "),
    }),
  },
});
