import { VscFiles } from "react-icons/vsc";
import { defineArrayMember, defineField, defineType } from "sanity";

import { count } from "@/sanity/pagepro/stubs/utils";
import { getBlockText } from "@/sanity/pagepro/lib/utils";

export default defineType({
  name: "case-studies",
  title: "Case studies",
  icon: VscFiles,
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
      name: "layout",
      title: "Layout",
      description:
        "Source `caseStudyCardCarousel` (37 sections, 1–7 case studies) maps to `carousel` (R-3B-11).",
      type: "string",
      group: "content",
      options: {
        layout: "radio",
        list: [
          { value: "grid", title: "Grid — three per row" },
          { value: "carousel", title: "Carousel — one slide at a time" },
        ],
      },
      initialValue: "grid",
    }),
    defineField({
      name: "pretitle",
      title: "Tagline",
      description: "Short uppercase label above the heading, e.g. “Case studies”.",
      type: "string",
      group: "content",
    }),
    defineField({
      name: "content",
      title: "Section title",
      description:
        "Centered heading shown above the cards. Use the heading-2 block style.",
      type: "simpleRichText",
      group: "content",
    }),
    defineField({
      name: "caseStudies",
      title: "Case studies",
      description:
        "Pick the case studies to show, in order. Each is a Case study document — edits there propagate everywhere it is referenced on the next publish.",
      type: "array",
      group: "content",
      of: [
        defineArrayMember({
          type: "reference",
          to: [{ type: "case-study" }],
        }),
      ],
      validation: (Rule) =>
        Rule.required().min(1).error("Pick at least one case study to display."),
    }),
  ],
  preview: {
    select: { content: "content", caseStudies: "caseStudies" },
    prepare: ({ content, caseStudies }) => ({
      title: getBlockText(content) || "Case studies",
      subtitle: caseStudies?.length
        ? count(caseStudies, "case study", "case studies")
        : "Case studies",
    }),
  },
});
