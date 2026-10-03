import { VscColorMode } from "react-icons/vsc";
import { defineField } from "sanity";

import { COMMON_DECORATORS, SOURCE_LOOK_DECORATORS } from "./decorators";
import { PARAGRAPH_STYLES, SECTION_HEADING_STYLES, SOURCE_LOOK_STYLES } from "./styles";

/**
 * Queue item 2 — a feature-grid card's description: `simpleRichText` plus bullet
 * and numbered lists.
 *
 * The source card description is a full `RichText` blok
 * (`storyblok/Grid/partials/IconBox`), and live renders its lists as real
 * `<ul><li>` rows with disc markers (`/services/sanity-development`: "Web
 * Portals", "From Monolithic to Composable CMS", "Advanced Workflow Setup",
 * "Technical Support and Maintenance"). Converted into the list-less
 * `simpleRichText`, those bullets were flattened into paragraphs and the page
 * lost the list semantics.
 *
 * A separate type, like `tableCellRichText` (GP-T1) and `timelineRichText`:
 * same styles and marks, so an existing description stays valid.
 */
export default defineField({
  title: "Feature card text",
  name: "featureCardRichText",
  description: "A feature card's description — copy, optionally a bullet list.",
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
        decorators: [...COMMON_DECORATORS, ...SOURCE_LOOK_DECORATORS],
        annotations: [
          { name: "link", type: "simpleLink", title: "Link" },
          { type: "simplerColor", title: "Color", icon: VscColorMode },
        ],
      },
      styles: [...SECTION_HEADING_STYLES, ...PARAGRAPH_STYLES, ...SOURCE_LOOK_STYLES],
    },
  ],
});
