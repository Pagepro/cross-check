import { VscLayoutPanelOff } from "react-icons/vsc";
import { defineArrayMember, defineField, defineType } from "sanity";

export default defineType({
  name: "footer",
  title: "Footer settings",
  type: "document",
  icon: VscLayoutPanelOff,
  groups: [
    { name: "hero", title: "Heading & CTA", default: true },
    { name: "navigation" },
    { name: "partnerships" },
    { name: "branding" },
    { name: "subscribe", title: "Subscribe band" },
  ],
  fields: [
    defineField({
      name: "heading",
      title: "Footer heading",
      type: "simpleRichText",
      description:
        "Provisional. Source alignment/underline settings beyond rich text marks: deferred to phase-2 config table.",
      group: "hero",
    }),
    defineField({
      name: "cta",
      title: "Footer CTA",
      type: "cta",
      group: "hero",
    }),
    defineField({
      name: "partnershipsTitle",
      title: "Partnerships title",
      type: "string",
      group: "partnerships",
    }),
    defineField({
      name: "partnershipLogos",
      title: "Partnership logos",
      type: "array",
      group: "partnerships",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({ name: "img", title: "Logo", type: "img" }),
            defineField({ name: "caption", title: "Caption", type: "string" }),
          ],
        }),
      ],
    }),
    defineField({
      name: "menuGroups",
      title: "Menu groups",
      type: "array",
      group: "navigation",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({
              name: "title",
              type: "string",
              validation: (Rule) => Rule.required(),
            }),
            defineField({ name: "links", type: "array", of: [{ type: "link" }] }),
            /* VP-1 — free copy under the links: the source's office addresses
               column (`config.footer_menu_column[4]`, a `rich_text` blok). */
            defineField({
              name: "text",
              type: "simpleRichText",
              description:
                "Free text under the column's links (e.g. office addresses). Every block renders as a plain paragraph in the footer's small text — the block style you pick is ignored; line breaks are kept.",
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: "socialLinks",
      title: "Social links",
      type: "array",
      group: "navigation",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({
              name: "platform",
              type: "string",
              options: {
                list: [
                  "linkedin",
                  "x",
                  "github",
                  "dribbble",
                  "youtube",
                  "facebook",
                  "instagram",
                ],
              },
            }),
            defineField({
              name: "url",
              type: "url",
              validation: (Rule) => Rule.required(),
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: "legalLinks",
      title: "Legal links",
      type: "array",
      group: "navigation",
      of: [{ type: "link" }],
    }),
    defineField({
      name: "copyrightText",
      title: "Copyright",
      type: "string",
      group: "navigation",
    }),
    defineField({
      name: "subscribeHeading",
      title: "Subscribe heading",
      type: "simpleRichText",
      description:
        "Headline for the top call-to-action band (use the heading-2 block style). Short copy, no lists. superseded in phase 1; phase-2 audit decides retirement.",
      hidden: true,
      group: "subscribe",
    }),
    defineField({
      name: "subscribeCtas",
      title: "Subscribe call-to-actions",
      type: "array",
      description:
        'Buttons shown beside the heading (e.g. "Book free demo" as ghost, "Start free trial" as primary). superseded in phase 1; phase-2 audit decides retirement.',
      of: [{ type: "cta" }],
      validation: (Rule) => Rule.max(2),
      hidden: true,
      group: "subscribe",
    }),
    defineField({
      name: "subscribeExcludePaths",
      title: "Hide subscribe band on these paths",
      type: "array",
      description:
        'URL paths where the subscribe band is hidden. A trailing slash "/" excludes the parent path. (Mirrors Global section exclude paths.) Coming soon — runtime hiding is not wired up yet, so the band currently renders on every page. superseded in phase 1; phase-2 audit decides retirement.',
      of: [
        defineArrayMember({
          type: "string",
          placeholder: "e.g. pricing/, contact/",
          validation: (Rule) => Rule.required(),
        }),
      ],
      hidden: true,
      group: "subscribe",
    }),
    defineField({
      name: "social",
      type: "array",
      description:
        "Social links displayed in the footer (icons will be matched based on urls). superseded in phase 1; phase-2 audit decides retirement.",
      of: [{ type: "link" }],
      hidden: true,
      group: "navigation",
    }),
    defineField({
      name: "navigation",
      type: "array",
      description:
        "Menu displayed in the footer in columns. superseded in phase 1; phase-2 audit decides retirement.",
      of: [
        defineField({
          name: "menu",
          type: "object",
          fields: [
            defineField({
              name: "title",
              title: "Column title",
              type: "string",
              description: "Heading displayed above the links in this column",
            }),
            defineField({
              name: "links",
              title: "Menu items",
              type: "array",
              description:
                "Links displayed in the menu in a single column (it's a good practice to have no more then 5 links in a column)",
              of: [{ type: "link" }],
            }),
          ],
          preview: {
            select: {
              title: "title",
              links: "links",
            },
            prepare: ({ title, links }) => ({
              title:
                title ||
                (links?.length > 0 ? `Menu: ${links.length} elements` : "No menu items"),
              subtitle: `${links?.map((link: { label?: string }) => link.label).join(", ")}`,
            }),
          },
        }),
      ],

      hidden: true,
      group: "navigation",
    }),
    defineField({
      name: "clutchRating",
      title: "Clutch rating",
      type: "object",
      description:
        "Clutch score badge. Owned by the footer and reused by the header — set it once here.",
      group: "branding",
      fields: [
        defineField({ name: "score", type: "number" }),
        defineField({ name: "reviewsCount", type: "number" }),
        defineField({ name: "url", type: "url" }),
      ],
    }),
    defineField({
      name: "wordmark",
      title: "Footer wordmark",
      type: "img",
      description:
        "Large decorative logo lockup shown faint across the bottom of the footer. Wide transparent PNG/SVG. Aspect ratio ~4:1, recommended 1232×300px (landscape). Optional. superseded in phase 1; phase-2 audit decides retirement.",
      hidden: true,
      group: "branding",
    }),
  ],
  preview: {
    prepare: () => ({
      title: "Footer settings",
    }),
  },
});
