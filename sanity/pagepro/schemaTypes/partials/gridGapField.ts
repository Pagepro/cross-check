import { defineField } from "sanity";

type HiddenCallback = (context: { parent?: { variant?: string } }) => boolean;

/**
 * GP-M3 / AB-A4 — a source `grid`'s row and column gaps per breakpoint
 * (`storyblok/Grid/index.tsx:50-68`), stored as CSS lengths. Shared by the
 * media-gallery image grid and the feature-grid icon boxes; inline `object` so the
 * stored shape stays `{ _type: "object", … }` in both.
 */
export const gridGapField = ({
  description,
  hidden,
}: {
  description: string;
  hidden: HiddenCallback;
}) =>
  defineField({
    name: "gridGap",
    title: "Grid gaps",
    description,
    type: "object",
    group: "options",
    hidden: hidden as never,
    options: { collapsible: true, collapsed: true },
    fields: (
      [
        ["columnMobile", "Column gap (mobile)"],
        ["columnTablet", "Column gap (tablet)"],
        ["column", "Column gap (desktop)"],
        ["rowMobile", "Row gap (mobile)"],
        ["rowTablet", "Row gap (tablet)"],
        ["row", "Row gap (desktop)"],
      ] as const
    ).map(([name, title]) =>
      defineField({
        name,
        title,
        type: "string",
        validation: (Rule) =>
          Rule.regex(/^\d+(\.\d+)?(px|rem)$/, { name: "CSS length" }).error(
            "Use a length in px or rem, e.g. 30px or 2rem.",
          ),
      }),
    ),
  });
