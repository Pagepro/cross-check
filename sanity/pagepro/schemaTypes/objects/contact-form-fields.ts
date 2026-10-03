import { VscMail } from "react-icons/vsc";
import { defineField, defineType } from "sanity";

/**
 * The contact form's authored copy — the fields an editor controls around the
 * five hard-coded inputs (full name, company e-mail, phone, message, consent).
 *
 * Reused by BOTH places a contact form appears (ruling R-3C-3):
 *  - `contact-form.form` — the standalone section (source
 *    `horizontalContactForm`, 73 published instances);
 *  - `hero.form` — the landing hero's right column (source
 *    `landingPageHero.form`, a nested `contactForm` blok on all 37 landing
 *    heroes).
 *
 * The inputs themselves are NOT fields: all 110 source instances render the
 * same five, with the same labels (`forms/ContactForm/index.tsx:66,82,100,115`),
 * so they stay in code (P3C-2).
 */
export default defineType({
  name: "contactFormFields",
  title: "Contact form",
  icon: VscMail,
  type: "object",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      description:
        "Heading above the form (e.g. “Tell us more about your project”). Rendered as a sub-heading — the page's own headline stays the H1.",
      type: "string",
    }),
    defineField({
      name: "description",
      title: "Description",
      description: "Short intro paragraph between the title and the first field.",
      type: "simpleRichText",
    }),
    defineField({
      name: "agreement",
      title: "Consent statement",
      description:
        "The copy beside the consent checkbox — normally one sentence linking to the Privacy Policy. The visitor cannot submit without ticking it.",
      type: "simpleRichText",
      validation: (Rule) => Rule.required().error("A consent statement is required."),
    }),
    defineField({
      name: "submitLabel",
      title: "Submit button label",
      description: "Text on the submit button.",
      type: "string",
      initialValue: "Send message",
    }),
    defineField({
      name: "successMessage",
      title: "Success message",
      description:
        "Shown in place of the form after a successful submit — unless a redirect is set below. It stays on screen until the visitor navigates away (R-3C-13).",
      type: "string",
      initialValue: "Your message was sent successfully!",
    }),
    defineField({
      name: "redirect",
      title: "Redirect after submit",
      description:
        "Send the visitor here after a successful submit (the Thank-you page on 94 of 110 source forms). Leave empty to show the success message in place.",
      type: "link",
    }),
  ],
  preview: {
    select: { title: "title", submitLabel: "submitLabel" },
    prepare: ({ title, submitLabel }) => ({
      title: title || "Contact form",
      subtitle: submitLabel || "Send message",
    }),
  },
});
