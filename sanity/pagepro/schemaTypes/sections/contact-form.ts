import { EnvelopeIcon } from "@sanity/icons/Envelope";
import { defineField, defineType } from "sanity";

/**
 * Contact form section (phase 3C Task 2).
 *
 * Source: `horizontalContactForm` (73 published instances) — the two-column
 * module with the form on the left and a booking card on the right. The form
 * copy itself lives in the reusable `contactFormFields` object, which the
 * landing hero embeds too (`hero.form`, ruling R-3C-3), so the two can never
 * drift apart.
 */
export default defineType({
  name: "contact-form",
  title: "Contact form",
  icon: EnvelopeIcon,
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
        "Horizontal = the form beside a booking card, two columns from 1024px. Stacked = the form on its own. `stacked` has 0 migrated instances — all 37 source stacked forms live inside a landing hero and become `hero.form`; the transformer only ever emits `horizontal` here (R-3C-1).",
      type: "string",
      group: "options",
      options: {
        layout: "radio",
        list: [
          { title: "Stacked — form only", value: "stacked" },
          { title: "Horizontal — form + booking card", value: "horizontal" },
        ],
      },
      initialValue: "horizontal",
    }),
    defineField({
      name: "form",
      title: "Form",
      description: "The form's heading, intro copy, consent statement and submit button.",
      type: "contactFormFields",
      group: "content",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "calendly",
      title: "Booking card",
      description:
        "The dark column beside the form — a portrait, a short pitch and a button to the booking page.",
      type: "calendlyCard",
      group: "content",
      hidden: ({ parent }) => parent?.variant !== "horizontal",
    }),
    defineField({
      name: "marquee",
      title: "Marquee band",
      description:
        "Decorative repeating text band behind the form (source `marqueeBackground`, beside 72 of the 73 horizontal forms — ruling P3A-20).",
      type: "marquee-band",
      group: "content",
    }),
  ],
  preview: {
    select: { title: "form.title", variant: "variant", media: "calendly.image.image" },
    prepare: ({ title, variant, media }) => ({
      title: title || "Contact form",
      subtitle: variant === "stacked" ? "Contact form — stacked" : "Contact form",
      media,
    }),
  },
  initialValue: { variant: "horizontal" },
});
