import { defineField, defineType } from "sanity";

import CharacterCount from "@/sanity/pagepro/ui/CharacterCount";
import PreviewOG from "@/sanity/pagepro/ui/PreviewOG";

export default defineType({
  name: "site",
  title: "Site settings",
  type: "document",
  groups: [
    { name: "branding", default: true },
    { name: "seo", title: "SEO/AEO" },
    { name: "aeo", title: "AEO" },
    { name: "forms", title: "Forms" },
    { name: "behaviors", title: "Behaviors" },
  ],
  fields: [
    defineField({
      name: "title",
      type: "string",
      validation: (Rule) => Rule.required(),
      group: "branding",
    }),
    defineField({
      name: "logo",
      description:
        "Displayed in the header. Use a transparent SVG or PNG. Recommended height ~40px; width scales with the logo's aspect ratio.",
      type: "img",
      group: "branding",
    }),
    defineField({
      name: "seo",
      title: "Default metadata",
      description: "Metadata used for all pages (can be overridden on a per-page basis)",
      type: "object",
      group: "seo",
      fields: [
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
          type: "image",
          options: {
            hotspot: true,
            metadata: ["lqip"],
          },
        }),
      ],
    }),
    defineField({
      name: "llmsTxt",
      title: "llms.txt content",
      type: "text",
      rows: 20,
      group: "aeo",
      description: "Provisional until phase-2 config audit.",
    }),
    defineField({
      name: "mcpServerCardDesc",
      title: "MCP server card description",
      type: "string",
      group: "aeo",
    }),
    defineField({
      name: "getCompanyInfoToolTagline",
      title: "get_company_info tagline",
      type: "string",
      group: "aeo",
    }),
    defineField({
      name: "getCompanyInfoToolDesc",
      title: "get_company_info description",
      type: "string",
      group: "aeo",
    }),
    defineField({
      name: "getServicesToolDesc",
      title: "get_services description",
      type: "string",
      group: "aeo",
    }),
    defineField({
      name: "getCaseStudiesToolDesc",
      title: "get_case_studies description",
      type: "string",
      group: "aeo",
    }),
    defineField({
      name: "contactFormReturnSubject",
      title: "Contact confirmation subject",
      type: "string",
      group: "forms",
    }),
    defineField({
      name: "contactFormReturnMessage",
      title: "Contact confirmation message",
      type: "simpleRichText",
      group: "forms",
    }),
    defineField({
      name: "exitIntentEnabled",
      title: "Exit-intent modal",
      type: "boolean",
      initialValue: false,
      group: "behaviors",
    }),
    defineField({
      name: "exitIntentBody",
      title: "Exit-intent content",
      type: "simpleRichText",
      group: "behaviors",
      hidden: ({ document }) => !document?.exitIntentEnabled,
    }),
    defineField({
      name: "stickyCtaLabel",
      title: "Sticky CTA label",
      type: "string",
      group: "behaviors",
    }),
    defineField({
      name: "stickyCtaLink",
      title: "Sticky CTA destination",
      type: "link",
      group: "behaviors",
    }),
    defineField({
      name: "danteAiEnabled",
      title: "Dante AI widget",
      type: "boolean",
      initialValue: false,
      group: "behaviors",
    }),
    defineField({
      name: "danteAiUrl",
      title: "Dante AI embed URL",
      type: "url",
      description:
        "Dante embed URL assigned to `window.danteEmbed` (source `molecules/DanteAiWidget/index.tsx:29`). Owner input — the value is in no Storyblok field (NO-11).",
      group: "behaviors",
      hidden: ({ document }) => !document?.danteAiEnabled,
    }),
  ],
  preview: {
    prepare: () => ({
      title: "Site settings",
    }),
  },
});
