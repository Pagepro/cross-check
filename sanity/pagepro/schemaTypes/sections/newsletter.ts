import { VscMail } from "react-icons/vsc";
import { defineField, defineType } from "sanity";

import { getBlockText } from "@/sanity/pagepro/lib/utils";

export default defineType({
  name: "newsletter",
  title: "Newsletter",
  icon: VscMail,
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
      name: "content",
      title: "Heading & body",
      description:
        "Two-tone heading (use the heading-2 block style; colour the second clause with the Muted text colour) plus the supporting paragraph below it.",
      type: "simpleRichText",
      group: "content",
    }),
    defineField({
      name: "emailPlaceholder",
      title: "Email placeholder",
      description: "Placeholder shown inside the email input.",
      type: "string",
      initialValue: "your@email.com",
      group: "content",
    }),
    defineField({
      name: "submitLabel",
      title: "Submit button label",
      description: "Label for the inline subscribe button.",
      type: "string",
      initialValue: "Sign up",
      validation: (Rule) => Rule.required().error("The button needs a label."),
      group: "content",
    }),
    // Field order below mirrors render order: the consent checkbox sits
    // under the email input/submit button, and the success message replaces
    // the whole form on a successful subscribe.
    defineField({
      name: "agreement",
      title: "Consent agreement",
      description:
        "Consent text shown next to the required checkbox (may contain a link). Source newsletterForm.agreement",
      type: "simpleRichText",
      group: "content",
    }),
    defineField({
      name: "successMessage",
      title: "Success message",
      description:
        "Shown in place of the form after a successful subscribe. Source newsletterForm.successMessage",
      type: "simpleRichText",
      group: "content",
    }),
    defineField({
      name: "socialProof",
      title: "Social proof",
      description:
        "Small print under the input (use the body-5 block style). Emphasise the count with the Strong decorator, e.g. “Read by 4,200+ leaders.”",
      type: "simpleRichText",
      group: "content",
    }),
    defineField({
      name: "backgroundImage",
      title: "Background texture",
      description:
        "Optional faint texture rendered behind the card at 15% opacity. Aspect ratio is irrelevant — it is cropped to cover. Recommended a seamless light paper texture, 1600×400px (landscape).",
      type: "img",
      group: "content",
    }),
  ],
  preview: {
    select: { content: "content" },
    prepare: ({ content }) => ({
      title: getBlockText(content) || "Newsletter",
      subtitle: "Newsletter",
    }),
  },
});
