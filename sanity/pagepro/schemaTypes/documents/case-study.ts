import { VscFile } from "react-icons/vsc";
import { defineArrayMember, defineField, defineType } from "sanity";

import sections from "../fragments/sections";

export default defineType({
  name: "case-study",
  title: "Case study",
  icon: VscFile,
  type: "document",
  groups: [
    { name: "content", title: "Content", default: true },
    { name: "listing", title: "Listing & meta" },
    { name: "metadata", title: "Metadata" },
  ],
  fields: [
    defineField({
      name: "publishedAt",
      title: "Published at",
      description: "Secondary sort key for listings (after “Listing priority”).",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
      group: "listing",
    }),
    defineField({
      name: "categories",
      title: "Categories",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
      description:
        "Drives the case-studies filter pills and the /case-studies/category/{slug} routes. Values must stay in sync in two places: this schema list and web CaseStudiesListingSection/constants.ts CATEGORIES (the pill order and the URL slugs).",
      options: {
        // The five distinct `tag_list` values the published Storyblok
        // `case_study_page` stories actually carry (controller ruling P3A-8) —
        // NOT the wider `categories` datasource, whose extra entries route
        // nowhere.
        list: [
          { title: "Next.js and React.js", value: "Next.js and React.js" },
          { title: "Expo and React Native", value: "Expo and React Native" },
          { title: "Composable", value: "Composable" },
          { title: "Sanity", value: "Sanity" },
          { title: "Team Augmentation", value: "Team Augmentation" },
        ],
      },
      validation: (Rule) =>
        Rule.min(1).error(
          "Pick at least one category so the case study can be filtered.",
        ),
      group: "listing",
    }),
    defineField({
      name: "priority",
      title: "Listing priority",
      description:
        "Higher first in listings (source `priority`). Ties fall back to the publish date.",
      type: "number",
      validation: (Rule) => Rule.integer().min(0),
      group: "listing",
    }),
    defineField({
      name: "listingOrder",
      title: "Listing order",
      description:
        "Tie-break inside a priority band — LOWER shows first. Carried from the old site's own story sequence, which is what /case-studies rendered: Storyblok returned the stories in its folder order and the page re-sorted them by priority alone, so two case studies sharing a priority kept that sequence. Reorder these numbers to reorder the listing; leave a gap between them so a new case study can be slotted in without renumbering.",
      type: "number",
      validation: (Rule) => Rule.integer().min(0),
      group: "listing",
    }),
    defineField({
      name: "eyebrow",
      title: "Eyebrow",
      description:
        "Small uppercase label above the headline on cards. Defaults to “Case study” if left empty.",
      type: "string",
      group: "listing",
    }),
    defineField({
      name: "logo",
      title: "Client logo",
      description:
        "Client logo. NOT rendered yet — the bespoke detail layout it belonged to was replaced by the section builder in phase 3A; a logo-bearing section re-consumes it in phase 3B. Aspect ratio ~5:1, recommended 456×88px (landscape, transparent PNG).",
      type: "img",
      group: "listing",
    }),
    defineField({
      name: "image",
      title: "Cover image",
      description:
        "Card cover image. Aspect ratio 4:3, recommended 800×600px (landscape).",
      type: "img",
      validation: (Rule) => Rule.required().error("A case study needs a cover image."),
      group: "listing",
    }),
    defineField({
      name: "imageBackgroundColor",
      title: "Image background colour",
      description:
        "Hex colour behind the cover image on cards and the hero (source imageBackgroundColor).",
      type: "string",
      validation: (Rule) =>
        Rule.regex(/^#[0-9a-fA-F]{6}$/, {
          name: "hex colour",
          invert: false,
        }).error("Use a six-digit hex colour, e.g. #F5ADD8."),
      group: "listing",
    }),
    defineField({
      name: "excerpt",
      title: "Excerpt",
      description:
        "Lead paragraph under the H1, also used as the SEO description and card subtitle.",
      type: "text",
      rows: 3,
      validation: (Rule) => Rule.max(200).warning("Keep excerpts concise"),
      group: "listing",
    }),
    defineField({
      name: "info",
      title: "Key facts",
      description:
        "Short bulleted outcome list (source: the single `rich_text` blok in `case_study_page.info`). `pageRichText` because the only populated source value is a bullet list — `simpleRichText` has no lists (ruling P3A-15).",
      type: "pageRichText",
      group: "listing",
    }),
    defineField({
      name: "techStackIcons",
      title: "Tech stack icons",
      description:
        "Technology badges shown in a row on the case-study listing card (source card data — `AllCaseStudies`/`CaseStudiesCarousel`). Square, recommended 96×96px (transparent SVG/PNG); give each one alt text.",
      type: "array",
      of: [defineArrayMember({ type: "img" })],
      group: "listing",
    }),
    defineField({
      name: "authors",
      title: "Author",
      description:
        "The case-study author. NOT rendered yet — the byline moved out with the bespoke detail layout in phase 3A; a byline-bearing section re-consumes it in phase 3B.",
      type: "array",
      of: [defineArrayMember({ type: "reference", to: [{ type: "author" }] })],
      validation: (Rule) => Rule.max(1).warning("Only the first author is shown."),
      group: "listing",
    }),
    defineField({
      name: "metrics",
      title: "Metrics",
      description: "Headline stats shown in the card below the lead paragraph.",
      type: "array",
      group: "listing",
      of: [
        defineArrayMember({
          type: "object",
          name: "metric",
          fields: [
            defineField({
              name: "value",
              title: "Value",
              description: "The number, e.g. “43%”, “2.4×”, “11 days”.",
              type: "string",
              validation: (Rule) => Rule.required().error("A metric needs a value."),
            }),
            defineField({
              name: "label",
              title: "Label",
              description:
                "What the number describes, e.g. “Average increase in win rate”.",
              type: "string",
              validation: (Rule) => Rule.required().error("A metric needs a label."),
            }),
          ],
          preview: {
            select: { value: "value", label: "label" },
            prepare: ({ value, label }) => ({ title: value, subtitle: label }),
          },
        }),
      ],
    }),
    defineField({
      // The case-study body is the same section builder a `page` uses (phase 3A
      // Task 3). The FIRST section must be a `case-study-hero`: it is the only
      // section that renders an <h1>, so without it the page ships with no
      // headline at all (ruling P3A-18, layer a — layer b is the route's
      // screen-reader fallback, which covers documents written through the API
      // where this validation never runs).
      ...sections,
      description: "Case study content — always starts with a Case study hero.",
      group: "content",
      validation: (Rule) =>
        Rule.custom((value: { _type?: string }[] | undefined) =>
          !value?.length || value[0]?._type === "case-study-hero"
            ? true
            : "A case study must start with a Case study hero",
        ).error(),
    }),
    defineField({
      name: "body",
      title: "Body (legacy)",
      description:
        "Superseded by sections (phase 3A). Kept so existing articles are not lost.",
      type: "pageRichText",
      hidden: true,
      group: "content",
    }),
    defineField({
      name: "quote",
      title: "Quote",
      description:
        "A single large testimonial. NOT rendered yet — put a Testimonials section in the case study's content instead; re-consumed by a dedicated section in phase 3B.",
      type: "array",
      of: [defineArrayMember({ type: "reference", to: [{ type: "testimonial" }] })],
      validation: (Rule) => Rule.max(1).warning("Only the first testimonial is shown."),
      group: "content",
    }),
    defineField({
      name: "stickyButtonHidden",
      title: "Hide the sticky CTA",
      type: "boolean",
      description:
        "Hides the site-wide sticky CTA (Site settings → Behaviors) on this case study.",
      group: "content",
      initialValue: false,
    }),
    defineField({
      name: "hideAiChatWidget",
      title: "Hide the AI chat widget",
      type: "boolean",
      description: "Hide the site-wide AI chat bubble on this case study.",
      group: "content",
      initialValue: false,
    }),
    defineField({
      name: "link",
      title: "External link override",
      description:
        "Optional — point the card to an off-site case study instead of the detail page. Leave empty to link to /case-studies/{slug}.",
      type: "link",
      group: "listing",
    }),
    defineField({
      // Headline + routing slug live here. The case study routes via
      // metadata.slug.current (/case-studies/{slug}) and renders metadata.title
      // as the H1.
      name: "metadata",
      type: "metadata",
      group: "metadata",
    }),
  ],
  orderings: [
    {
      title: "Listing order (priority, then newest)",
      name: "listingOrder",
      by: [
        { field: "priority", direction: "desc" },
        { field: "publishedAt", direction: "desc" },
      ],
    },
    {
      title: "Published, newest first",
      name: "publishedAtDesc",
      by: [{ field: "publishedAt", direction: "desc" }],
    },
  ],
  preview: {
    select: {
      title: "metadata.title",
      eyebrow: "eyebrow",
      categories: "categories",
      media: "image.image",
    },
    prepare: ({ title, eyebrow, categories, media }) => ({
      title: title || "Case study",
      subtitle: [eyebrow || "Case study", (categories ?? []).join(", ")]
        .filter(Boolean)
        .join(" · "),
      media,
    }),
  },
});
