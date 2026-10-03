import { VscInspect } from "react-icons/vsc";
import { defineField, defineType } from "sanity";

import resolveSlug from "@/sanity/pagepro/lib/resolveSlug";

export default defineType({
  name: "headerCta",
  title: "Header call-to-action",
  icon: VscInspect,
  type: "object",
  fields: [
    defineField({
      name: "link",
      type: "link",
    }),
    defineField({
      name: "variant",
      type: "string",
      description:
        "Primary = Pagepro red gradient button. Ghost = borderless text pill (e.g. Login).",
      options: {
        list: [
          { value: "primary", title: "Primary (red gradient)" },
          { value: "ghost", title: "Ghost (borderless)" },
        ],
        layout: "radio",
      },
      initialValue: "ghost",
    }),
  ],
  preview: {
    select: {
      label: "link.label",
      _type: "link.internal._type",
      type: "link.type",
      pageTitle: "link.internal.title",
      internal: "link.internal.metadata.slug.current",
      params: "link.params",
      external: "link.external",
    },
    prepare: ({ label, pageTitle, ...props }) => ({
      title: label || pageTitle,
      subtitle: resolveSlug(props),
    }),
  },
});
