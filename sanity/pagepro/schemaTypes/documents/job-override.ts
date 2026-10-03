import { VscBriefcase } from "react-icons/vsc";
import { defineField, defineType } from "sanity";

import { API_VERSION } from "@/sanity/pagepro/lib/api-version";

/**
 * Per-advert CMS overrides for a Traffit-backed job page (rulings R-3D-5/6,
 * P3D-12).
 *
 * A job page at `/{career page slug}/jobs/{advert slug}` is rendered from
 * Traffit, not from Sanity: the advert's name, salary, location and body all
 * come from the live board. This document exists ONLY so an editor can override
 * the page's SEO. It therefore has:
 *
 * - no `sections` array (R-3D-5) — the page's own sections are the global ones;
 * - no public route of its own — it is never resolvable except through the
 *   advert it is keyed to;
 * - no entry in `resolveUrl` / `LINK_QUERY` / `linkBaseSchema.ts` (P3D-9), so
 *   it is not internally linkable. Logged as NO-28(c).
 *
 * There is deliberately no `presentation.ts` `locations` entry either: every
 * existing entry resolves the URL from the document itself, and this document
 * carries only `jobSlug` — the career prefix lives on a different document, and
 * hard-coding `/career/jobs/{slug}` would reintroduce exactly the editor-owned
 * career slug R-3D-4 refuses. The URL shape is stated in the field description
 * instead; the missing "Open on the Website" tab is a known gap (Task 7).
 */
/** `drafts.<id>` and `versions.<release>.<id>` both address the same document. */
const baseDocumentId = (id: string) =>
  id.replace(/^drafts\./, "").replace(/^versions\.[^.]+\./, "");

export default defineType({
  name: "job-override",
  title: "Job override",
  icon: VscBriefcase,
  type: "document",
  groups: [{ name: "content", title: "Content", default: true }],
  fields: [
    defineField({
      name: "jobSlug",
      title: "Job slug",
      type: "slug",
      group: "content",
      options: { maxLength: 96 },
      description:
        "The advert's URL slug, derived from its Traffit name (slugify(advert.name)) — e.g. freelance-nextjs-developer. It must match the live advert exactly; when it does not, this document simply never renders. There is no “generate” button: the value comes from Traffit, not from a title here. The page it overrides lives at /{career page slug}/jobs/{this slug}.",
      validation: (Rule) =>
        Rule.required()
          .error("A job override needs the advert's slug.")
          .custom(async (value, context) => {
            const slug = value?.current;

            if (!slug) return true;

            /* Compared on BASE ids, not on a `_id in [$id, $draftId]` filter:
               besides `drafts.<id>`, Sanity 5 also stores a document edited
               inside a content release as `versions.<release>.<id>`, and such a
               version would otherwise read as a duplicate of itself. */
            const client = context.getClient({ apiVersion: API_VERSION });
            const ids = await client.fetch<string[]>(
              "*[_type == 'job-override' && jobSlug.current == $slug]._id",
              { slug },
            );
            const self = baseDocumentId(context.document?._id ?? "");
            const others = ids.filter((candidate) => baseDocumentId(candidate) !== self);

            return others.length === 0
              ? true
              : "Another job override already targets this advert slug.";
          }),
    }),
    defineField({
      name: "seo",
      title: "SEO",
      type: "seoFields",
      group: "content",
      description:
        "Overrides for this advert's page title, description and share image. Everything else on the page comes from Traffit.",
    }),
  ],
  preview: {
    select: {
      seoTitle: "seo.title",
      slug: "jobSlug.current",
      media: "seo.image.image",
    },
    prepare: ({ seoTitle, slug, media }) => ({
      title: seoTitle || slug || "Job override",
      subtitle: slug ? `…/jobs/${slug}` : "No advert slug yet",
      media,
    }),
  },
});
