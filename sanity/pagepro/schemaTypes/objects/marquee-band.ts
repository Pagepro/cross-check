import { TransferIcon } from "@sanity/icons/Transfer";
import { defineField, defineType } from "sanity";

/**
 * Decorative repeating text band (Storyblok `marqueeBackground`, 72 instances).
 *
 * Reusable on purpose (ruling P3A-20): the source uses it as a page-background
 * stripe next to the contact form, and phase 3 attaches the same object to
 * several sections (`logos-carousel.marquee` today, `testimonials` and the
 * contact-form section next). It is never a section of its own — it always
 * belongs to the section it sits behind.
 *
 * The two toggles are real booleans rather than the house `string` + `options.list`
 * pattern: both are binary source fields (`withBackgroundAnimation`,
 * `isActiveOnMobile`) with no third state to name (ruling P3A-20).
 */
export default defineType({
  name: "marquee-band",
  title: "Marquee band",
  icon: TransferIcon,
  type: "object",
  fields: [
    defineField({
      name: "text",
      title: "Text",
      description:
        "The word or short phrase repeated across the band (e.g. “THE FORM”). Keep it to a couple of words — it is set very large.",
      type: "string",
      validation: (Rule) =>
        Rule.required().error("The band has nothing to repeat without text."),
    }),
    defineField({
      name: "rows",
      title: "Rows",
      description: "How many stacked rows of the text to draw (1–3).",
      type: "number",
      initialValue: 3,
      validation: (Rule) => Rule.min(1).max(3).integer(),
    }),
    defineField({
      name: "animated",
      title: "Scroll the text",
      description:
        "Slowly slides each row sideways. Off in every source instance — turn it on only for a band that should read as motion.",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "showOnMobile",
      title: "Show on mobile",
      description:
        "Off by default: the band is desktop-only decoration and crowds small screens.",
      type: "boolean",
      initialValue: false,
    }),
  ],
  preview: {
    select: { text: "text", rows: "rows", animated: "animated" },
    prepare: ({ text, rows, animated }) => ({
      title: text || "Marquee band",
      subtitle: [`${rows ?? 3} row${rows === 1 ? "" : "s"}`, animated && "animated"]
        .filter(Boolean)
        .join(" · "),
    }),
  },
});
