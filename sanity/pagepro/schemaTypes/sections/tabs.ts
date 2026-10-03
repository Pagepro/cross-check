import { VscCollapseAll, VscListSelection } from "react-icons/vsc";
import { defineArrayMember, defineField, defineType } from "sanity";

import { count } from "@/sanity/pagepro/stubs/utils";
import { getBlockText } from "@/sanity/pagepro/lib/utils";
import { listBlock } from "@/sanity/pagepro/schemaTypes/objects/richText/list-block";

/**
 * Tabs (ruling R-3B-9) — the section behind the Storyblok `tabs` blok (37
 * occurrences, 3–15 `tab` items each).
 *
 * The name is the source's; the behaviour is a list of INDEPENDENT disclosures,
 * never a tabstrip. Each source `tab` carried its own `useToggle()`
 * (`molecules/Tabs/partials/Tab/index.tsx:12`), so any number of panels could be
 * open at once — the frontend keeps exactly that with native
 * `<details>`/`<summary>` elements.
 *
 * A tab body is a `listBlock()` array rather than `simpleRichText`: the source
 * fed each panel a whole rich-text blok (`storyblok/TabsStoryblok/index.tsx:17`,
 * `content[0]?.text`), and those bloks contain lists — which `simpleRichText`
 * declares away (`lists: []`). `listBlock()` is paragraphs and lists and nothing
 * else, so the light `SIMPLE_RICHTEXT_QUERY` projection stays provably complete
 * for it (ruling P3A-57).
 */
export default defineType({
  name: "tabs",
  title: "Tabs",
  icon: VscCollapseAll,
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
      name: "pretitle",
      title: "Tagline",
      description: "Short uppercase label above the heading, e.g. “How it works”.",
      type: "string",
      group: "content",
    }),
    defineField({
      name: "content",
      title: "Content",
      description:
        "Optional heading and supporting copy above the list. Leave empty for a bare list of panels.",
      type: "simpleRichText",
      group: "content",
    }),
    defineField({
      name: "items",
      title: "Panels",
      description:
        "Each panel is an independent disclosure — a visitor can open several at once.",
      type: "array",
      group: "content",
      of: [
        defineArrayMember({
          type: "object",
          name: "tabItem",
          title: "Panel",
          icon: VscListSelection,
          fields: [
            defineField({
              name: "title",
              title: "Title",
              description: "The always-visible row a visitor clicks to open the panel.",
              type: "string",
              validation: (Rule) => Rule.required().error("Each tab needs a title."),
            }),
            defineField({
              name: "body",
              title: "Body",
              description:
                "Shown when the panel is open. Paragraphs and bullet/numbered lists.",
              type: "array",
              of: [listBlock()],
              validation: (Rule) =>
                Rule.required().min(1).error("A panel with no body opens onto nothing."),
            }),
          ],
          preview: {
            select: { title: "title", body: "body" },
            prepare: ({ title, body }) => ({
              title: title || "Panel",
              subtitle: getBlockText(body),
            }),
          },
        }),
      ],
      validation: (Rule) =>
        Rule.required()
          .min(1)
          .error("Add at least one panel — an empty list renders nothing."),
    }),
    defineField({
      name: "initiallyOpen",
      title: "Initially open",
      description:
        "The source opens nothing by default (`partials/Tab/index.tsx:12` `useToggle()`); `first` is offered because a fully collapsed section reads as empty.",
      type: "string",
      initialValue: "first",
      options: {
        layout: "radio",
        list: [
          { title: "All collapsed", value: "none" },
          { title: "First panel open", value: "first" },
        ],
      },
      group: "options",
    }),
  ],
  initialValue: { initiallyOpen: "first" },
  preview: {
    select: { content: "content", items: "items" },
    prepare: ({ content, items }) => ({
      title: getBlockText(content) || "Tabs",
      subtitle: items?.length ? count(items, "panel") : "Tabs",
    }),
  },
});
