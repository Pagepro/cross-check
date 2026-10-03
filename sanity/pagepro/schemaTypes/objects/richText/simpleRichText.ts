import { VscColorMode } from "react-icons/vsc";
import { defineField } from "sanity";

import { COMMON_DECORATORS, SOURCE_LOOK_DECORATORS } from "./decorators";
import { PARAGRAPH_STYLES, SECTION_HEADING_STYLES, SOURCE_LOOK_STYLES } from "./styles";

export default defineField({
  title: "Text",
  name: "simpleRichText",
  description: "Sections text content that uses design font styling",
  type: "array",
  of: [
    {
      type: "block",
      name: "block",
      lists: [],
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
      // Sections use the design-system "Section heading" scale only — the
      // numbered `heading-1..6` ladder (30px/18px sizes) has no Figma equivalent
      // for sections and is intentionally omitted here. It remains available in
      // `pageRichText` (long-form docs need a semantic H1–H6 hierarchy).
      styles: [...SECTION_HEADING_STYLES, ...PARAGRAPH_STYLES, ...SOURCE_LOOK_STYLES],
    },
  ],
});
