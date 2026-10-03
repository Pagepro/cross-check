import React from "react";
import type { BlockAnnotationProps } from "sanity";

export const Strong = (props: { children: React.ReactNode }) => (
  <span className="font-bold">{props.children}</span>
);

export const Medium = (props: { children: React.ReactNode }) => (
  <strong className="font-medium">{props.children}</strong>
);

/** Editor preview of the `highlight` decorator. Mirrors the frontend `.highlight`
 * class (`web/src/styles/app.css`) — the painted band the source drew with
 * `underlineType: "blackGradient"` (`atoms/RichText/styles.tsx:47-56`). The band
 * itself is plain CSS in `editor.css`, keyed off this class name. */
export const Highlight = (props: { children: React.ReactNode }) => (
  <mark className="highlight">{props.children}</mark>
);

/** Editor preview of the `underline` decorator as a real `<u>`, like the frontend
 * renderer (`web/src/ui/RichText/index.tsx`), so `editor.css` can paint the heading
 * underline band on it (Task 1 fix round 1, M3). */
export const Underline = (props: { children: React.ReactNode }) => (
  <u>{props.children}</u>
);

/** Editor preview of a rich-text link: the source's 1px bottom rule, keyed off
 * `.rich-text-link` in `editor.css`. Wraps the default rendering, so the edit
 * popover keeps working (Task 1 fix round 1, M3). */
export const LinkAnnotation = (props: BlockAnnotationProps) => (
  <span className="rich-text-link">{props.renderDefault(props)}</span>
);

export const Light = (props: { children: React.ReactNode }) => (
  <span style={{ fontWeight: 300 }}>{props.children}</span>
);

/** Nexity Task 5b — editor preview of the inline `heading4` look (22px, 900). */
export const HeadingFourLook = (props: { children: React.ReactNode }) => (
  <span style={{ fontSize: "1.375rem", fontWeight: 900 }}>{props.children}</span>
);

/** V14-D1..D3 — the source `subheading2` look on part of a timeline step title
 * (Galderglynn 16px, 400) inside a body paragraph. */
export const SubheadingTwoLook = (props: { children: React.ReactNode }) => (
  <span
    style={{
      fontFamily: "Galderglynn, ui-sans-serif, sans-serif",
      fontSize: "1rem",
      fontWeight: 400,
    }}
  >
    {props.children}
  </span>
);

/** R-67-2 — the source `heading5` look on part of a timeline step paragraph
 * (Galderglynn 16px, 900). */
export const HeadingFiveLook = (props: { children: React.ReactNode }) => (
  <span
    style={{
      fontFamily: "Galderglynn, ui-sans-serif, sans-serif",
      fontSize: "1rem",
      fontWeight: 900,
    }}
  >
    {props.children}
  </span>
);

/** AB-C1 — the source `heading3` look on part of a block (36px from 64rem). */
export const HeadingThreeLook = (props: { children: React.ReactNode }) => (
  <span style={{ fontSize: "2.25rem", fontWeight: 900 }}>{props.children}</span>
);

export const Superscript = (props: { children: React.ReactNode }) => (
  <sup>{props.children}</sup>
);

export const Subscript = (props: { children: React.ReactNode }) => (
  <sub>{props.children}</sub>
);

const TextAlign = (props: {
  children: React.ReactNode;
  align: "left" | "center" | "right";
}) => <p style={{ margin: 0, textAlign: props.align }}>{props.children}</p>;

export const TextAlignLeft = (props: { children: React.ReactNode }) => (
  <TextAlign align="left">{props.children}</TextAlign>
);

export const TextAlignCenter = (props: { children: React.ReactNode }) => (
  <TextAlign align="center">{props.children}</TextAlign>
);

export const TextAlignRight = (props: { children: React.ReactNode }) => (
  <TextAlign align="right">{props.children}</TextAlign>
);
