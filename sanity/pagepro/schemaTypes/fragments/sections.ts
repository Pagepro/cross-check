import { defineField } from "sanity";

/**
 * Inner sections — every section type EXCEPT `shared-section-ref`.
 * Used by the `shared-section` document so shared sections cannot be nested
 * inside one another (no recursion).
 */
export const INNER_SECTIONS = [
  { type: "hero" },
  { type: "case-study-hero" },
  { type: "feature-block" },
  { type: "feature-grid" },
  { type: "logos-carousel" },
  { type: "media-gallery" },
  { type: "image-comparison" },
  { type: "video" },
  { type: "split-sections" },
  { type: "stats" },
  { type: "cta-banner" },
  { type: "testimonials" },
  { type: "pricing" },
  { type: "faq" },
  { type: "tabs" },
  { type: "timeline" },
  { type: "newsletter" },
  { type: "contact-form" },
  { type: "download-form" },
  { type: "questionnaire-form" },
  { type: "sla-packages" },
  { type: "health-report" },
  { type: "ai-assessment" },
  { type: "case-studies" },
  { type: "card-grid" },
  { type: "career-jobs" },
  { type: "services-grid" },
  { type: "technologies-grid" },
  { type: "offices" },
  { type: "calendly-widget" },
  { type: "clutch-widget" },
  { type: "text-block" },
  { type: "content" },
  { type: "comparison-table" },
  { type: "data-table" },
  { type: "case-studies-listing" },
];

/**
 * Full section union for pages: inner sections, the page-level-only sections,
 * and the shared-section reference. `content-columns` is page-level only (visual
 * parity C-build, ruling C-3): its query branch sits outside the branches that
 * are interpolated a second time inside `shared-section-ref`, so a shared
 * section cannot hold one.
 */
export const SECTIONS = [
  ...INNER_SECTIONS,
  { type: "content-columns" },
  { type: "shared-section-ref" },
];

export default defineField({
  name: "sections",
  description: "Page content",
  type: "array",
  of: [...SECTIONS],
  options: {
    insertMenu: {
      views: [
        {
          name: "grid",
          previewImageUrl: (schemaType: string) => `/admin/thumbnails/${schemaType}.webp`,
        },
        { name: "list" },
      ],
      groups: [
        { name: "hero", of: ["hero"] },
        {
          name: "content",
          of: [
            "case-study-hero",
            "feature-block",
            "feature-grid",
            "logos-carousel",
            "media-gallery",
            "image-comparison",
            "video",
            "split-sections",
            "content-columns",
            "stats",
            "cta-banner",
            "testimonials",
            "pricing",
            "faq",
            "tabs",
            "timeline",
            "newsletter",
            "contact-form",
            "download-form",
            "questionnaire-form",
            "sla-packages",
            "health-report",
            "ai-assessment",
            "case-studies",
            "card-grid",
            "career-jobs",
            "services-grid",
            "technologies-grid",
            "offices",
            "calendly-widget",
            "clutch-widget",
            "text-block",
            "content",
            "comparison-table",
            "data-table",
          ],
        },
        {
          name: "lists",
          of: ["case-studies-listing"],
        },
        {
          name: "shared",
          of: ["shared-section-ref"],
        },
      ],
    },
  },
});
