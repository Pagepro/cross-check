import React from "react";

const RawTextRenderer = ({
  children,
  value,
  ..._props
}: {
  children: React.ReactNode;
  value: string;
}) => <div className={value}>{children}</div>;

export default RawTextRenderer;

// Labels show the desktop (`lg`) pixel size from the Pagepro texts.ts type
// matrix (Task 8) — see block-styles.ts for the full base/md/lg ladder and
// web/.superpowers/sdd/2026-09-10-migration-phase-1-foundation/task-8-brief.md
// for the source matrix. `heading-1..4` alias `section-heading-xl/lg/md/sm`.
export const HEADING_STYLES = [
  { title: "Heading 1 (92px)", value: "heading-1", component: RawTextRenderer },
  { title: "Heading 2 (64px)", value: "heading-2", component: RawTextRenderer },
  { title: "Heading 3 (36px)", value: "heading-3", component: RawTextRenderer },
  { title: "Heading 4 (22px)", value: "heading-4", component: RawTextRenderer },
  { title: "Heading 5 (16px)", value: "heading-5", component: RawTextRenderer },
  { title: "Heading 6 (16px)", value: "heading-6", component: RawTextRenderer },
];

// Section headings — the four-step Galderglynn 900 scale used for section
// titles (per-section schema, phase 3). `heading-1..4` above are aliases of
// this same class scale — kept as a separate list because they're independent
// Sanity block-style keys.
export const SECTION_HEADING_STYLES = [
  {
    title: "Section Heading XL (92px)",
    value: "section-heading-xl",
    component: RawTextRenderer,
  },
  {
    title: "Section Heading L (64px)",
    value: "section-heading-lg",
    component: RawTextRenderer,
  },
  {
    title: "Section Heading M (36px)",
    value: "section-heading-md",
    component: RawTextRenderer,
  },
  {
    title: "Section Heading S (22px)",
    value: "section-heading-sm",
    component: RawTextRenderer,
  },
];

export const PARAGRAPH_STYLES = [
  { title: "Text Large (16px)", value: "body-1", component: RawTextRenderer },
  { title: "Text Medium (22px)", value: "body-2", component: RawTextRenderer },
  { title: "Text Normal (22px)", value: "body-3", component: RawTextRenderer },
  { title: "Text Small (14px)", value: "body-4", component: RawTextRenderer },
  { title: "Text Tiny (14px)", value: "body-5", component: RawTextRenderer },
];

// VP-R3 — `alt-heading-N` renders the source `headingN` look (texts.ts:16-45) on its own element; `alt-heading-6` is heading5's recorded fallback.
export const ALT_HEADING_STYLES = [
  { title: "Heading XXL (92px)", value: "alt-heading-1", component: RawTextRenderer },
  { title: "Heading XL (64px)", value: "alt-heading-2", component: RawTextRenderer },
  { title: "Heading L (36px)", value: "alt-heading-3", component: RawTextRenderer },
  { title: "Heading M (22px)", value: "alt-heading-4", component: RawTextRenderer },
  { title: "Heading S (16px)", value: "alt-heading-5", component: RawTextRenderer },
  { title: "Heading XS (16px)", value: "alt-heading-6", component: RawTextRenderer },
];

// VP-R3 — the source's looks on the element its content asked for: an `<h2>` in
// the 36px or 16px label look, or a `<p>` in any heading look (`texts.ts:16-57`).
// Offered by `simpleRichText` and `richText` only.
export const SOURCE_LOOK_STYLES = [
  { title: "H2 · 36px look", value: "h2-heading-3", component: RawTextRenderer },
  { title: "H2 · 16px label look", value: "h2-subheading-2", component: RawTextRenderer },
  // TB-T1..T4 (Toolbox S1) — the source looks on the h2 / h3 / h4 their headings asked for.
  { title: "H2 · 24px label look", value: "h2-subheading-1", component: RawTextRenderer },
  { title: "H3 · 16px heading look", value: "h3-heading-5", component: RawTextRenderer },
  { title: "H4 · 16px heading look", value: "h4-heading-5", component: RawTextRenderer },
  { title: "H3 · 16px label look", value: "h3-subheading-2", component: RawTextRenderer },
  { title: "H4 · 16px label look", value: "h4-subheading-2", component: RawTextRenderer },
  { title: "Text · 92px heading look", value: "p-heading-1", component: RawTextRenderer },
  { title: "Text · 64px heading look", value: "p-heading-2", component: RawTextRenderer },
  { title: "Text · 36px heading look", value: "p-heading-3", component: RawTextRenderer },
  { title: "Text · 22px heading look", value: "p-heading-4", component: RawTextRenderer },
  { title: "Text · 16px heading look", value: "p-heading-5", component: RawTextRenderer },
  {
    title: "Text · 24px label look",
    value: "p-subheading-1",
    component: RawTextRenderer,
  },
  {
    title: "Text · 16px label look",
    value: "p-subheading-2",
    component: RawTextRenderer,
  },
  // NX-8 — the source `body9` look: 16/22px, leading 1.3 from 1024px (`texts.ts:97-100`).
  { title: "Text · 22px tight look", value: "p-body-9", component: RawTextRenderer },
];

export const ALT_PARAGRAPH_STYLES = [
  { title: "Text XXL (16px)", value: "alt-body-1", component: RawTextRenderer },
  { title: "Text XL (22px)", value: "alt-body-2", component: RawTextRenderer },
  { title: "Text L (22px)", value: "alt-body-3", component: RawTextRenderer },
  { title: "Text M (14px)", value: "alt-body-4", component: RawTextRenderer },
  { title: "Text S (14px)", value: "alt-body-5", component: RawTextRenderer },
  { title: "Text XS (14px)", value: "alt-body-6", component: RawTextRenderer },
];
