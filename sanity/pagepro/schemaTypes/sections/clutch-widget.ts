import { VscStarFull } from "react-icons/vsc";
import { defineField, defineType } from "sanity";

import { getBlockText } from "@/sanity/pagepro/lib/utils";

/**
 * Clutch widget (Task 12) — the section behind the Storyblok `clutchWidget`
 * blok (2 occurrences, source `molecules/ClutchWidget/index.tsx`).
 *
 * `widget.clutch.co` is loaded by a third-party script, so the renderer keeps
 * the whole embed behind the `marketing` consent gate (R-3B-17, NO-10): the
 * script tag is not even mounted until the visitor allows it.
 *
 * The source hard-codes every other widget argument (`data-url`, `data-scale`,
 * `data-nofollow`, `data-expandifr`, `data-height` and the four colours,
 * `index.tsx:34-43`); those stay in the component, not in the CMS. Only the
 * three arguments the source actually varied — widget type, reviews and the
 * company id — are fields here.
 */
export default defineType({
  name: "clutch-widget",
  title: "Clutch reviews",
  icon: VscStarFull,
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
      description: "Short uppercase label above the heading, e.g. “What clients say”.",
      type: "string",
      group: "content",
    }),
    defineField({
      name: "content",
      title: "Content",
      description:
        "Optional heading and supporting copy above the reviews. Leave empty for a bare widget.",
      type: "simpleRichText",
      group: "content",
    }),
    defineField({
      name: "widgetType",
      title: "Widget type",
      description:
        "Clutch's own widget layout number (source `clutchWidget.type`). Both occurrences used 8; 4 is the other layout the component schema allows.",
      type: "string",
      initialValue: "8",
      options: {
        layout: "radio",
        list: [
          { title: "8 — review carousel", value: "8" },
          { title: "4 — compact badge row", value: "4" },
        ],
      },
      group: "content",
    }),
    defineField({
      name: "reviews",
      title: "Reviews",
      description:
        "Comma-separated Clutch review IDs, or the total review count (both shapes observed: `31` and `247687,232045,…`). Passed to the widget unchanged.",
      type: "string",
      /* The value reaches a `data-*` attribute the Clutch script reads. There is
         no injection risk (React escapes attribute values), but only the two
         shapes above are meaningful to the widget — pinning them turns a typo
         into an authoring error instead of a silently blank widget (final
         review M6). */
      validation: (Rule) =>
        Rule.regex(/^(\d+(,\d+)*)?$/, {
          name: "review count or comma-separated IDs",
        }).error(
          "Digits only, optionally comma-separated — e.g. `31` or `247687,232045`.",
        ),
      group: "content",
    }),
    defineField({
      name: "companyId",
      title: "Clutch company ID",
      description:
        "Pagepro's Clutch company id, hard-coded in the source (`molecules/ClutchWidget/index.tsx:42`). Read-only — changing it would point the widget at another company's profile.",
      type: "string",
      initialValue: "34056",
      readOnly: true,
      group: "content",
    }),
  ],
  initialValue: { widgetType: "8", companyId: "34056" },
  preview: {
    select: { content: "content", widgetType: "widgetType", reviews: "reviews" },
    prepare: ({ content, widgetType, reviews }) => ({
      title: getBlockText(content) || "Clutch reviews",
      subtitle: `Widget type ${widgetType || "8"}${reviews ? ` · ${reviews}` : ""}`,
    }),
  },
});
