import { VscCalendar } from "react-icons/vsc";
import { defineField, defineType } from "sanity";

/**
 * The booking column beside the horizontal contact form (source
 * `horizontalContactForm.calendly*`, 73 published instances).
 *
 * A LINK card, not an embed (ruling R-3C-4): the source renders a plain
 * `ButtonLink` to calendly.com — no iframe, no script — so nothing here needs a
 * consent gate. Use the `calendly-widget` section when an actual scheduler
 * should be mounted on the page.
 */
export default defineType({
  name: "calendlyCard",
  title: "Booking card",
  icon: VscCalendar,
  type: "object",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      description:
        "Heading of the booking column (e.g. “Book a Meeting With Our CEO”). Rendered as a sub-heading beneath the page's own headline.",
      type: "string",
      initialValue: "Book a Meeting With Our CEO",
    }),
    defineField({
      name: "description",
      title: "Description",
      description: "Short paragraph under the title, above the portrait.",
      type: "simpleRichText",
    }),
    defineField({
      name: "image",
      title: "Portrait",
      description:
        "Square portrait — rendered as a 130 px circle (`HorizontalContactForm/styles.ts:25-31`). Aspect ratio 1:1, recommended 520×520px (square).",
      type: "img",
    }),
    defineField({
      name: "expert",
      title: "Expert",
      description:
        "Name, role and contact line. Rich text because the source copy links the e-mail address (`mailto:`).",
      type: "simpleRichText",
    }),
    defineField({
      name: "buttonLabel",
      title: "Button label",
      description:
        "Text on the booking button. Empty on all 73 source instances, which fall back to this same wording in code (R-3C-4).",
      type: "string",
      initialValue: "Book a meeting",
    }),
    defineField({
      name: "link",
      title: "Booking link",
      description:
        "Where the button goes — normally the Calendly scheduling page or an internal “meet …” page.",
      type: "link",
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: { title: "title", buttonLabel: "buttonLabel", media: "image.image" },
    prepare: ({ title, buttonLabel, media }) => ({
      title: title || "Booking card",
      subtitle: buttonLabel || "Book a meeting",
      media,
    }),
  },
});
