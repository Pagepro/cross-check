import { defineField, defineType } from "sanity";

import CharacterCount from "@/sanity/pagepro/ui/CharacterCount";
import PreviewOG from "@/sanity/pagepro/ui/PreviewOG";

// Listing-page singletons have a fixed URL, so their metadata slug is read-only.
// case-study routes via metadata.slug.current, so its slug must stay editable
// (auto-derives from metadata.title via the slug field's source).
const READONLY_SLUG_DOCUMENT_TYPES = ["case-studies-listing-page"];

export default defineType({
  name: "metadata",
  title: "Metadata",
  description: "For search engines",
  type: "object",
  fields: [
    defineField({
      name: "slug",
      type: "slug",
      description:
        "URL slug. Case studies are automatically prefixed — the final URL is /case-studies/{slug} (enter just the slug, e.g. “my-project”). For pages this is the full path (e.g. /about).",
      readOnly: ({ document }) =>
        READONLY_SLUG_DOCUMENT_TYPES.includes(document?._type ?? ""),
      options: {
        source: (doc: any) => doc.title || doc.metadata.title,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "title",
      type: "string",
      validation: (Rule) => Rule.max(60).warning(),
      components: {
        input: (props) => (
          <CharacterCount max={60} {...props}>
            <PreviewOG title={props.elementProps.value} />
          </CharacterCount>
        ),
      },
    }),
    /* GPNotebook GP-SEO1 (NO-42(k)) — a case study's `title` is the short client
       name the listing card and H1 fallback read, while the source emitted a
       separate, longer `metaTitle` as its `<title>` and `og:title`
       (`storyblok/pages/CaseStudyPage/index.tsx:17` → `utils/Seo/index.tsx:26`).
       Only case studies carry the two; every other document's `title` already
       IS its SEO title, so the field is hidden there. */
    defineField({
      name: "seoTitle",
      title: "SEO title",
      description:
        "The browser-tab and social title. Leave empty to use the title above.",
      type: "string",
      hidden: ({ document }) => document?._type !== "case-study",
      validation: (Rule) => Rule.max(90).warning(),
    }),
    defineField({
      name: "description",
      type: "text",
      validation: (Rule) => Rule.max(160).warning(),
      components: {
        input: (props) => <CharacterCount as="textarea" max={160} {...props} />,
      },
    }),
    defineField({
      name: "image",
      description:
        "Used for social sharing previews (Open Graph). Aspect ratio 1.91:1, recommended 1200×630px (landscape).",
      type: "img",
      options: {
        hotspot: true,
        metadata: ["lqip"],
      },
    }),
    defineField({
      name: "structuredData",
      title: "Structured data (JSON-LD)",
      description:
        'JSON-LD passthrough; must be a single valid JSON object or array. Rendered verbatim in a <script type="application/ld+json"> tag. Invalid JSON is skipped silently at render time.',
      type: "text",
      rows: 8,
      /* WARNING, not an error: `metadata` is shared by every routed document,
         so a blocking rule would make a legacy doc with malformed JSON-LD
         unpublishable. The renderer already skips anything that doesn't parse
         (`(frontend)/[[...slug]]/page.tsx`), so bad JSON degrades to "no
         JSON-LD" rather than a broken page. */
      validation: (Rule) =>
        Rule.custom((value) => {
          if (typeof value !== "string" || !value.trim()) return true;

          try {
            const parsed = JSON.parse(value);

            return typeof parsed === "object" && parsed !== null
              ? true
              : "Must be a JSON object or array";
          } catch {
            return "Not valid JSON";
          }
        }).warning(),
    }),
    /* NX-8 — the source's per-story `ogType` option
       (`/Users/martin/1_PROJECTS/pagepro-career-portal/apps/site/src/components/utils/Seo/index.tsx:55`
       emits it verbatim when non-empty). The same eleven values the Storyblok
       field offered; empty keeps the site default, `website`. */
    defineField({
      name: "ogType",
      title: "Open Graph type",
      description: "The og:type social platforms read. Leave empty for “website”.",
      type: "string",
      options: {
        list: [
          { title: "Website", value: "website" },
          { title: "Article", value: "article" },
          { title: "Place", value: "place" },
          { title: "Event", value: "event" },
          { title: "Group", value: "group" },
          { title: "Cause", value: "cause" },
          { title: "Company", value: "company" },
          { title: "Blog", value: "blog" },
          { title: "Author", value: "author" },
          { title: "Video", value: "video" },
          { title: "Audio", value: "audio" },
        ],
      },
    }),
    defineField({
      name: "noIndex",
      description: "Prevent search engines from indexing this page",
      type: "boolean",
      initialValue: false,
    }),
    // defineField({
    // 	name: 'canonical',
    // 	description: 'Canonical URL',
    // 	type: 'string',
    // }),
    // defineField({
    // 	name: 'hreflang',
    // 	description: 'Hreflang URL',
    // 	type: 'string',
    // }),
  ],
});
