import { VscCommentDiscussion, VscQuote } from "react-icons/vsc";
import { defineArrayMember, defineField, defineType } from "sanity";

import { count } from "@/sanity/pagepro/stubs/utils";
import { getBlockText } from "@/sanity/pagepro/lib/utils";

/**
 * Testimonials section.
 *
 * Two sources of quotes, rendered through the same card (ruling R-3A-3):
 * `testimonials` picks reusable `testimonial` DOCUMENTS, `items` holds one-off
 * quotes that belong to this section alone. The Storyblok source only ever had
 * the inline form — 139 `testimonial` bloks across 58 sections, 70 unique by
 * author + quotation — so the transformer promotes the repeated ones to
 * documents and leaves the genuine one-offs here.
 *
 * `backgroundText` / `withBackgroundAnimation` / `isAnimationActiveOnMobile`
 * collapse into the reusable `marquee-band` object (ruling P3A-29); `textColor`
 * carries no field of its own — it maps onto `options.colorTheme`
 * (ruling P3A-28).
 */
export default defineType({
  name: "testimonials",
  title: "Testimonials",
  icon: VscCommentDiscussion,
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
      description: "Short uppercase label above the heading, e.g. “Reviews”.",
      type: "string",
      group: "content",
    }),
    defineField({
      name: "content",
      title: "Content",
      description:
        "Section heading and optional supporting copy. Use the heading-2 block style for the heading.",
      type: "simpleRichText",
      group: "content",
    }),
    defineField({
      name: "testimonials",
      title: "Testimonials",
      description:
        "Pick the testimonials to show, in order. Each is a Testimonial document — edits there propagate everywhere it is referenced on the next publish.",
      type: "array",
      group: "content",
      of: [
        defineArrayMember({
          type: "reference",
          to: [{ type: "testimonial" }],
        }),
      ],
    }),
    defineField({
      name: "items",
      title: "One-off quotes",
      description:
        "One-off quotes for this section only. Prefer Testimonial documents for reusable quotes.",
      type: "array",
      group: "content",
      of: [
        defineArrayMember({
          name: "testimonialItem",
          title: "Quote",
          type: "object",
          icon: VscQuote,
          fields: [
            defineField({
              name: "quote",
              title: "Quote",
              description:
                "The testimonial text. Use the body-2 block style; apply the medium decorator to emphasise key phrases.",
              type: "simpleRichText",
              validation: (Rule) => Rule.required().error("A quote needs its text."),
            }),
            defineField({
              name: "authorName",
              title: "Author",
              description: "Full name of the person quoted, e.g. “Sarah Mitchell”.",
              type: "string",
            }),
            defineField({
              name: "authorRole",
              title: "Role",
              description:
                "Job title and company on one line, exactly as it should read, e.g. “Product Owner, Veygo”.",
              type: "string",
            }),
            defineField({
              name: "avatar",
              title: "Avatar",
              description:
                "Square headshot of the author. Aspect ratio 1:1, recommended 160×160px.",
              type: "img",
            }),
          ],
          preview: {
            select: {
              authorName: "authorName",
              authorRole: "authorRole",
              quote: "quote",
              media: "avatar.image",
            },
            prepare: ({ authorName, authorRole, quote, media }) => ({
              title: authorName || getBlockText(quote) || "Quote",
              subtitle: authorRole || "One-off quote",
              media,
            }),
          },
        }),
      ],
    }),
    defineField({
      name: "marquee",
      title: "Marquee band",
      description:
        "Decorative repeating text behind the slider (source backgroundText). Empty text falls back to “testimonials”.",
      type: "marquee-band",
      group: "content",
    }),
  ],
  /* Either list may be empty, but not both — the section renders nothing
     without a quote to show (ruling R-3A-3). Field-level `required()` cannot
     express "one of two", so the rule lives on the section object. */
  validation: (Rule) =>
    Rule.custom((section) => {
      const { testimonials, items } =
        (section as { testimonials?: unknown[]; items?: unknown[] } | undefined) ?? {};

      if (testimonials?.length || items?.length) {
        return true;
      }

      return "Add at least one testimonial (document reference or inline item).";
    }),
  preview: {
    select: { content: "content", testimonials: "testimonials", items: "items" },
    prepare: ({ content, testimonials, items }) => {
      const quotes = [...(testimonials ?? []), ...(items ?? [])];

      return {
        title: getBlockText(content) || "Testimonials",
        subtitle: quotes.length ? count(quotes, "testimonial") : "Testimonials",
      };
    },
  },
});
