import { SplitHorizontalIcon } from "@sanity/icons/SplitHorizontal";
import { defineArrayMember, defineField, defineType } from "sanity";

import { count } from "@/sanity/pagepro/stubs/utils";
import { getBlockText } from "@/sanity/pagepro/lib/utils";

/**
 * Columns (visual parity C-build, owner resolution G2 + ruling VP-C17; rulings
 * C-1…C-3, C-14).
 *
 * The source is the Storyblok `grid` blok: a CSS grid whose `columnsNumber*`
 * values become `grid-template-columns` per breakpoint and whose children flow
 * into it in reading order
 * (/Users/martin/1_PROJECTS/pagepro-career-portal/apps/site/src/components/storyblok/Grid/index.tsx:27-80).
 * This section keeps exactly that model for the grids with two to five desktop
 * tracks whose cells would otherwise stack as separate sections: an ordered list
 * of cells (so a video beside three quote panels stays a 2×2 grid with aligned
 * rows), a track ratio per breakpoint, stacking below 768px, gap and alignment.
 * Page-level only — not offered inside shared sections (query budget, C-3).
 *
 * Every option list is a literal const (the migration's schema-enum scanner
 * resolves same-file consts and does not follow spreads).
 */
const RATIO_OPTIONS = [
  { title: "1 : 1 — two equal columns", value: "1:1" },
  { title: "1 : 2", value: "1:2" },
  { title: "1 : 3", value: "1:3" },
  { title: "1 : 4", value: "1:4" },
  { title: "1 : 5", value: "1:5" },
  { title: "1 : 10 — icon beside copy", value: "1:10" },
  { title: "2 : 1", value: "2:1" },
  { title: "2 : 3", value: "2:3" },
  { title: "3 : 2", value: "3:2" },
  { title: "5 : 4", value: "5:4" },
  { title: "1 : 1 : 1 — three equal columns", value: "1:1:1" },
  { title: "1 : 1 : 1 : 1 — four equal columns", value: "1:1:1:1" },
  { title: "1 : 1 : 1 : 1 : 1 — five equal columns", value: "1:1:1:1:1" },
  { title: "2 : 1 : 1", value: "2:1:1" },
];

const RATIO_TABLET_OPTIONS = [
  { title: "Stacked — one column", value: "stack" },
  { title: "1 : 1 — two equal columns", value: "1:1" },
  { title: "1 : 2", value: "1:2" },
  { title: "1 : 3", value: "1:3" },
  { title: "1 : 4", value: "1:4" },
  { title: "1 : 5", value: "1:5" },
  { title: "1 : 10 — icon beside copy", value: "1:10" },
  { title: "2 : 1", value: "2:1" },
  { title: "2 : 3", value: "2:3" },
  { title: "3 : 2", value: "3:2" },
  { title: "5 : 4", value: "5:4" },
  { title: "1 : 1 : 1 — three equal columns", value: "1:1:1" },
  { title: "1 : 1 : 1 : 1 — four equal columns", value: "1:1:1:1" },
  { title: "1 : 1 : 1 : 1 : 1 — five equal columns", value: "1:1:1:1:1" },
  { title: "2 : 1 : 1", value: "2:1:1" },
];

/** The gap steps the migrated grids author (census: rem values), in px. */
const GAP_OPTIONS = [
  { title: "None", value: "0" },
  { title: "16px", value: "1" },
  { title: "24px", value: "1.5" },
  { title: "30px", value: "1.875" },
  { title: "32px", value: "2" },
  { title: "36px", value: "2.25" },
  { title: "38px", value: "2.375" },
  { title: "40px", value: "2.5" },
  { title: "48px", value: "3" },
  { title: "50px", value: "3.125" },
  { title: "52px", value: "3.25" },
  { title: "64px", value: "4" },
  { title: "128px", value: "8" },
  { title: "138px", value: "8.625" },
  { title: "140px", value: "8.75" },
  { title: "142px", value: "8.875" },
  { title: "152px", value: "9.5" },
];

const ALIGN_OPTIONS = [
  { title: "Stretch", value: "stretch" },
  { title: "Top", value: "start" },
  { title: "Middle", value: "center" },
  { title: "Bottom", value: "end" },
];

const JUSTIFY_OPTIONS = [
  { title: "Stretch", value: "stretch" },
  { title: "Left", value: "start" },
  { title: "Centre", value: "center" },
  { title: "Right", value: "end" },
];

const TEXT_ALIGN_OPTIONS = [
  { title: "Left", value: "start" },
  { title: "Centre", value: "center" },
  { title: "Right", value: "end" },
];

const ICON_SIZE_OPTIONS = [
  { title: "Full width", value: "full" },
  { title: "32px", value: "2rem" },
  { title: "48px", value: "3rem" },
  { title: "64px", value: "4rem" },
  { title: "96px", value: "6rem" },
  { title: "128px", value: "8rem" },
];

const COLOR_THEME_OPTIONS = [
  { title: "Light", value: "light" },
  { title: "Muted (grey)", value: "muted" },
  { title: "Dark (navy)", value: "dark" },
  { title: "Dark alt (navy 2)", value: "dark-alt" },
  { title: "Accent (red)", value: "accent" },
];

const SPACING_OPTIONS = [
  { title: "None (0)", value: "none" },
  { title: "XXS (12px)", value: "xxs" },
  { title: "XS (24px)", value: "xs" },
  { title: "S (48px)", value: "s" },
  { title: "M (64px)", value: "m" },
  { title: "L (80px)", value: "l" },
  { title: "XL (96px)", value: "xl" },
  { title: "XXL (128px)", value: "xxl" },
];

const textAlignFields = [
  defineField({
    name: "textAlign",
    title: "Text alignment",
    type: "string",
    options: { layout: "radio", list: TEXT_ALIGN_OPTIONS },
    initialValue: "start",
  }),
  defineField({
    name: "textAlignMobile",
    title: "Text alignment (mobile)",
    description: "Optional — overrides the alignment above below 768px.",
    type: "string",
    options: { layout: "radio", list: TEXT_ALIGN_OPTIONS },
  }),
];

export default defineType({
  name: "content-columns",
  title: "Columns",
  icon: SplitHorizontalIcon,
  type: "object",
  groups: [{ name: "content", default: true }, { name: "layout" }, { name: "options" }],
  fields: [
    defineField({
      name: "options",
      title: "Section options",
      type: "section-options",
      group: "options",
    }),
    defineField({
      name: "ratio",
      title: "Column ratio (desktop, from 1024px)",
      type: "string",
      options: { list: RATIO_OPTIONS },
      initialValue: "1:1",
      group: "layout",
    }),
    defineField({
      name: "ratioTablet",
      title: "Column ratio (tablet, 768–1023px)",
      description: "Below 768px the cells always stack.",
      type: "string",
      options: { list: RATIO_TABLET_OPTIONS },
      initialValue: "stack",
      group: "layout",
    }),
    defineField({
      name: "gap",
      title: "Gap (desktop)",
      description: "Space between the cells — between columns and between rows.",
      type: "string",
      options: { list: GAP_OPTIONS },
      initialValue: "8.75",
      group: "layout",
    }),
    defineField({
      name: "gapTablet",
      title: "Gap (tablet)",
      type: "string",
      options: { list: GAP_OPTIONS },
      initialValue: "2",
      group: "layout",
    }),
    defineField({
      name: "gapMobile",
      title: "Gap (mobile)",
      type: "string",
      options: { list: GAP_OPTIONS },
      initialValue: "2",
      group: "layout",
    }),
    defineField({
      name: "alignItems",
      title: "Vertical alignment (desktop)",
      type: "string",
      options: { list: ALIGN_OPTIONS },
      initialValue: "stretch",
      group: "layout",
    }),
    defineField({
      name: "alignItemsTablet",
      title: "Vertical alignment (tablet)",
      type: "string",
      options: { list: ALIGN_OPTIONS },
      initialValue: "stretch",
      group: "layout",
    }),
    defineField({
      name: "alignItemsMobile",
      title: "Vertical alignment (mobile)",
      type: "string",
      options: { list: ALIGN_OPTIONS },
      initialValue: "stretch",
      group: "layout",
    }),
    defineField({
      name: "justifyItems",
      title: "Horizontal alignment (desktop)",
      type: "string",
      options: { list: JUSTIFY_OPTIONS },
      initialValue: "stretch",
      group: "layout",
    }),
    defineField({
      name: "justifyItemsTablet",
      title: "Horizontal alignment (tablet)",
      type: "string",
      options: { list: JUSTIFY_OPTIONS },
      initialValue: "stretch",
      group: "layout",
    }),
    defineField({
      name: "justifyItemsMobile",
      title: "Horizontal alignment (mobile)",
      type: "string",
      options: { list: JUSTIFY_OPTIONS },
      initialValue: "stretch",
      group: "layout",
    }),
    defineField({
      name: "cells",
      title: "Cells",
      description:
        "Filled in reading order across the columns: with two columns, cell 1 left, cell 2 right, cell 3 on the next row… On mobile they stack in this order.",
      type: "array",
      group: "content",
      of: [
        defineArrayMember({
          type: "object",
          name: "columnText",
          title: "Text",
          fields: [
            defineField({
              name: "content",
              type: "richText",
              validation: (Rule) => Rule.required().error("A text cell needs copy."),
            }),
            ...textAlignFields,
          ],
          preview: {
            select: { content: "content" },
            prepare: ({ content }) => ({
              title: getBlockText(content) || "Text",
              subtitle: "Text",
            }),
          },
        }),
        defineArrayMember({
          type: "object",
          name: "columnImage",
          title: "Image or icon",
          fields: [
            defineField({
              name: "image",
              type: "img",
              validation: (Rule) =>
                Rule.required().error("An image cell needs an image."),
            }),
            defineField({
              name: "size",
              title: "Size (desktop)",
              description: "Full width for photos; a fixed square for icons.",
              type: "string",
              options: { list: ICON_SIZE_OPTIONS },
              initialValue: "full",
            }),
            defineField({
              name: "sizeTablet",
              title: "Size (tablet)",
              description: "Optional — defaults to the desktop size.",
              type: "string",
              options: { list: ICON_SIZE_OPTIONS },
            }),
            defineField({
              name: "sizeMobile",
              title: "Size (mobile)",
              description: "Optional — defaults to the tablet size.",
              type: "string",
              options: { list: ICON_SIZE_OPTIONS },
            }),
          ],
          preview: {
            select: { media: "image.image", size: "size" },
            prepare: ({ media, size }) => ({ title: "Image", subtitle: size, media }),
          },
        }),
        defineArrayMember({
          type: "object",
          name: "columnVideo",
          title: "Video",
          fields: [
            defineField({
              name: "url",
              title: "Video URL",
              description:
                "YouTube or Vimeo — click to play, nothing loads before the click.",
              type: "url",
              validation: (Rule) => Rule.required().error("A video cell needs a URL."),
            }),
            defineField({
              name: "videoObject",
              title: "Search engine video data",
              description:
                "schema.org VideoObject, emitted as JSON-LD when `name` is set.",
              type: "object",
              options: { collapsible: true, collapsed: true },
              fields: [
                defineField({ name: "name", title: "Title", type: "string" }),
                defineField({
                  name: "description",
                  title: "Description",
                  type: "text",
                  rows: 3,
                }),
                defineField({
                  name: "thumbnailUrl",
                  title: "Thumbnail URL",
                  type: "url",
                }),
                defineField({
                  name: "uploadDate",
                  title: "Upload date",
                  type: "datetime",
                }),
                defineField({ name: "duration", title: "Duration", type: "string" }),
                defineField({ name: "embedUrl", title: "Embed URL", type: "url" }),
                defineField({
                  name: "interactionCount",
                  title: "View count",
                  type: "number",
                }),
              ],
            }),
          ],
          preview: {
            select: { url: "url" },
            prepare: ({ url }) => ({ title: "Video", subtitle: url }),
          },
        }),
        defineArrayMember({
          type: "object",
          name: "columnPanel",
          title: "Painted panel",
          description: "Copy on its own coloured surface — e.g. a quote box.",
          fields: [
            defineField({
              name: "colorTheme",
              title: "Surface",
              type: "string",
              options: { layout: "radio", list: COLOR_THEME_OPTIONS },
              initialValue: "light",
            }),
            defineField({
              name: "spacingTop",
              title: "Top padding",
              type: "string",
              options: { list: SPACING_OPTIONS },
              initialValue: "s",
            }),
            defineField({
              name: "spacingBottom",
              title: "Bottom padding",
              type: "string",
              options: { list: SPACING_OPTIONS },
              initialValue: "s",
            }),
            defineField({
              name: "spacingTopTablet",
              title: "Top padding (tablet)",
              type: "string",
              options: { list: SPACING_OPTIONS },
            }),
            defineField({
              name: "spacingBottomTablet",
              title: "Bottom padding (tablet)",
              type: "string",
              options: { list: SPACING_OPTIONS },
            }),
            defineField({
              name: "spacingTopMobile",
              title: "Top padding (mobile)",
              type: "string",
              options: { list: SPACING_OPTIONS },
            }),
            defineField({
              name: "spacingBottomMobile",
              title: "Bottom padding (mobile)",
              type: "string",
              options: { list: SPACING_OPTIONS },
            }),
            defineField({
              name: "content",
              type: "richText",
              validation: (Rule) => Rule.required().error("A panel needs copy."),
            }),
            ...textAlignFields,
          ],
          preview: {
            select: { content: "content", colorTheme: "colorTheme" },
            prepare: ({ content, colorTheme }) => ({
              title: getBlockText(content) || "Panel",
              subtitle: `Panel · ${colorTheme ?? "light"}`,
            }),
          },
        }),
        defineArrayMember({
          type: "object",
          name: "columnGallery",
          title: "Image collage",
          fields: [
            defineField({
              name: "items",
              title: "Images",
              type: "array",
              of: [
                defineArrayMember({
                  type: "object",
                  name: "columnGalleryItem",
                  title: "Image",
                  fields: [
                    defineField({
                      name: "image",
                      type: "img",
                      validation: (Rule) => Rule.required(),
                    }),
                    defineField({ name: "caption", title: "Caption", type: "string" }),
                  ],
                }),
              ],
              validation: (Rule) =>
                Rule.required()
                  .min(1)
                  .max(3)
                  .error("A collage places one to three images."),
            }),
          ],
          preview: {
            select: { items: "items", media: "items.0.image.image" },
            prepare: ({ items, media }) => ({
              title: "Collage",
              subtitle: count(items, "image"),
              media,
            }),
          },
        }),
        defineArrayMember({
          type: "object",
          name: "columnTechnologies",
          title: "Technology cards",
          fields: [
            defineField({
              name: "cards",
              title: "Cards",
              type: "array",
              of: [
                defineArrayMember({
                  type: "object",
                  name: "columnTechnologyCard",
                  title: "Card",
                  fields: [
                    defineField({
                      name: "title",
                      title: "Title",
                      type: "string",
                      validation: (Rule) => Rule.required(),
                    }),
                    defineField({
                      name: "logos",
                      title: "Logos",
                      type: "array",
                      of: [{ type: "img" }],
                      /* Review M3 — the same cap as `technologies-grid`'s card logos. */
                      validation: (Rule) => Rule.required().min(1).max(12),
                    }),
                  ],
                }),
              ],
              validation: (Rule) => Rule.required().min(1).max(4),
            }),
          ],
          preview: {
            select: { cards: "cards" },
            prepare: ({ cards }) => ({
              title: "Technology cards",
              subtitle: count(cards, "card"),
            }),
          },
        }),
      ],
      validation: (Rule) => [
        Rule.required().min(1).error("Add at least one cell."),
        Rule.max(5).warning("The migrated layouts hold at most five cells."),
      ],
    }),
  ],
  initialValue: {
    ratio: "1:1",
    ratioTablet: "stack",
    gap: "8.75",
    gapTablet: "2",
    gapMobile: "2",
    alignItems: "stretch",
    alignItemsTablet: "stretch",
    alignItemsMobile: "stretch",
    justifyItems: "stretch",
    justifyItemsTablet: "stretch",
    justifyItemsMobile: "stretch",
  },
  preview: {
    select: { ratio: "ratio", cells: "cells" },
    prepare: ({ ratio, cells }) => ({
      title: "Columns",
      subtitle: `${ratio ?? "1:1"} · ${count(cells, "cell")}`,
    }),
  },
});
