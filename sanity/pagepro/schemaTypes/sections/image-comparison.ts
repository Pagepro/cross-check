import { SplitVerticalIcon } from "@sanity/icons/SplitVertical";
import { VscSplitHorizontal } from "react-icons/vsc";
import { defineArrayMember, defineField, defineType } from "sanity";

/**
 * Image comparison (ruling R-3B-7). One section behind two Storyblok bloks:
 *
 * - `imageComparison` (6) — a single before/after pair. Two of the six carry a
 *   `sliderColor` of `#1c1c1c`; the other four leave it empty and fall back to
 *   the accent. `handleColor` is empty on all six, so it is NOT a field here —
 *   the source already fell back to `theme.colors.accent`
 *   (`molecules/ImageComparison/styles.ts:26`).
 * - `imageComparisonSlider` (1) — a carousel of four such pairs
 *   (`molecules/ImageComparisonSlider/index.tsx:24-48`).
 *
 * Both become the same section: one pair renders bare, several render inside
 * the shared carousel. There is no "slider" variant to choose — the item count
 * decides.
 */
export default defineType({
  name: "image-comparison",
  title: "Image comparison",
  icon: SplitVerticalIcon,
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
      description: "Short uppercase label above the heading, e.g. “Before and after”.",
      type: "string",
      group: "content",
    }),
    defineField({
      name: "content",
      title: "Content",
      description:
        "Optional heading and supporting copy above the comparison. Leave empty for a bare slider.",
      type: "simpleRichText",
      group: "content",
    }),
    defineField({
      name: "items",
      title: "Comparisons",
      description:
        "One before/after pair each. A single pair renders on its own; two or more become a carousel the visitor steps through.",
      type: "array",
      group: "content",
      of: [
        defineArrayMember({
          type: "object",
          name: "comparisonPair",
          title: "Comparison",
          icon: VscSplitHorizontal,
          fields: [
            defineField({
              name: "beforeImage",
              title: "Before (left)",
              description:
                "Revealed as the visitor drags the handle left. Drawn at its natural aspect ratio, up to 70% of the viewport height — give both images the SAME dimensions or the two halves will not line up. Aspect ratio 16:10, recommended 1600×1000px (landscape).",
              type: "img",
              validation: (Rule) =>
                Rule.required().error("A comparison needs a before image."),
            }),
            defineField({
              name: "afterImage",
              title: "After (right)",
              description:
                "The image on top, revealed as the handle moves right. It sets the size of the frame, so match the before image's dimensions. Aspect ratio 16:10, recommended 1600×1000px (landscape).",
              type: "img",
              validation: (Rule) =>
                Rule.required().error("A comparison needs an after image."),
            }),
            defineField({
              name: "beforeLabel",
              title: "Before label",
              description:
                "Optional caption over the left half, e.g. “2019”. Leave empty for an unlabelled comparison.",
              type: "string",
            }),
            defineField({
              name: "afterLabel",
              title: "After label",
              description:
                "Optional caption over the right half, e.g. “Today”. Also names the drag control for screen readers.",
              type: "string",
            }),
            defineField({
              name: "dividerColor",
              title: "Divider colour",
              description:
                "Divider and handle colour (source `imageComparison.sliderColor`: `#1c1c1c` on 2 of 6, empty elsewhere). Empty uses the accent colour.",
              type: "string",
              validation: (Rule) =>
                Rule.regex(/^#[0-9a-fA-F]{6}$/).error("Use a 6-digit hex colour."),
            }),
          ],
          preview: {
            select: {
              beforeLabel: "beforeLabel",
              afterLabel: "afterLabel",
              media: "beforeImage.image",
            },
            prepare: ({ beforeLabel, afterLabel, media }) => ({
              title: "Before / after",
              subtitle:
                beforeLabel || afterLabel
                  ? `${beforeLabel || "Before"} → ${afterLabel || "After"}`
                  : undefined,
              media,
            }),
          },
        }),
      ],
      validation: (Rule) =>
        Rule.required()
          .min(1)
          .error("Add at least one comparison — an empty section renders nothing."),
    }),
  ],
  preview: {
    select: { items: "items", media: "items.0.beforeImage.image" },
    prepare: ({ items, media }) => ({
      title: "Image comparison",
      subtitle: `${items?.length ?? 0} comparison${items?.length === 1 ? "" : "s"}`,
      media,
    }),
  },
});
