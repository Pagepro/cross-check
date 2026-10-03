import { VscHorizontalRule } from "react-icons/vsc";
import { defineType } from "sanity";

/**
 * A horizontal rule inside rich text — row TB-G1 / slice S3.
 *
 * The source's Storyblok rich text offers a `horizontal_rule` node, serialized
 * by `atoms/RichText/consts.tsx:64` as `<Styled.Line />`
 * (`atoms/RichText/styles.tsx:85-89`). Live draws one under each of the three
 * B5 "Technologies" column titles on `/case-studies/toolbox`.
 *
 * It carries no fields: the source rule has no options, and a divider whose
 * look an editor could change is a different feature. Offered by `richText`
 * only — `simpleRichText` has no block objects at all, and the migration emits
 * one only inside a `content-columns` text cell (`CONTAINER_CAPABILITIES`
 * `grid.cell`), so the other four containers that hold a source
 * `horizontal_rule` keep reporting it until each is measured.
 */
export default defineType({
  name: "rule",
  title: "Horizontal rule",
  icon: VscHorizontalRule,
  type: "object",
  description: "A thin dividing line across the column.",
  // An object with no fields cannot be authored, so the block carries a single
  // hidden marker field. It is never read: the renderer draws the same rule for
  // every instance.
  fields: [{ name: "marker", type: "string", hidden: true }],
  preview: { prepare: () => ({ title: "Horizontal rule" }) },
});
