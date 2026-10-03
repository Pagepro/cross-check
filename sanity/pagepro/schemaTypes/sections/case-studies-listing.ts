import { TfiLayoutGrid3Alt } from "react-icons/tfi";
import { defineField, defineType } from "sanity";

export default defineType({
  name: "case-studies-listing",
  title: "Case Studies Listing",
  type: "object",
  icon: TfiLayoutGrid3Alt,
  groups: [{ name: "content", default: true }, { name: "options" }],
  fields: [
    defineField({
      name: "options",
      title: "Section options",
      type: "section-options",
      group: "options",
    }),
    defineField({
      name: "perPage",
      title: "Case studies per page",
      description: "Number of cards per page in the grid. Default 6 (a 3×2 grid).",
      type: "number",
      initialValue: 6,
      validation: (Rule) => Rule.min(1).max(24).integer(),
      group: "content",
    }),
    defineField({
      name: "showCategoryFilter",
      title: "Show category filter",
      description:
        "Show the category filter above the grid (source: production case-studies listing).",
      type: "boolean",
      initialValue: true,
      group: "content",
    }),
  ],
  preview: {
    prepare: () => ({
      title: "Case Studies Listing",
      subtitle: "Case Studies Listing",
    }),
  },
});
