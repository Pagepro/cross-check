import { VscColorMode } from "react-icons/vsc";
import { defineField } from "sanity";

import { COMMON_DECORATORS, TIMELINE_LOOK_DECORATORS } from "./decorators";
import { PARAGRAPH_STYLES, SECTION_HEADING_STYLES, SOURCE_LOOK_STYLES } from "./styles";

/**
 * A timeline step's panel — `simpleRichText` plus bullet and numbered lists
 * (owner P0, /services/nexity, 2026-09-17).
 *
 * The source step body is one full `RichText` blok
 * (`storyblok/TimelineStoryblok/index.tsx:15`, `content?.[0]?.text`), so its
 * paragraphs carry the source looks (the "DISCOVERY & DEMO" title is a
 * `subheading2` paragraph) and its spans carry inline colours (the red `→`
 * markers, the red "Outcome:" label) — none of which the paragraphs-and-lists
 * `listBlock()` it used to be could hold. Same shape as `tableCellRichText`
 * (GP-T1): simpleRichText's styles, look decorators, link and colour, plus lists.
 */
export default defineField({
  title: "Timeline step text",
  name: "timelineRichText",
  description: "A timeline step's panel — paragraphs, source looks, colour and lists.",
  type: "array",
  of: [
    {
      type: "block",
      name: "block",
      lists: [
        { title: "Bullet", value: "bullet" },
        { title: "Numbered", value: "number" },
      ],
      marks: {
        decorators: [...COMMON_DECORATORS, ...TIMELINE_LOOK_DECORATORS],
        annotations: [
          { name: "link", type: "simpleLink", title: "Link" },
          { type: "simplerColor", title: "Color", icon: VscColorMode },
        ],
      },
      styles: [...SECTION_HEADING_STYLES, ...PARAGRAPH_STYLES, ...SOURCE_LOOK_STYLES],
    },
  ],
});
