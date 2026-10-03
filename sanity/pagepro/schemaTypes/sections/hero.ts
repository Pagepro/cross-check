import { TfiLayoutCtaCenter } from "react-icons/tfi";
import { VscListFlat } from "react-icons/vsc";
import { defineArrayMember, defineField, defineType } from "sanity";

import { getBlockText } from "@/sanity/pagepro/lib/utils";

import { alignItems, textAlign } from "../fragments/fields/alignment";

/**
 * Hero variants (phase 3A Task 4).
 *
 * `default` is the starter's own hero (the `layout` radio below picks
 * background-hero vs product-hero) and is untouched. `landing` and `video` are
 * the two Storyblok heroes:
 *
 *  - `landing` ← `landingPageHero` (37 published instances). Two-column layout
 *    over a full-bleed background image: copy on the left, a reserved form
 *    column on the right.
 *  - `video` ← `hero` (1 published instance, the home page). A full-viewport
 *    background video from the tablet breakpoint up, background image below it.
 *
 * Every variant-specific field is hidden unless its variant is selected, so an
 * editor only ever sees the fields their chosen variant renders.
 */
const HERO_VARIANTS = ["default", "landing", "video"] as const;

type HeroVariant = (typeof HERO_VARIANTS)[number];

interface HeroParent {
  variant?: string;
  layout?: string;
}

/** The selected variant, defaulting to `default` for documents authored before
 *  the field existed (its value is simply absent there). */
const heroVariant = (parent: unknown): string =>
  (parent as HeroParent | undefined)?.variant || "default";

const hiddenUnlessVariant =
  (variant: HeroVariant) =>
  ({ parent }: { parent?: unknown }) =>
    heroVariant(parent) !== variant;

export default defineType({
  name: "hero",
  title: "Hero",
  icon: TfiLayoutCtaCenter,
  type: "object",
  groups: [
    { name: "content", default: true },
    { name: "image", title: "Hero image" },
    { name: "options" },
  ],
  fieldsets: [{ name: "alignment", options: { columns: 2 } }],
  fields: [
    defineField({
      name: "options",
      title: "Section options",
      type: "section-options",
      group: "options",
    }),
    defineField({
      name: "variant",
      title: "Variant",
      description:
        "Default = the standard hero (pick a layout below). Landing = campaign hero: copy over a full-bleed background image with a reserved form column on the right; always rendered on the dark theme (white text). Video = full-viewport hero with a looping background video from tablet up. For Landing and Video also set Section options → Colour theme to a dark one and the spacing to None: the component paints its own full-bleed backdrop, but the band above and below it (and, for Video, the copy colour) comes from Section options.",
      type: "string",
      group: "options",
      options: {
        layout: "radio",
        list: [
          { title: "Default", value: "default" },
          { title: "Landing page", value: "landing" },
          { title: "Video", value: "video" },
        ],
      },
      initialValue: "default",
    }),
    defineField({
      name: "layout",
      title: "Layout",
      description:
        "Background hero = full-bleed image with overlaid light text. Product hero = centered dark text and CTAs above a framed product screenshot, over a soft background image.",
      type: "string",
      group: "options",
      options: {
        layout: "radio",
        list: [
          { title: "Background hero", value: "background-hero" },
          { title: "Product hero", value: "product-hero" },
        ],
      },
      // Only the Default variant has layouts; Landing and Video each have one.
      hidden: hiddenUnlessVariant("default"),
    }),
    defineField({
      name: "breadcrumbs",
      title: "Breadcrumbs",
      description:
        "Optional custom breadcrumb trail above the headline (Landing variant). Leave empty and the trail is built from the page URL (e.g. SERVICES • NEXITY). When set, it replaces the visible trail on the page only — the page's BreadcrumbList structured data is always built from the URL. Give a destination to every crumb except the current page; a crumb without one is shown in red as the current page. Labels are shown upper-case.",
      type: "array",
      of: [
        defineArrayMember({
          name: "heroBreadcrumb",
          title: "Breadcrumb",
          type: "object",
          icon: VscListFlat,
          fields: [
            defineField({
              name: "label",
              type: "string",
              validation: (rule) =>
                rule.required().error("A crumb without a label renders nothing."),
            }),
            defineField({
              name: "link",
              title: "Destination",
              description:
                "Leave empty for the current page. The link's own label is not used — the crumb shows Label above.",
              type: "link",
            }),
          ],
          preview: {
            select: { title: "label", internal: "link.internal.metadata.slug.current" },
            prepare: ({ title, internal }) => ({
              title: title || "Breadcrumb",
              subtitle: internal ? `/${internal}` : "Current page",
            }),
          },
        }),
      ],
      group: "content",
      hidden: hiddenUnlessVariant("landing"),
    }),
    defineField({
      name: "pretitle",
      type: "string",
      description:
        "Small uppercase eyebrow above the headline. For the Landing variant this is the source `heading`'s lead-in line (e.g. “YOU DESIGN. WE CODE.”).",
      group: "content",
    }),
    defineField({
      name: "content",
      type: "simpleRichText",
      description:
        "The headline. Use a Section heading block — in the Landing and Video variants the first Section heading block becomes the page H1 (the hero is the only section allowed to render one).",
      group: "content",
    }),
    defineField({
      name: "description",
      title: "Description",
      description:
        "Supporting paragraph below the headline (Landing variant). Supports bullet lists — the source copy uses them.",
      type: "richText",
      group: "content",
      hidden: hiddenUnlessVariant("landing"),
    }),
    defineField({
      name: "secondaryContent",
      title: "Secondary text",
      description:
        "Optional short text placed below the icon row, alongside the headline column (Landing variant).",
      type: "richText",
      group: "content",
      hidden: hiddenUnlessVariant("landing"),
    }),
    defineField({
      name: "ctas",
      title: "Call-to-actions",
      type: "array",
      of: [{ type: "cta" }],
      group: "content",
    }),
    defineField({
      name: "icons",
      title: "Technology icons",
      description:
        "Row of small technology/partner marks under the description (Landing variant). Rendered at 32×32px on a single wrapping row, so use square, transparent artwork. Aspect ratio 1:1, recommended 128×128px (square) — SVG preferred. Maximum 8 (the busiest source page uses 7).",
      type: "array",
      of: [defineArrayMember({ type: "img" })],
      validation: (rule) => rule.max(8),
      group: "content",
      hidden: hiddenUnlessVariant("landing"),
    }),
    defineField({
      name: "form",
      title: "Contact form",
      description:
        "Contact form rendered in the landing hero's right column (source `landingPageHero.form` — a nested `contactForm` blok on all 37 landing heroes). Leave empty and the copy column spans the full width.",
      // Ruling R-3C-3: this replaces the phase-3A `formSlot` boolean, which only
      // reserved the column while the form itself was a separate section below
      // the hero. The form is now inline and shares the `contactFormFields`
      // object with the `contact-form` section, so the two can never drift.
      type: "contactFormFields",
      group: "content",
      hidden: hiddenUnlessVariant("landing"),
    }),
    defineField({
      name: "image",
      title: "Background image",
      description:
        "Full-bleed background image that bleeds to the section edges. In the Background hero it is the main hero image (a dark overlay keeps the light text legible); in the Product hero it is the soft sky/scenery backdrop behind the centred text; in the Video variant it is the MOBILE backdrop (the video and the desktop image only appear from 1024px up). Aspect ratio 16:9, recommended 2560×1440px (landscape) — for the Video variant supply a portrait crop instead, aspect ratio 4:5, recommended 1536×1920px. The focal point is centred when cropped.",
      type: "img",
      group: "image",
    }),
    defineField({
      name: "backgroundImage",
      title: "Landing background image",
      description:
        "Full-bleed backdrop the landing copy sits on. It is 34.25rem tall on mobile, 51rem from 768px and covers the whole hero from 1024px, so the focal point must survive a tall crop. Aspect ratio 16:9, recommended 2560×1440px (landscape).",
      type: "img",
      group: "image",
      hidden: hiddenUnlessVariant("landing"),
      validation: (rule) =>
        rule.custom((value, context) => {
          if (heroVariant(context.parent) !== "landing") return true;
          const image = (value as { image?: unknown } | undefined)?.image;
          return image
            ? true
            : "The landing hero renders white text directly on this image — without it the copy is unreadable.";
        }),
    }),
    defineField({
      name: "productImage",
      title: "Product screenshot",
      description:
        "Foreground product screenshot shown in a bordered, rounded frame below the text (Product hero layout only). Aspect ratio 16:9, recommended 1920×1080px (landscape).",
      type: "img",
      group: "image",
      hidden: ({ parent }) =>
        heroVariant(parent) !== "default" ||
        (parent as HeroParent | undefined)?.layout !== "product-hero",
    }),
    defineField({
      name: "bottomImage",
      title: "Bottom overlay image",
      description:
        "Optional decorative image pinned to the bottom edge of the hero, spanning the full width and overlapping the hero/background image above it. Purely decorative — it never intercepts clicks. On desktop the full image is shown uncropped at full width; on mobile it is centred and capped at ~240px tall. Use a long, wide graphic (e.g. a horizon, skyline or gradient strip). Aspect ratio ~16:3, recommended 2560×480px (landscape).",
      type: "img",
      group: "image",
      hidden: hiddenUnlessVariant("default"),
    }),
    defineField({
      name: "desktopBackgroundImage",
      title: "Desktop background image",
      description:
        "Backdrop used from 1024px up when no background video is set (Video variant). Aspect ratio 16:9, recommended 3200×1938px (landscape).",
      type: "img",
      group: "image",
      hidden: hiddenUnlessVariant("video"),
    }),
    defineField({
      name: "backgroundVideo",
      title: "Background video",
      description:
        "Looping, muted MP4 shown from 1024px up (Video variant). It is decorative and plays without controls, so it must carry no meaning and no audio. Keep it short and well under 5MB; visitors who ask for reduced motion see the poster image instead.",
      type: "file",
      options: { accept: "video/mp4" },
      group: "image",
      hidden: hiddenUnlessVariant("video"),
    }),
    defineField({
      name: "videoPoster",
      title: "Video poster",
      description:
        "First frame of the background video. Shown while the video loads and INSTEAD of it for visitors who prefer reduced motion, so it has to work as a still. Aspect ratio 16:9, recommended 1920×1080px (landscape).",
      type: "img",
      group: "image",
      hidden: hiddenUnlessVariant("video"),
    }),
    defineField({
      ...textAlign,
      name: "textAlign",
      title: "Text alignment",
      group: "options",
      fieldset: "alignment",
      hidden: hiddenUnlessVariant("default"),
    }),
    defineField({
      ...alignItems,
      name: "alignItems",
      title: "Vertical alignment",
      group: "options",
      fieldset: "alignment",
      hidden: hiddenUnlessVariant("default"),
    }),
  ],
  preview: {
    select: {
      content: "content",
      media: "image",
      landingMedia: "backgroundImage",
      variant: "variant",
    },
    prepare: ({ content, media, landingMedia, variant }) => ({
      title: getBlockText(content),
      subtitle:
        variant && variant !== "default"
          ? `Hero — ${variant === "landing" ? "Landing page" : "Video"}`
          : "Hero",
      media: (variant === "landing" ? landingMedia?.image : media?.image) || media?.image,
    }),
  },
  initialValue: {
    variant: "default",
    layout: "product-hero",
    pretitle: "Pagepro",
    content: [
      {
        _key: "block_1",
        _type: "block",
        // NOT `heading-1`: that style is not in `simpleRichText`'s list at all,
        // and `RichText` renders it as an <h1> of its own — seeding it here made
        // a second <h1> reachable once `headingAsH1` promoted a Section heading
        // alongside it (ruling P3A-23). `section-heading-xl` is the same 92px
        // step and IS in the field's Style dropdown.
        style: "section-heading-xl",
        children: [
          {
            _key: "block_1_span_1",
            _type: "span",
            text: "Build Something Amazing",
          },
        ],
      },
      {
        _key: "block_2",
        _type: "block",
        style: "normal",
        children: [
          {
            _key: "block_2_span_1",
            _type: "span",
            text: "Create exceptional digital experiences with our powerful platform. Everything you need to bring your vision to life.",
          },
        ],
      },
    ],
    ctas: [
      {
        _key: "cta_1",
        _type: "cta",
        link: {
          label: "Get Started",
          _type: "link",
          type: "external",
          external: "https://www.google.com",
        },
        variant: "primary",
      },
      {
        _key: "cta_2",
        _type: "cta",
        link: {
          label: "Learn More",
          _type: "link",
          type: "external",
          external: "https://www.google.com",
        },
        variant: "primary-outline",
      },
    ],
    textAlign: "center",
    alignItems: "center",
  },
});
