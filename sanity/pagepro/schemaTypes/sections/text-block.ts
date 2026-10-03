import { TfiText } from "react-icons/tfi";
import { defineField, defineType } from "sanity";

import { count } from "@/sanity/pagepro/stubs/utils";
import { getBlockText } from "@/sanity/pagepro/lib/utils";

export default defineType({
  name: "text-block",
  title: "Text block",
  icon: TfiText,
  type: "object",
  groups: [{ name: "content", default: true }, { name: "options" }],
  fields: [
    defineField({
      name: "options",
      title: "Section options",
      type: "section-options",
      group: "options",
    }),
    /* TB-H1 — the source `SectionHeading` subtitle, an uppercase label above the
       title (`molecules/SectionHeading/index.tsx:10-12`). */
    defineField({
      name: "pretitle",
      title: "Tagline",
      description: "Short uppercase label above the heading, e.g. “Challenge”.",
      type: "string",
      group: "content",
    }),
    defineField({
      name: "content",
      type: "simpleRichText",
      group: "content",
    }),
    /* TB-A2 — the source `SectionHeading` description, a separate rich text
       0.625rem below the title (2.25rem from 64rem) — never the 1.5rem block
       rhythm of one rich text (`molecules/SectionHeading/index.tsx:20-22`). */
    defineField({
      name: "description",
      type: "simpleRichText",
      group: "content",
    }),
    defineField({
      name: "ctas",
      title: "Call-to-actions",
      type: "array",
      of: [{ type: "cta" }],
      group: "content",
    }),
    /* VP-R6 — the source centred a heading block always
       (`molecules/SectionHeading/styles.ts:5-8`) and a grid's CTA run when the
       grid said so (`storyblok/Grid/index.tsx:33-37,63`). */
    defineField({
      name: "textAlign",
      title: "Text alignment",
      type: "string",
      options: {
        layout: "radio",
        list: [
          { title: "Left", value: "start" },
          { title: "Centre", value: "center" },
          { title: "Right", value: "end" },
        ],
      },
      initialValue: "start",
      group: "options",
    }),
    /* Contact route contract C1 — the legacy band's title was the page's `<h1>`
       (a level-1 heading in its `section_heading`). Only the page's leading
       section honours it, so a page can never get two `<h1>`s from this field. */
    defineField({
      name: "titleAs",
      title: "Title element",
      description:
        "Set “Page heading (h1)” when this is the page’s first section and its heading is the page title.",
      type: "string",
      options: {
        layout: "radio",
        list: [{ title: "Page heading (h1)", value: "h1" }],
      },
      group: "options",
    }),
  ],
  preview: {
    select: {
      content: "content",
    },
    prepare: ({ content }) => ({
      title: getBlockText(content) || count(content, "block"),
      subtitle: "Text block",
    }),
  },
  initialValue: {
    content: [
      {
        _key: "block_1",
        _type: "block",
        style: "normal",
        children: [
          {
            _key: "block_1_span_1",
            _type: "span",
            text: "Your text content goes here.",
          },
        ],
      },
    ],
    ctas: [
      {
        _key: "cta_1",
        _type: "cta",
        link: {
          label: "Learn More",
          _type: "link",
          type: "external",
          external: "https://www.google.com",
        },
        variant: "primary",
      },
    ],
  },
});
