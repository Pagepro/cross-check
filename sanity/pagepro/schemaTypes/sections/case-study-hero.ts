import { TfiLayoutMediaRightAlt } from "react-icons/tfi";
import { defineField, defineType } from "sanity";

/**
 * Case-study hero — the opening module of a case-study page, ported from the
 * Storyblok `case_study_hero` blok. Headline + supporting line on the left, the
 * client artwork on the right.
 *
 * The six Storyblok spacing fields (`spacing{Mobile,Tablet,Desktop}{Top,Bottom}`)
 * are NOT repeated here: they map onto `section-options` spacing, same as every
 * other ported section. The blok's `backgroundColor` maps onto
 * `section-options.colorTheme`; the band's authored hex colours are carried
 * verbatim as `bandColor` / `bandTextColor` (GP-H1).
 *
 * This is the only section that renders an `<h1>` (phase-1 heading boundary), so
 * `title` is required.
 */
export default defineType({
  name: "case-study-hero",
  title: "Case Study Hero",
  type: "object",
  icon: TfiLayoutMediaRightAlt,
  groups: [{ name: "content", default: true }, { name: "options" }],
  fields: [
    defineField({
      name: "options",
      title: "Section options",
      type: "section-options",
      group: "options",
    }),
    defineField({
      name: "subtitle",
      title: "Subtitle",
      description:
        "Short line above the headline — usually the client name (source `case_study_hero.subtitle`).",
      type: "string",
      group: "content",
    }),
    defineField({
      name: "title",
      title: "Headline",
      description:
        "The page's H1. This is the only section that renders one, so every case study needs it.",
      type: "string",
      validation: (Rule) =>
        Rule.required().error("The hero headline is the page's H1 — it cannot be empty."),
      group: "content",
    }),
    defineField({
      name: "image",
      title: "Hero image",
      description:
        "Client artwork beside the headline. Rendered `object-contain` at up to half the page width, so the whole image always shows. Aspect ratio 4:5, recommended 1600×2000px (portrait).",
      type: "img",
      validation: (Rule) => Rule.required().error("The hero needs an image."),
      group: "content",
    }),
    /* GP-H1 — the source hero sits in a band painted with the client's colour
       and white copy (`SectionStoryblok/index.tsx:46-66`); 21 distinct values,
       so a hex like `case-study.imageBackgroundColor` rather than a theme. */
    defineField({
      name: "bandColor",
      title: "Band colour",
      description:
        "Hex colour painted across the whole hero band, e.g. #C5DEF8. Empty = the section theme.",
      type: "string",
      validation: (Rule) =>
        Rule.regex(/^#[0-9a-fA-F]{6}$/, { name: "hex colour" }).error(
          "Use a hex colour, e.g. #C5DEF8.",
        ),
      group: "content",
    }),
    defineField({
      name: "bandTextColor",
      title: "Band text colour",
      description:
        "Hex colour of the subtitle and headline on the band, e.g. #FFFFFF. Empty = the section theme's text colour.",
      type: "string",
      validation: (Rule) =>
        Rule.regex(/^#[0-9a-fA-F]{6}$/, { name: "hex colour" }).error(
          "Use a hex colour, e.g. #FFFFFF.",
        ),
      group: "content",
    }),
    defineField({
      name: "isImageCentered",
      title: "Centre the image",
      description:
        "Off: the image is flush with the right edge of the container. On: it is centred in its column, inset 1.25rem from the right.",
      type: "boolean",
      initialValue: false,
      group: "content",
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "subtitle", media: "image.image" },
    prepare: ({ title, subtitle, media }) => ({
      title: title || "Case Study Hero",
      subtitle: subtitle ? `Case Study Hero · ${subtitle}` : "Case Study Hero",
      media,
    }),
  },
});
