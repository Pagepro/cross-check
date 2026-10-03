import { HighlightIcon } from "@sanity/icons/Highlight";
import { UnderlineIcon } from "@sanity/icons/Underline";
import {
  MdFormatAlignCenter,
  MdFormatAlignLeft,
  MdFormatAlignRight,
  MdSuperscript,
  MdSubscript,
} from "react-icons/md";
import { RxFontStyle } from "react-icons/rx";

import {
  HeadingFourLook,
  HeadingThreeLook,
  Highlight,
  Light,
  Subscript,
  HeadingFiveLook,
  SubheadingTwoLook,
  Superscript,
  TextAlignCenter,
  TextAlignLeft,
  TextAlignRight,
  Underline,
} from "./components";

export const COMMON_DECORATORS = [
  { title: "Strong", value: "strong" },
  {
    title: "Light",
    value: "light",
    icon: RxFontStyle,
    component: Light,
  },
  { title: "Emphasis", value: "em" },
  { title: "Underline", value: "underline", icon: UnderlineIcon, component: Underline },
  /* Ruling P3A-38: the source's `underlineType: "blackGradient"` (a painted
     band behind the text, NOT a text-decoration) becomes an inline decorator,
     so an editor can mark the exact span instead of a whole blok. */
  {
    title: "Highlight",
    value: "highlight",
    icon: HighlightIcon,
    component: Highlight,
  },
  { title: "Strike", value: "strike-through" },
  {
    title: "Subscript",
    value: "sub",
    icon: MdSubscript,
    component: Subscript,
  },
  {
    title: "Superscript",
    value: "sup",
    icon: MdSuperscript,
    component: Superscript,
  },
];

/**
 * Nexity Task 5b — a SOURCE LOOK applied to part of a block. The source renders a
 * `styled` span whose class differs from its block as its own Typography
 * (`atoms/RichText/consts.tsx:77-81`); live, the `nextjs-performance-optimization`
 * hero title's "For High-Traffic Sites" paints 22px (16px below 48rem), weight 900,
 * inside the 64px h1. Offered on `simpleRichText` only.
 */
export const SOURCE_LOOK_DECORATORS = [
  /* AB-C1 — /about "Why Choose Pagepro / as Your Next.js, Expo and Sanity Team?":
     the second line is a `heading3` span inside the 64px heading (live 36px). */
  {
    title: "Heading 3 look",
    value: "look-heading-3",
    icon: RxFontStyle,
    component: HeadingThreeLook,
  },
  {
    title: "Heading 4 look",
    value: "look-heading-4",
    icon: RxFontStyle,
    component: HeadingFourLook,
  },
];

/**
 * V14-D1..D3 — a timeline step title whose `subheading2` span sits inside `<b>`
 * renders as a body paragraph with the subheading2 look inline (live payhip
 * "INITIAL WORKS", nextjs-project-rescue "STEP 1 - …", nextjs-seo-optimization
 * "PHASE 1 - …"). Offered on `timelineRichText` only.
 */
export const TIMELINE_LOOK_DECORATORS = [
  ...SOURCE_LOOK_DECORATORS,
  {
    title: "Subheading 2 look",
    value: "look-subheading-2",
    icon: RxFontStyle,
    component: SubheadingTwoLook,
  },
  {
    title: "Heading 5 look",
    value: "look-heading-5",
    icon: RxFontStyle,
    component: HeadingFiveLook,
  },
];

export const ALIGNMENT_DECORATORS = [
  {
    title: "Text left",
    value: "left",
    component: TextAlignLeft,
    icon: MdFormatAlignLeft,
  },
  {
    title: "Text center",
    value: "center",
    component: TextAlignCenter,
    icon: MdFormatAlignCenter,
  },
  {
    title: "Text right",
    value: "right",
    component: TextAlignRight,
    icon: MdFormatAlignRight,
  },
];
