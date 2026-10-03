import { VscPreview } from "react-icons/vsc";
import { defineField, defineType } from "sanity";

/**
 * One tall picture card in the RIGHT column of a header mega menu (phase 3D
 * Task 6).
 *
 * Ported from the 6 `serviceTile` bloks that sit inside `menu_link.cards` (3 in
 * the "Services" menu, 3 in "Resources") — the same blok the `services-grid`
 * section uses, but in the header it is drawn small and bordered
 * (`Header/partials/HeaderContent/styles.ts:28-49`).
 *
 * `description` is OPTIONAL (R-3D-15): none of the 6 source cards carries one,
 * while 21 of the 50 page-level `serviceTile`s do.
 */
export default defineType({
  name: "megaMenuCard",
  title: "Mega menu card",
  icon: VscPreview,
  type: "object",
  options: {
    columns: 2,
  },
  fields: [
    defineField({
      name: "icon",
      title: "Icon",
      type: "img",
      description: "Square icon, 48×48px. Rendered at 3rem at the top of the card.",
      validation: (Rule) =>
        Rule.required().error("A card with no icon has nothing above its title."),
    }),
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      description: "The card's headline, e.g. “Web App Development”.",
      validation: (Rule) => Rule.required().error("A card with no title is unreadable."),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 2,
      description:
        "Optional supporting line under the title. The source header cards leave this empty.",
    }),
    defineField({
      name: "link",
      title: "Destination",
      type: "link",
      description: "Where the whole card goes.",
      validation: (Rule) =>
        Rule.required().error("A card that goes nowhere is a dead end."),
    }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "description",
      media: "icon.image",
    },
    prepare: ({ title, subtitle, media }) => ({
      title: title || "Mega menu card",
      subtitle,
      media,
    }),
  },
});
