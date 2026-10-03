import { VscColorMode } from "react-icons/vsc";
import { defineArrayMember, defineField } from "sanity";

import { ALIGNMENT_DECORATORS, COMMON_DECORATORS } from "./decorators";
import { ALT_HEADING_STYLES, ALT_PARAGRAPH_STYLES, SOURCE_LOOK_STYLES } from "./styles";

export default defineField({
  title: "Text",
  name: "richText",
  description: "Rich Text content that uses content font styling",
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
        decorators: [...COMMON_DECORATORS, ...ALIGNMENT_DECORATORS],
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
      styles: [...ALT_HEADING_STYLES, ...ALT_PARAGRAPH_STYLES, ...SOURCE_LOOK_STYLES],
    },
    defineArrayMember({
      title: "Image",
      type: "img",
    }),
    defineArrayMember({ type: "decoratedList" }),
    /* TB-G1 — the source rich text offers a `horizontal_rule`
       (`atoms/RichText/consts.tsx:64`); live draws one under each B5 technology
       column title on /case-studies/toolbox. */
    defineArrayMember({ type: "rule" }),
  ],
});
