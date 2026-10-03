import {
  VscCheck,
  VscListTree,
  VscListUnordered,
  VscSymbolField,
  VscTable,
} from "react-icons/vsc";
import { defineArrayMember, defineField, defineType } from "sanity";

import { count } from "@/sanity/pagepro/stubs/utils";
import { getBlockText } from "@/sanity/pagepro/lib/utils";

/** Cell visual states — kept in sync with the frontend render mapping (ComparisonTable/constants.ts). */
const CELL_STATES = ["included", "excluded", "text", "addon", "list"] as const;

export default defineType({
  name: "comparison-table",
  title: "Comparison table",
  icon: VscTable,
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
      description: "Short uppercase label above the heading, e.g. “Pricing”.",
      type: "string",
      group: "content",
    }),
    defineField({
      name: "content",
      title: "Content",
      description:
        "Section heading and supporting copy, e.g. “Compare every feature”. Use the heading-2 block style for the heading.",
      type: "simpleRichText",
      group: "content",
    }),
    defineField({
      name: "plans",
      title: "Plan columns",
      description:
        "The plan columns of the table (2–4). Each column carries a name, price and CTA. ⚠️ Keep the name/price in sync with the Pricing section's cards — they are authored separately. The order of these columns must match the order of every feature row's cells below.",
      type: "array",
      group: "content",
      of: [
        defineArrayMember({
          type: "object",
          name: "plan",
          icon: VscSymbolField,
          fields: [
            defineField({
              name: "name",
              title: "Plan name",
              type: "string",
              validation: (Rule) =>
                Rule.required().error("Each plan column needs a name."),
            }),
            defineField({
              name: "price",
              title: "Price",
              description:
                "Displayed price, e.g. “$249” or “Custom”. Must be kept in sync with the Pricing section's cards by hand.",
              type: "string",
              validation: (Rule) =>
                Rule.required().error("Each plan column needs a price."),
            }),
            defineField({
              name: "priceSuffix",
              title: "Price suffix",
              description:
                "Small text after the price, e.g. “/mo”. Leave blank for “Custom”.",
              type: "string",
            }),
            defineField({
              name: "featured",
              title: "Emphasis",
              description:
                "“Featured” highlights this column (tinted panel + star) to draw the eye to the recommended plan.",
              type: "string",
              options: {
                list: ["default", "featured"],
                layout: "radio",
              },
              initialValue: "default",
            }),
            defineField({
              name: "cta",
              title: "Call-to-action",
              description:
                "The buy/contact button shown in this column's header. A column with no CTA link renders no button.",
              type: "cta",
            }),
          ],
          preview: {
            select: { title: "name", price: "price", featured: "featured" },
            prepare: ({ title, price, featured }) => ({
              title: title || "Plan",
              subtitle: [price, featured === "featured" && "· Featured"]
                .filter(Boolean)
                .join(" "),
            }),
          },
        }),
      ],
      validation: (Rule) =>
        Rule.required().min(2).max(4).error("Add between 2 and 4 plan columns."),
    }),
    defineField({
      // Named `featureGroups` (not `groups`) to avoid shadowing the schema-level
      // `groups` field-group/tabs key declared above.
      name: "featureGroups",
      title: "Feature groups",
      description:
        "Feature rows organised into named category groups (e.g. “Attribution”, “Integrations”). At least one group is required.",
      type: "array",
      group: "content",
      of: [
        defineArrayMember({
          type: "object",
          name: "featureGroup",
          icon: VscListTree,
          fields: [
            defineField({
              name: "title",
              title: "Category title",
              type: "string",
              validation: (Rule) =>
                Rule.required().error("Each feature group needs a title."),
            }),
            defineField({
              name: "description",
              title: "Category description",
              description:
                "Optional one-line description shown beside the category title.",
              type: "text",
              rows: 2,
            }),
            defineField({
              name: "rows",
              title: "Feature rows",
              type: "array",
              validation: (Rule) =>
                Rule.required().min(1).error("Add at least one feature row."),
              of: [
                defineArrayMember({
                  type: "object",
                  name: "featureRow",
                  icon: VscListUnordered,
                  fields: [
                    defineField({
                      name: "label",
                      title: "Feature label",
                      type: "string",
                      validation: (Rule) =>
                        Rule.required().error("Each feature row needs a label."),
                    }),
                    defineField({
                      name: "hint",
                      title: "Hint",
                      description:
                        "Optional clarification shown in a tooltip behind an info icon next to the label.",
                      type: "string",
                    }),
                    defineField({
                      name: "cells",
                      title: "Per-plan values",
                      description:
                        "One cell per plan column, in the same order as the Plan columns above. ⚠️ If you reorder the plan columns, you must re-check every row's cells — the values are matched to columns by position, not by name.",
                      type: "array",
                      of: [
                        defineArrayMember({
                          type: "object",
                          name: "cell",
                          icon: VscCheck,
                          fields: [
                            defineField({
                              name: "state",
                              title: "State",
                              description:
                                "Included → check icon (plus the value, if set). Excluded → ✕. Text → the value only. Add-on → a dark “Add-on” pill (override the pill text with the value). List → a stacked checklist, one check per entry in Values.",
                              type: "string",
                              options: {
                                list: [...CELL_STATES],
                                layout: "radio",
                              },
                              initialValue: "included",
                            }),
                            defineField({
                              name: "value",
                              title: "Value",
                              description:
                                "Optional text, e.g. “90 days” or “Salesforce, HubSpot”.",
                              type: "string",
                              hidden: ({ parent }) => parent?.state === "list",
                            }),
                            defineField({
                              name: "values",
                              title: "List values",
                              description:
                                "Used only when State is “List” — one checklist item per entry, each shown with its own check icon (e.g. individual connectors).",
                              type: "array",
                              of: [defineArrayMember({ type: "string" })],
                              hidden: ({ parent }) => parent?.state !== "list",
                            }),
                          ],
                          preview: {
                            select: { state: "state", value: "value", values: "values" },
                            prepare: ({ state, value, values }) => ({
                              title:
                                value ||
                                (values?.length ? values.join(", ") : state) ||
                                "Cell",
                              subtitle: state,
                            }),
                          },
                        }),
                      ],
                      validation: (Rule) =>
                        Rule.warning(
                          "Add one cell per plan column, in the same order as the Plan columns.",
                        ),
                    }),
                  ],
                  preview: {
                    select: { title: "label", cells: "cells" },
                    prepare: ({ title, cells }) => ({
                      title: title || "Feature",
                      subtitle: cells?.length ? count(cells, "value") : undefined,
                    }),
                  },
                }),
              ],
            }),
          ],
          preview: {
            select: { title: "title", rows: "rows" },
            prepare: ({ title, rows }) => ({
              title: title || "Feature group",
              subtitle: rows?.length ? count(rows, "feature") : undefined,
            }),
          },
        }),
      ],
      validation: (Rule) =>
        Rule.required().min(1).error("Add at least one feature group."),
    }),
    defineField({
      name: "footnote",
      title: "Footnote",
      description:
        "Small print shown below the table, e.g. “* Caveats and other conditions”.",
      type: "string",
      group: "content",
    }),
  ],
  preview: {
    select: { content: "content", plans: "plans" },
    prepare: ({ content, plans }) => ({
      title: getBlockText(content) || "Comparison table",
      subtitle: plans?.length ? count(plans, "plan column") : "Comparison table",
    }),
  },
});
