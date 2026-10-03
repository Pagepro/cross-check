import { ImagesIcon } from "@sanity/icons/Images";
import { VscFileMedia } from "react-icons/vsc";
import { defineArrayMember, defineField, defineType } from "sanity";

import { gridGapField } from "../partials/gridGapField";

/**
 * Ruling P3B-10 — most images the `collage` arrangement can place. The source
 * positions `:first-child`, `:nth-child(2)` and `:nth-child(3)` and nothing
 * beyond (`molecules/ImagesWithCaptions/styles.ts:19-58`), so a fourth item has
 * nowhere to go. The renderer slices to this same number
 * (`web/src/ui/sections/MediaGallery/gallery-collage.tsx` `COLLAGE_ITEM_LIMIT`)
 * — duplicated rather than shared because the web package must never import the
 * Studio schema runtime (package-boundary rule).
 */
const COLLAGE_ITEM_LIMIT = 3;

/**
 * Visual parity C-build (owner resolution NO-14) — most photos the `matrix`
 * arrangement places: the source positions `:nth-of-type(1…5)` and hides
 * `n + 6` (`molecules/ImagesMatrix/styles.ts:35-69`). The renderer slices to the
 * same number (`MediaGallery/gallery-matrix.tsx` `MATRIX_ITEM_LIMIT`).
 */
const MATRIX_ITEM_LIMIT = 5;

/** The per-variant item cap as one expression: a message, or `true`. */
const itemLimitMessage = (variant: unknown, itemCount: number): string | true =>
  variant === "collage" && itemCount > COLLAGE_ITEM_LIMIT
    ? "Collage shows at most three images"
    : variant === "matrix" && itemCount > MATRIX_ITEM_LIMIT
      ? "Matrix shows at most five images"
      : true;

/**
 * Media gallery (ruling R-3B-2 / R-3B-3). One section replaces three Storyblok
 * bloks, each carried by its own variant:
 *
 * - `image` (229) — a run of standalone images inside a `grid`. The transformer
 *   groups one grid's image run into ONE `grid` section and takes the column
 *   count from the enclosing `grid.columnsNumberDesktop`.
 * - `image_grid` (23) → `image_grid_block` (32) → `image_grid_block_item` (55)
 *   — the `rows` variant: blocks of one or two images, each item carrying its
 *   own background colour.
 * - `imagesWithCaptions` (6) → `imageWithCaption` (18) — the `collage` variant:
 *   three overlapping figures with optional captions.
 *
 * - `imagesMatrix` (3) — the `matrix` variant (visual parity C-build, owner
 *   resolution NO-14, superseding R-3B-3b): up to five photos absolutely placed
 *   over the WHOLE band and hidden below 1024px, the band's backdrop image
 *   (`options.backgroundImage`, drawn contained) and the band's eyebrow, copy + buttons
 *   above them. The frame becomes the positioned, clipping box through the
 *   component's `frameDecoration` (`web/src/ui/sections/section-frame.tsx`).
 */
export default defineType({
  name: "media-gallery",
  title: "Media gallery",
  icon: ImagesIcon,
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
        "Grid — equal cells in 2–6 columns. Rows — one or two large images per row. Collage — three overlapping images, stacked on mobile. Matrix — up to five photos scattered behind the band's copy (desktop only); set the backdrop in Section options → Background image.",
      type: "string",
      initialValue: "grid",
      options: {
        layout: "radio",
        list: [
          { title: "Grid — equal cells", value: "grid" },
          { title: "Rows — 1–2 large images per row", value: "rows" },
          { title: "Collage — 3 overlapping images", value: "collage" },
          { title: "Matrix — up to 5 photos behind the copy", value: "matrix" },
        ],
      },
      group: "options",
    }),
    defineField({
      name: "columns",
      title: "Columns",
      description:
        "Desktop columns (source `grid.columnsNumberDesktop` on image grids: 6 ×18, 2 ×11, 5 ×5, 3 ×3; 6 grids carry composite values the transformer rounds and reports — R-3B-2). Tablet and mobile take their own counts below.",
      type: "number",
      initialValue: 3,
      options: {
        list: [
          { title: "2", value: 2 },
          { title: "3", value: 3 },
          { title: "4", value: 4 },
          { title: "5", value: 5 },
          { title: "6", value: 6 },
        ],
      },
      group: "options",
      hidden: ({ parent }) => parent?.variant !== "grid",
    }),
    /* GP-M3 — the source image grid's own tablet / mobile counts and gaps
       (`storyblok/Grid/index.tsx:39-68`). A grid image draws at its own width
       capped by its cell (GP-M1), so the cell width — counts AND gaps — decides
       its size: the fixed ramp drew evouchers' 3-up phone shots 2-up and 239px
       wide at 820 where the source has 150px. Empty = the section's default ramp
       and gaps. */
    defineField({
      name: "columnsTablet",
      title: "Columns (tablet)",
      description: "Columns from 768px to 1023px. Empty = the default ramp.",
      type: "number",
      options: {
        list: [
          { title: "1", value: 1 },
          { title: "2", value: 2 },
          { title: "3", value: 3 },
          { title: "4", value: 4 },
          { title: "5", value: 5 },
          { title: "6", value: 6 },
        ],
      },
      group: "options",
      hidden: ({ parent }) => parent?.variant !== "grid",
    }),
    defineField({
      name: "columnsMobile",
      title: "Columns (mobile)",
      description: "Columns below 768px. Empty = the default ramp.",
      type: "number",
      options: {
        list: [
          { title: "1", value: 1 },
          { title: "2", value: 2 },
          { title: "3", value: 3 },
        ],
      },
      group: "options",
      hidden: ({ parent }) => parent?.variant !== "grid",
    }),
    gridGapField({
      description:
        "CSS lengths (e.g. 30px or 2rem) between columns and rows, per breakpoint. Empty = the default gaps.",
      hidden: ({ parent }) => parent?.variant !== "grid",
    }),
    defineField({
      name: "pretitle",
      title: "Tagline",
      description: "Short uppercase label above the heading, e.g. “Our work”.",
      type: "string",
      group: "content",
    }),
    /* AB-H1 — the matrix band's eyebrow as the source authored it: on /about it is
       the page's `<h1>` in the `heading4` look (live: Galderglynn 900, 16px → 22px
       from 48rem), spaced from the copy by its own S / M / S spacer (48 / 64 /
       48px); every other matrix band keeps the small label and the XS gap. */
    defineField({
      name: "pretitleAs",
      title: "Tagline shown as",
      description:
        "Label = the small uppercase tagline. Page heading = the page's H1 (22px heading); use it only when nothing else on the page is the H1.",
      type: "string",
      options: {
        list: [
          { title: "Label", value: "label" },
          { title: "Page heading (H1)", value: "h1" },
        ],
        layout: "radio",
      },
      initialValue: "label",
      group: "content",
      hidden: ({ parent }) => parent?.variant !== "matrix",
    }),
    defineField({
      name: "pretitleGapMobile",
      title: "Tagline gap (mobile)",
      type: "string",
      options: {
        list: [
          { title: "24px", value: "xs" },
          { title: "48px", value: "s" },
          { title: "64px", value: "m" },
        ],
        layout: "radio",
      },
      group: "content",
      hidden: ({ parent }) => parent?.variant !== "matrix",
    }),
    defineField({
      name: "pretitleGapTablet",
      title: "Tagline gap (tablet)",
      type: "string",
      options: {
        list: [
          { title: "24px", value: "xs" },
          { title: "48px", value: "s" },
          { title: "64px", value: "m" },
        ],
        layout: "radio",
      },
      group: "content",
      hidden: ({ parent }) => parent?.variant !== "matrix",
    }),
    defineField({
      name: "pretitleGap",
      title: "Tagline gap (desktop)",
      type: "string",
      options: {
        list: [
          { title: "24px", value: "xs" },
          { title: "48px", value: "s" },
          { title: "64px", value: "m" },
        ],
        layout: "radio",
      },
      group: "content",
      hidden: ({ parent }) => parent?.variant !== "matrix",
    }),

    defineField({
      name: "content",
      title: "Content",
      description:
        "Optional heading and supporting copy above the images. Leave empty for a bare gallery.",
      type: "simpleRichText",
      group: "content",
    }),
    defineField({
      name: "ctas",
      title: "Call-to-actions",
      description: "Matrix only — the buttons under the copy.",
      type: "array",
      of: [{ type: "cta" }],
      group: "content",
      hidden: ({ parent }) => parent?.variant !== "matrix",
      validation: (Rule) =>
        Rule.max(2).warning("The matrix band is designed for one or two buttons."),
    }),
    defineField({
      name: "items",
      title: "Images",
      description:
        "The images of the gallery, in order. Rows pairs them up; Collage places exactly three.",
      type: "array",
      group: "content",
      of: [
        defineArrayMember({
          type: "object",
          name: "mediaGalleryItem",
          title: "Image",
          icon: VscFileMedia,
          fields: [
            defineField({
              name: "image",
              title: "Image",
              description:
                "Drawn contained inside its tile, so any aspect ratio works. Grid cells are square — recommended 1200×1200px; Rows cells are 2:1 — recommended 2000×1000px (landscape); Collage figures are roughly 4:3 — recommended 1200×900px (landscape).",
              type: "img",
              validation: (Rule) =>
                Rule.required().error("Every gallery item needs an image."),
            }),
            defineField({
              name: "caption",
              title: "Caption",
              description: "Shown only in the Collage variant.",
              type: "string",
            }),
            /* A real boolean rather than the house `string` + `options.list`
               pattern, for the same reason `data-table.captionVisible` is one:
               this is the source's binary "the block held a single image"
               (`image_grid_block.images.length === 1`,
               `molecules/ImageGrid/index.tsx:20`) with no third state to name. */
            defineField({
              name: "wide",
              title: "Full-width row",
              description:
                "Rows variant: this image takes the full row instead of sharing it with the next one.",
              type: "boolean",
              initialValue: false,
            }),
            defineField({
              name: "tileColor",
              title: "Tile colour",
              description:
                "Tile background behind this image (source `image_grid_block_item.backgroundColor`: 18 distinct values over 55 items, most common `#e7eef1`). Empty falls back to the muted card surface. Grid and Rows only — Collage figures have no tile.",
              type: "string",
              validation: (Rule) =>
                Rule.regex(/^#[0-9a-fA-F]{6}$/).error(
                  "Use a 6-digit hex colour, e.g. #E7EEF1.",
                ),
            }),
          ],
          preview: {
            select: { caption: "caption", media: "image.image" },
            prepare: ({ caption, media }) => ({ title: caption || "Image", media }),
          },
        }),
      ],
      /* Two independent rules rather than one chain: each carries its own
         message, and the per-variant item cap (collage, matrix) has to see the
         sibling `variant` (`context.parent` is the section object). Ruling
         P3B-10; NO-14 for the matrix. */
      validation: (Rule) => [
        Rule.required()
          .min(1)
          .error("Add at least one image — an empty gallery renders nothing."),
        Rule.custom((items, context) =>
          itemLimitMessage(
            (context.parent as { variant?: string } | undefined)?.variant,
            (items as unknown[] | undefined)?.length ?? 0,
          ),
        ),
      ],
    }),
  ],
  initialValue: { variant: "grid", columns: 3 },
  preview: {
    select: { variant: "variant", items: "items", media: "items.0.image.image" },
    prepare: ({ variant, items, media }) => ({
      title: "Media gallery",
      subtitle: `${variant === "rows" ? "Rows" : variant === "collage" ? "Collage" : variant === "matrix" ? "Matrix" : "Grid"} · ${items?.length ?? 0} image${items?.length === 1 ? "" : "s"}`,
      media,
    }),
  },
});
