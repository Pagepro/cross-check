import { defineArrayMember } from "sanity";

import { COMMON_DECORATORS } from "@/sanity/pagepro/schemaTypes/objects/richText/decorators";
import { PARAGRAPH_STYLES } from "@/sanity/pagepro/schemaTypes/objects/richText/styles";

/**
 * The shared "paragraphs and lists, nothing else" block member (ruling P3A-57,
 * generalised for wave B). Consumers write:
 *
 * ```ts
 * defineField({ name: "body", type: "array", of: [listBlock()] })
 * ```
 *
 * A FACTORY, not a shared constant: Sanity normalises array members in place, so
 * two fields sharing one object literal would mutate each other.
 *
 * **Why an inline block-only array rather than a fourth named rich-text type.**
 * A named type would need its own GROQ projection constant, and that constant
 * would be interpolated into `SECTION_BRANCHES_QUERY` once per consuming field —
 * the query-budget cost the wave-A sweep spent itself paying down. An inline
 * `array of [block]` is already covered by `SIMPLE_RICHTEXT_QUERY` (R-3B-9),
 * which projects blocks plus their `simpleLink` annotations and nothing else, so
 * every consumer reuses one projection. `simpleRichText` itself cannot be reused
 * here because it declares `lists: []` — lists are the whole point of this field.
 *
 * Styles and decorators are the SAME constants `simpleRichText.ts:21,34` uses, so
 * the editor toolbar matches the rest of the Studio; `normal` is listed
 * explicitly because list items default to it. `simplerColor` (simpleRichText's
 * second annotation) is deliberately left out: the one `simpleLink` annotation is
 * exactly what `SIMPLE_RICHTEXT_QUERY` dereferences, which is what makes that
 * projection provably complete for these fields.
 */
export const listBlock = () =>
  defineArrayMember({
    type: "block",
    name: "block",
    lists: [
      { title: "Bullet", value: "bullet" },
      { title: "Numbered", value: "number" },
    ],
    marks: {
      decorators: COMMON_DECORATORS,
      annotations: [{ name: "link", type: "simpleLink", title: "Link" }],
    },
    styles: [{ title: "Normal", value: "normal" }, ...PARAGRAPH_STYLES],
  });
