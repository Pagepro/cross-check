import {
  VscHome,
  VscQuestion,
  VscEyeClosed,
  VscSearch,
  VscMortarBoard,
} from "react-icons/vsc";
import { defineField, defineType } from "sanity";

import {
  isReservedBlogSlug,
  RESERVED_BLOG_SLUG_MESSAGE,
} from "@/sanity/pagepro/lib/reservedSlug";
import {
  CAREER_JOBS_WITH_HERO_MESSAGE,
  CASE_STUDY_HERO_ON_PAGE_MESSAGE,
  hasCareerJobsWithHero,
  hasCaseStudyHeroSection,
} from "@/sanity/pagepro/lib/sectionPlacement";

import sections from "../fragments/sections";

export default defineType({
  name: "page",
  title: "Page",
  type: "document",
  groups: [{ name: "content", default: true }, { name: "metadata" }],
  fields: [
    defineField({
      name: "title",
      type: "string",
      group: "content",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "pageType",
      title: "Page type",
      type: "string",
      description:
        "Source `page.type`. Marks the page's role for analytics and future type-specific behaviour; it does not change the layout on its own.",
      group: "content",
      options: {
        layout: "radio",
        list: [
          { title: "Default", value: "default" },
          { title: "Career", value: "career" },
          { title: "Contact", value: "contact" },
        ],
      },
      initialValue: "default",
    }),
    defineField({
      ...sections,
      group: "content",
      // Two <h1> guards, same shape. `case-study-hero` renders an <h1> and
      // belongs to the `case-study` route only; the shared `sections` fragment
      // would otherwise offer it here too, letting a page that already has a
      // `hero` ship two <h1>s. `career-jobs` renders the career page's own <h1>
      // (P3D-14), so it cannot sit beside a `hero` either. Both predicates are
      // shared with their unit tests (`@/sanity/pagepro/lib/sectionPlacement`).
      validation: (Rule) =>
        Rule.custom((value) => {
          if (hasCaseStudyHeroSection(value)) return CASE_STUDY_HERO_ON_PAGE_MESSAGE;
          if (hasCareerJobsWithHero(value)) return CAREER_JOBS_WITH_HERO_MESSAGE;

          return true;
        }),
    }),
    defineField({
      name: "submenu",
      title: "Page submenu",
      type: "array",
      description:
        "Desktop-only anchor strip under the header. Each `anchor` must match a section's “Anchor ID” (`section-options.uid`) on this page.",
      group: "content",
      of: [
        {
          type: "object",
          name: "pageSubmenuItem",
          fields: [
            defineField({
              name: "label",
              type: "string",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "anchor",
              title: "Anchor ID",
              type: "string",
              description: "The target section's Anchor ID — without the leading `#`.",
              validation: (Rule) => Rule.required(),
            }),
          ],
          preview: {
            select: { title: "label", subtitle: "anchor" },
            prepare: ({ title, subtitle }) => ({
              title,
              subtitle: subtitle && `#${subtitle}`,
            }),
          },
        },
      ],
    }),
    defineField({
      name: "isHeaderTransparent",
      title: "Transparent header",
      type: "boolean",
      description: "Header overlays the first section; use with a dark hero",
      group: "content",
      initialValue: false,
    }),
    defineField({
      name: "stickyButtonHidden",
      title: "Hide the sticky CTA",
      type: "boolean",
      description:
        "Hides the site-wide sticky CTA (Site settings → Behaviors) on this page.",
      group: "content",
      initialValue: false,
    }),
    defineField({
      name: "hideAiChatWidget",
      title: "Hide the AI chat widget",
      type: "boolean",
      description: "Hide the site-wide AI chat bubble on this page.",
      group: "content",
      initialValue: false,
    }),
    defineField({
      name: "metadata",
      type: "metadata",
      group: "metadata",
      // Reserved-prefix guard. Lives on `page` (not on the shared `metadata`
      // object, which post-less document types also use) because only `page`
      // slugs are full URL paths that could collide with the external
      // `/blog/*` origin. The GROQ queries enforce the same rule at read time
      // for documents written straight through the API.
      validation: (Rule) =>
        Rule.custom((value: { slug?: { current?: string } } | undefined) =>
          isReservedBlogSlug(value?.slug?.current) ? RESERVED_BLOG_SLUG_MESSAGE : true,
        ),
    }),
  ],
  preview: {
    select: {
      title: "title",
      slug: "metadata.slug.current",
      media: "metadata.image",
      noindex: "metadata.noIndex",
    },
    prepare: ({ title, slug, media, noindex }) => ({
      title,
      subtitle: slug && (slug === "/" ? "/" : `/${slug}`),
      media:
        media ||
        (slug === "/" && VscHome) ||
        (slug === "404" && VscQuestion) ||
        (slug === "search" && VscSearch) ||
        (slug.startsWith("docs") && VscMortarBoard) ||
        (noindex && VscEyeClosed),
    }),
  },
});
