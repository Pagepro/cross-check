import { VscLink } from "react-icons/vsc";
import { defineField, defineType } from "sanity";

import resolveSlug from "@/sanity/pagepro/lib/resolveSlug";

import link from "./link";

export default defineType({
  name: "headerLink",
  title: "Link",
  icon: VscLink,
  type: "object",
  options: {
    columns: 2,
  },
  fields: [
    ...link.fields,
    defineField({
      name: "submenu",
      title: "Submenu",
      type: "array",
      of: [{ type: "link" }],
      description:
        "A simple one-column dropdown of links. For the two-column icon/card panel use `Mega menu` below.",
    }),
    defineField({
      name: "megaMenu",
      title: "Mega menu",
      type: "headerMegaMenu",
      description:
        "A two-column mega panel under this item. The item keeps its own destination; the panel is opened by the chevron beside it. Leave empty for a plain link, or use `Submenu` above for a simple one-column dropdown.",
    }),
    defineField({
      name: "visibleInMainMenu",
      type: "boolean",
      initialValue: true,
      description: "If false, the link will not be visible in the main menu",
    }),
    defineField({
      name: "isHighlighted",
      title: "Highlighted",
      type: "boolean",
      initialValue: false,
      description:
        "Renders this item as a filled button instead of a plain link (source `menu_link.isHighlighted`, true on 1 of 7 — “CONTACT US”).",
    }),
  ],
  preview: {
    select: {
      label: "label",
      type: "type",
      title: "internal.title",
      internal: "internal.metadata.slug.current",
      params: "params",
      external: "external",
      visibleInMainMenu: "visibleInMainMenu",
    },
    prepare: ({ label, title, type, internal, params, external, visibleInMainMenu }) => ({
      title: `${visibleInMainMenu ? "Main menu | " : ""}${label || title}`,
      subtitle: resolveSlug({ type, internal, params, external }),
    }),
  },
});
