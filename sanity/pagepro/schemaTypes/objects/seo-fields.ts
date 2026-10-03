import { defineField, defineType } from "sanity";

/**
 * Slug-less SEO overrides (ruling P3D-12).
 *
 * The shared `metadata` object cannot be reused by a document whose URL is not
 * CMS-owned: its `slug` is simultaneously `Rule.required()`, read-only for the
 * listed singleton types, and derived from a `title` such a document does not
 * have (`objects/metadata.tsx:17-28`). This object carries only the three
 * fields that a page with an EXTERNALLY owned URL can still override, so the
 * `READONLY_SLUG_DOCUMENT_TYPES` invariant ("only the fixed-URL singletons")
 * stays untouched.
 *
 * Deliberately no `slug`, no `noIndex` and no `structuredData`. The first has
 * no owner here; the other two have nothing to migrate — `structuredData` is
 * `[]` on all five source job stories and none of them is no-indexed. Whether
 * `noIndex` should be added later is logged as NO-28(b).
 *
 * Written generically so a later document with the same shape can reuse it.
 */
export default defineType({
  name: "seoFields",
  title: "SEO",
  type: "object",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      description:
        "Browser tab and social-share title. Leave empty to use the advert's own name.",
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 3,
      description:
        "Search-result and social-share summary. Leave empty to use the opening of the advert's description.",
    }),
    defineField({
      name: "image",
      title: "Social share image",
      type: "img",
      description: "Social-share image, 1200×630px. Leave empty to use the site default.",
    }),
  ],
});
