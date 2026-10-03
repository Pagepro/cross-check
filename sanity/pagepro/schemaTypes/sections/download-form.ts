import { DownloadIcon } from "@sanity/icons/Download";
import { defineArrayMember, defineField, defineType } from "sanity";

/**
 * Gated-download section (phase 3C Task 3).
 *
 * Source: `downloadForm` (13 published instances). Seven of those are nested
 * inside an `eBook` wrapper; ruling R-3C-6 folds the wrapper and its form into
 * ONE section — the wrapper's `title` becomes this section's `content` heading
 * and its `slides` become the `ebook` variant's carousel — because an e-book
 * teaser without its form, or a form without its teaser, is never authored.
 *
 * What the visitor gets is an e-mail, never a file from this site (R-3C-5): the
 * form posts to `/api/download`, the delivery target sends the asset, and the
 * response carries no URL. `assetKey` is what names the asset in that contract;
 * it replaces the retired SendGrid list id + custom-field id (NO-18/NO-19).
 */
export default defineType({
  name: "download-form",
  title: "Download form",
  icon: DownloadIcon,
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
        "Standard = the cover image beside the form (6 source instances). E-book = a three-slide preview carousel beside the form (7 source instances, the folded `eBook` wrapper — R-3C-6).",
      type: "string",
      group: "options",
      options: {
        layout: "radio",
        list: [
          { title: "Standard — cover image", value: "standard" },
          { title: "E-book — preview carousel", value: "ebook" },
        ],
      },
      initialValue: "standard",
    }),
    defineField({
      name: "content",
      title: "Heading and intro",
      description:
        "The section's own heading and the copy above the form. For an e-book this is where the wrapper's title lives (R-3C-6).",
      type: "simpleRichText",
      group: "content",
    }),
    defineField({
      name: "coverImage",
      title: "Cover image",
      description:
        "The asset's cover, drawn beside the form. Set on 11 of the 13 source instances; the two without one render form-only.",
      type: "img",
      group: "content",
      hidden: ({ parent }) => parent?.variant === "ebook",
    }),
    defineField({
      name: "fileTypeLabel",
      title: "File type badge",
      description:
        'Badge drawn over the cover (`DownloadForm/Partials/Cover/index.tsx:35-39`). Source: "PDF" ×9, "PDF " ×3 (trailing space — the transformer trims), empty ×1',
      type: "string",
      group: "content",
      initialValue: "PDF",
      hidden: ({ parent }) => parent?.variant === "ebook",
    }),
    defineField({
      name: "slides",
      title: "Preview slides",
      description:
        "The e-book preview carousel — exactly 3 in every source e-book. One slide per view; no autoplay.",
      type: "array",
      group: "content",
      of: [defineArrayMember({ type: "img" })],
      validation: (Rule) => Rule.max(3),
      hidden: ({ parent }) => parent?.variant !== "ebook",
    }),
    defineField({
      name: "assetKey",
      title: "Asset key",
      description:
        "Identifies which asset n8n sends (replaces the SendGrid list id + custom-field id — the file is delivered by e-mail, not by this site; R-3C-5, NO-18/NO-19)",
      type: "string",
      group: "content",
      /* `required()` alone accepts `" "`, and the section then renders NOTHING
         (`DownloadForm/index.tsx` guards on the trimmed value) — an invisible
         module with no warning anywhere in the Studio. The custom rule surfaces
         it on the field that can actually be fixed. */
      validation: (Rule) =>
        Rule.required()
          .max(128)
          .custom((value) =>
            typeof value === "string" && value.trim().length === 0
              ? "The asset key cannot be blank — it is what tells the delivery target which file to send."
              : true,
          ),
    }),
    defineField({
      name: "ctaLabel",
      title: "Submit button label",
      description: 'Source: "Download" ×9, "Sign Up" ×3, "Sign Up Now" ×1',
      type: "string",
      group: "content",
      initialValue: "Download",
    }),
    defineField({
      name: "agreement",
      title: "Consent statement",
      description:
        "The copy beside the consent checkbox. Required: the visitor cannot submit without ticking it.",
      type: "simpleRichText",
      group: "content",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "successMessage",
      title: "Success message",
      description:
        "Shown in place of the form after a successful submission. Every source value says “Check your email …” — the asset arrives by e-mail, never from this site (R-3C-5).",
      type: "simpleRichText",
      group: "content",
    }),
  ],
  preview: {
    select: { variant: "variant", assetKey: "assetKey", media: "coverImage.image" },
    prepare: ({ variant, assetKey, media }) => ({
      title: "Download form",
      subtitle: [variant === "ebook" ? "E-book" : "Standard", assetKey]
        .filter(Boolean)
        .join(" — "),
      media,
    }),
  },
  initialValue: { variant: "standard", fileTypeLabel: "PDF", ctaLabel: "Download" },
});
