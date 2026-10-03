import { VscColorMode } from "react-icons/vsc";
import { defineField } from "sanity";

import { COMMON_DECORATORS, SOURCE_LOOK_DECORATORS } from "./decorators";
import { PARAGRAPH_STYLES, SECTION_HEADING_STYLES, SOURCE_LOOK_STYLES } from "./styles";

/**
 * GP-T1 — the text of one `data-table` cell: `simpleRichText` plus bullet lists.
 *
 * The source cell is a full `RichText` (`storyblok/ExtendedTableStoryblok/index.tsx:32-34`)
 * and its lists render as bulleted rows — /case-studies/gpnotebook's CMS comparison
 * table lists advantages and prices that way. A separate type rather than lists on
 * `simpleRichText` itself, which every section heading and intro uses and where a
 * list would be wrong. Same styles and marks, so an existing cell stays valid.
 */
export default defineField({
  title: "Table cell text",
  name: "tableCellRichText",
  description: "A data-table cell's text — short copy, optionally a bullet list.",
  type: "array",
  of: [
    {
      type: "block",
      name: "block",
      lists: [{ title: "Bullet", value: "bullet" }],
      marks: {
        decorators: [...COMMON_DECORATORS, ...SOURCE_LOOK_DECORATORS],
        annotations: [
          {
            name: "link",
            type: "simpleLink",
            title: "Link",
          },
          {
            type: "simplerColor",
            title: "Color",
            icon: VscColorMode,
          },
        ],
      },
      styles: [...SECTION_HEADING_STYLES, ...PARAGRAPH_STYLES, ...SOURCE_LOOK_STYLES],
    },
  ],
});
