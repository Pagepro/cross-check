import { VscTextSize } from "react-icons/vsc";
import { defineField, defineType } from "sanity";

import { count } from "@/sanity/pagepro/stubs/utils";
import { getBlockText } from "@/sanity/pagepro/lib/utils";

export default defineType({
  name: "content",
  title: "Content section",
  icon: VscTextSize,
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
      type: "richText",
      group: "content",
    }),
    /* Ruling P3A-37: the source authored alignment per breakpoint
       (mobile/tablet/desktop). Tablet folds into desktop — in the published
       content the three values are identical on every blok that sets them — so
       the section keeps one desktop value plus an optional mobile override. */
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
    /* AB-A4 — the source's own tablet step (48rem–64rem, `atoms/RichText/styles.tsx:27-45`):
       an empty tablet value inherits the MOBILE rule, not the desktop one. */
    defineField({
      name: "textAlignTablet",
      title: "Text alignment (tablet)",
      description: "Optional — overrides the desktop alignment from 768px to 1023px.",
      type: "string",
      options: {
        layout: "radio",
        list: [
          { title: "Left", value: "start" },
          { title: "Centre", value: "center" },
          { title: "Right", value: "end" },
        ],
      },
      group: "options",
    }),
    defineField({
      name: "textAlignMobile",
      title: "Text alignment (mobile)",
      description: "Optional — overrides the alignment above below 768px.",
      type: "string",
      options: {
        layout: "radio",
        list: [
          { title: "Left", value: "start" },
          { title: "Centre", value: "center" },
          { title: "Right", value: "end" },
        ],
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
      subtitle: "Content section (Rich Text)",
    }),
  },
  initialValue: {
    content: [],
    textAlign: "start",
  },
});
