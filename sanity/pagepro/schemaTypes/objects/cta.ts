import { VscInspect } from "react-icons/vsc";
import { defineField, defineType } from "sanity";

import resolveSlug from "@/sanity/pagepro/lib/resolveSlug";

export default defineType({
  name: "cta",
  title: "Call-to-action",
  icon: VscInspect,
  type: "object",
  groups: [
    {
      name: "content",
      title: "Content",
      default: true,
    },
    {
      name: "style",
      title: "Style",
    },
  ],
  fields: [
    defineField({
      name: "link",
      type: "link",
      group: "content",
    }),
    defineField({
      name: "variant",
      type: "string",
      options: {
        // Must stay in sync with BUTTON_VARIANTS (web/src/ui/components/button/
        // types.ts). The first four are the ported Pagepro variants; the rest
        // are the retained starter set.
        list: [
          { value: "primary", title: "Primary" },
          { value: "secondary", title: "Secondary" },
          { value: "primary-outline", title: "Primary outline" },
          { value: "secondary-outline", title: "Secondary outline" },
          { value: "ghost", title: "Ghost" },
          { value: "link", title: "Link" },
          { value: "arrow-link", title: "Arrow link" },
          { value: "light", title: "Light" },
          { value: "light-outline", title: "Light outline" },
          { value: "plain", title: "Plain" },
          { value: "primary-simple", title: "Primary simple" },
          { value: "tertiary", title: "Tertiary" },
        ],
      },
      initialValue: "primary",
      group: "style",
    }),
    /* VP-1 — the source button's `size` (published snapshot: `medium` ×40,
       `wide` ×6 — the home hero and five on `nextjs-hosting-cost-optimization`).
       `wide` sets the source's minimum width
       (`packages/ui/src/components/atoms/Button/consts.ts:63-70`); left empty,
       the component's own size applies. */
    defineField({
      name: "size",
      type: "string",
      description:
        "Applies to hero and text-block buttons with a Pagepro (gradient) variant; other sections use their own button size.",
      options: {
        list: [
          { value: "md", title: "Medium" },
          { value: "wide", title: "Wide" },
        ],
        layout: "radio",
      },
      group: "style",
    }),
    defineField({
      name: "buttonIcon",
      type: "buttonIcon",
      group: "style",
    }),
  ],
  preview: {
    select: {
      label: "link.label",
      type: "link.type",
      pageTitle: "link.internal.title",
      internal: "link.internal.metadata.slug.current",
      params: "link.params",
      external: "link.external",
      fileLabel: "link.file.asset.label",
      fileOriginalFilename: "link.file.asset.originalFilename",
      variant: "variant",
    },
    prepare: ({ label, pageTitle, ...props }) => ({
      title: `${label || pageTitle} - ${props.variant}`,
      subtitle: resolveSlug({ ...props }),
    }),
  },
});
