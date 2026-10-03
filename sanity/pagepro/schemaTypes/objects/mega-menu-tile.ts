import { VscSymbolNamespace } from "react-icons/vsc";
import { defineField, defineType } from "sanity";

/**
 * One compact icon + label row in the LEFT column of a header mega menu
 * (phase 3D Task 6).
 *
 * Ported from the source `technologyTile` blok — 6 occurrences in the published
 * snapshot, all of them inside `menu_link.links` (3 in the "Services" menu, 3 in
 * "Resources"), never on a page. Source component
 * `molecules/TechnologyTile/index.tsx:9-20`: a whole-row link holding the icon
 * and the label side by side.
 */
export default defineType({
  name: "megaMenuTile",
  title: "Mega menu link",
  icon: VscSymbolNamespace,
  type: "object",
  options: {
    columns: 2,
  },
  fields: [
    defineField({
      name: "icon",
      title: "Icon",
      type: "img",
      description: "Square icon, 48×48px. Rendered at 1.5rem beside the label.",
      validation: (Rule) =>
        Rule.required().error("A row with no icon breaks the column's rhythm."),
    }),
    defineField({
      name: "label",
      title: "Label",
      type: "string",
      description: "The row's text, e.g. “Next.js Development”.",
      validation: (Rule) => Rule.required().error("A row with no label is invisible."),
    }),
    defineField({
      name: "link",
      title: "Destination",
      type: "link",
      description:
        "Where the row goes. Both source menus mix internal pages with external URLs.",
      validation: (Rule) =>
        Rule.required().error("A row that goes nowhere is a dead end."),
    }),
  ],
  preview: {
    select: {
      title: "label",
      media: "icon.image",
    },
    prepare: ({ title, media }) => ({
      title: title || "Mega menu link",
      media,
    }),
  },
});
