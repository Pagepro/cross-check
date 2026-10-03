import { ThLargeIcon } from "@sanity/icons/ThLarge";
import { defineArrayMember, defineField, defineType } from "sanity";

import { count } from "@/sanity/pagepro/stubs/utils";
import { getBlockText } from "@/sanity/pagepro/lib/utils";

import { gridGapField } from "../partials/gridGapField";

/**
 * Feature grid — the grid-of-cards section.
 *
 * One section absorbs the four Storyblok card bloks that only ever appeared
 * inside a `grid` (ruling P3A-35). `variant` picks which card look renders:
 *
 * - `icon-boxes` → `iconBox` (×622, the most-used card: icon + rich-text title +
 *   description, laid out in 2/3/4-column grids)
 * - `cards` → `cardsWithIcon` (×48) / `cardWithIcon` (×166): a floating icon card
 *   on a surface panel, with an optional whole-card link and arrow footer
 * - `centered` → `centeredIconBox` (×173): small centred tech-logo tiles,
 *   6–10 to a row, optionally linked
 * - `text-cards` → `textCard` (×1): a padded rounded panel of text only
 *
 * `columns` replaces the enclosing `grid.columnsNumberDesktop` (ruling P3A-32);
 * `cardTheme` replaces `cardsWithIcon.cardBackgroundColor` / `textCard.
 * backgroundColor` (ruling P3A-34); `titleColor` replaces the mixed
 * object/string `iconBox.titleColor` picker (ruling P3A-33).
 */
/** The `variant` of the section a card field sits in (VP-D10 fix round F5).
 *
 * A field inside an array member only ever sees the member as `parent`, so the
 * section's own option has to be resolved by walking `document` along the
 * field's `path` (`["sections", {_key}, "cards", {_key}, "titleRich"]`) up to
 * the segment before `cards`. `undefined` — an unsaved section, or a shape this
 * does not recognise — deliberately reads as "show the field": a hidden field
 * whose value is already set is far worse than an extra one.
 */
const sectionVariantAt = (
  document: unknown,
  fieldPath: readonly unknown[],
): string | undefined => {
  const cardsAt = fieldPath.indexOf("cards");
  if (cardsAt < 1) return undefined;
  let node: unknown = document;
  for (const segment of fieldPath.slice(0, cardsAt)) {
    if (node === null || node === undefined) return undefined;
    if (typeof segment === "string" || typeof segment === "number") {
      node = (node as Record<string, unknown>)[segment as string];
      continue;
    }
    if (typeof segment === "object" && segment !== null && "_key" in segment) {
      const key = (segment as { _key: string })._key;
      node = Array.isArray(node)
        ? node.find((item) => (item as { _key?: string })?._key === key)
        : undefined;
      continue;
    }

    return undefined;
  }

  return (node as { variant?: string } | undefined)?.variant;
};

/** The two variants that route their headline through `CardTitle`
 * (`web/src/ui/sections/FeatureGrid/card-title.tsx`) and can therefore render a
 * rich one. The other two draw a plain string by source design — a centred tile
 * is the label INSIDE a whole-tile link, so an inline link there would nest
 * `<a>` in `<a>`. */
const RICH_HEADLINE_VARIANTS = ["icon-boxes", "cards"];

export default defineType({
  name: "feature-grid",
  title: "Feature grid",
  icon: ThLargeIcon,
  type: "object",
  groups: [{ name: "content", default: true }, { name: "options" }],
  fields: [
    defineField({
      name: "options",
      title: "Section options",
      type: "section-options",
      group: "options",
    }),
    defineField({
      name: "variant",
      title: "Card style",
      description:
        "Icon boxes = icon, title and description in a plain column. Cards = a floating icon card above a padded panel. Centred tiles = small logo tiles in a flowing row. Text cards = a padded panel of text only.",
      type: "string",
      options: {
        list: [
          { title: "Icon boxes", value: "icon-boxes" },
          { title: "Cards", value: "cards" },
          { title: "Centred tiles", value: "centered" },
          { title: "Text cards", value: "text-cards" },
        ],
        layout: "radio",
      },
      initialValue: "icon-boxes",
      group: "options",
    }),
    defineField({
      name: "columns",
      title: "Columns",
      description:
        "Desktop column count (1024px+). Tablet and mobile take their own counts below.",
      type: "number",
      options: {
        list: [
          { title: "2", value: 2 },
          { title: "3", value: 3 },
          { title: "4", value: 4 },
        ],
        layout: "radio",
      },
      initialValue: 3,
      group: "options",
    }),
    /* GP-G1 — the source grid's own tablet and mobile counts
       (`storyblok/Grid/index.tsx:39-49`: tablet falls back to the desktop count,
       mobile to one column). Empty keeps this section's default ramp — two
       columns from 768px, one below — which is what 106 of the 143 source icon-box
       grids use; the migration writes a value only where the source differs
       (tablet 3 ×25, 4 ×8, unset ×4; mobile 2 ×12). */
    defineField({
      name: "columnsTablet",
      title: "Columns (tablet)",
      description: "Columns from 768px to 1023px. Empty = 2.",
      type: "number",
      options: {
        list: [
          { title: "1", value: 1 },
          { title: "2", value: 2 },
          { title: "3", value: 3 },
          { title: "4", value: 4 },
        ],
        layout: "radio",
      },
      hidden: ({ parent }) => parent?.variant === "centered",
      group: "options",
    }),
    defineField({
      name: "columnsMobile",
      title: "Columns (mobile)",
      description: "Columns below 768px. Empty = 1.",
      type: "number",
      options: {
        list: [
          { title: "1", value: 1 },
          { title: "2", value: 2 },
        ],
        layout: "radio",
      },
      hidden: ({ parent }) => parent?.variant === "centered",
      group: "options",
    }),
    gridGapField({
      description:
        "Icon boxes only — CSS lengths (e.g. 28px or 2rem) between columns and rows, per breakpoint, as the source grid authored them. Empty = the default gaps (32px, 140px from 1024px).",
      hidden: ({ parent }) => parent?.variant !== "icon-boxes",
    }),
    /* VP-D8 — the source's centred tile grid counts per breakpoint
       (`storyblok/Grid/index.tsx:54-61`; 20 grids: mobile 2–3, tablet 3–6,
       desktop 6–10). Centred tiles only.

       Ruling D-E12 — what an UNSET count means, and it is not the same at every
       breakpoint. The source falls back tablet → the desktop count and mobile →
       a single column, never to a tile flow
       (`/Users/martin/1_PROJECTS/pagepro-career-portal/apps/site/src/components/storyblok/Grid/index.tsx:39-49`:
       `tabletColumns = columnsNumberTablet ? … : desktopColumns`,
       `mobileColumns = columnsNumberMobile ? … : "1fr"`). Only `tileColumns`
       unset means "as many as fit" — the auto-fit flow VP-D8 keeps for
       editor-made sections, which have no source count at all. All 20 migrated
       grids carry all three counts, so the fallbacks are a contract for
       editor-authored sections, not for migrated content. */
    defineField({
      name: "tileColumns",
      title: "Tiles per row (desktop)",
      description:
        "Centred tiles only — tiles per row from 1024px. Empty = as many as fit.",
      type: "number",
      options: {
        list: [
          { title: "6", value: 6 },
          { title: "7", value: 7 },
          { title: "8", value: 8 },
          { title: "9", value: 9 },
          { title: "10", value: 10 },
        ],
        layout: "radio",
      },
      hidden: ({ parent }) => parent?.variant !== "centered",
      group: "options",
    }),
    defineField({
      name: "tileColumnsTablet",
      title: "Tiles per row (tablet)",
      description:
        "Centred tiles only — tiles per row from 768px to 1023px. Empty = the desktop count.",
      type: "number",
      options: {
        list: [
          { title: "3", value: 3 },
          { title: "4", value: 4 },
          { title: "5", value: 5 },
          { title: "6", value: 6 },
        ],
        layout: "radio",
      },
      hidden: ({ parent }) => parent?.variant !== "centered",
      group: "options",
    }),
    defineField({
      name: "tileColumnsMobile",
      title: "Tiles per row (mobile)",
      description: "Centred tiles only — tiles per row below 768px. Empty = one column.",
      type: "number",
      options: {
        list: [
          { title: "2", value: 2 },
          { title: "3", value: 3 },
        ],
        layout: "radio",
      },
      hidden: ({ parent }) => parent?.variant !== "centered",
      group: "options",
    }),
    defineField({
      name: "cardTheme",
      title: "Card theme",
      description: "Card surface: white or grey #E7EEF1 (source cardBackgroundColor)",
      type: "string",
      options: {
        list: [
          { title: "Light", value: "light" },
          { title: "Muted", value: "muted" },
        ],
        layout: "radio",
      },
      initialValue: "light",
      group: "options",
    }),
    /* Nexity Task 4b (FE4) — the source's grid column that is its own `section`
       blok (`/Users/martin/1_PROJECTS/pagepro-career-portal/apps/site/src/components/storyblok/Grid/index.tsx:68-79`
       → `SectionStoryblok/index.tsx:46-47,53-65`): a white box with the column
       section's padding and `Inner` gutters, which shows as a white card on a
       grey band. Per-grid DATA, never a component default — only 54 of the 619
       grid-nested source icon boxes sit in such a column (ruling on RSP4). */
    defineField({
      name: "cardPanel",
      title: "Card panel",
      description:
        "Icon boxes only. White panel = each card sits on its own padded white panel, which stays white on a grey or dark band.",
      type: "string",
      options: {
        list: [
          { title: "None", value: "none" },
          { title: "White panel", value: "panel" },
        ],
        layout: "radio",
      },
      initialValue: "none",
      hidden: ({ parent }) => (parent?.variant ?? "icon-boxes") !== "icon-boxes",
      group: "options",
    }),
    /* P17 — the source card copy carried its own alignment (`storyblok/CardsWithIconStoryblok/index.tsx:41-58`); the `cards` variant renders it. */
    defineField({
      name: "cardTextAlign",
      title: "Card text alignment",
      type: "string",
      options: {
        layout: "radio",
        list: [
          { title: "Left", value: "start" },
          { title: "Centre", value: "center" },
          { title: "Right", value: "end" },
        ],
      },
      initialValue: "start",
      group: "options",
    }),
    defineField({
      name: "pretitle",
      title: "Tagline",
      description: "Small uppercase label above the heading (e.g. “Features”).",
      type: "string",
      group: "content",
    }),
    defineField({
      name: "content",
      title: "Section title",
      description:
        "Centered heading shown above the cards. Use the heading-2 block style.",
      type: "simpleRichText",
      group: "content",
    }),
    defineField({
      name: "cards",
      title: "Feature cards",
      description:
        "One entry per card. The Card style and Columns options decide how they render.",
      type: "array",
      group: "content",
      of: [
        defineArrayMember({
          type: "object",
          name: "card",
          fields: [
            defineField({
              name: "icon",
              title: "Icon",
              description:
                "Small pictogram shown above the card text (source iconBox.icon / cardWithIcon.icon / centeredIconBox.icon). Usually an SVG.",
              type: "img",
            }),
            defineField({
              name: "eyebrow",
              title: "Eyebrow",
              description:
                "Optional short uppercase label above the headline (e.g. “Win/loss intelligence”).",
              type: "string",
            }),
            defineField({
              name: "title",
              title: "Headline",
              description:
                "The card's main statement — one short sentence. Leave “Headline with links” empty and this is what renders; fill that one in and it wins, here and everywhere else.",
              type: "text",
              rows: 2,
            }),
            /* VP-D10 — the narrow exception to ruling P3A-41.
               `iconBox.title` is RICH TEXT in the source
               (`/Users/martin/1_PROJECTS/pagepro-career-portal/apps/site/src/components/storyblok/IconBoxStoryblok/index.tsx:29`
               passes `title[0].text` through `<RichText>`), and P3A-41 flattens
               it to the plain `title` above because the wrapper only sets a font
               family — a STYLING argument. 23 of the 622 source titles also
               carry a LINK mark, which is content, not styling: flattening those
               deletes a destination the reader could click. This field holds
               such a headline verbatim; `title` keeps the same words as plain
               text, because the Studio preview and the card link's accessible
               name (`ui/sections/FeatureGrid/card-overlay-link.tsx:34`) read it. */
            defineField({
              name: "titleRich",
              title: "Headline with links",
              description:
                "Only for a headline that has to carry an inline link. WHEN THIS HAS ANY WORDS IT WINS EVERYWHERE — it is what the page shows, what this card is titled in the list above, and what a screen reader announces for a whole-card link. Keep Headline filled with the same words as plain text; it is the fallback whenever this is empty. Icon boxes and Cards only.",
              type: "simpleRichText",
              hidden: ({ document, path }) => {
                const variant = sectionVariantAt(document, path);

                return variant !== undefined && !RICH_HEADLINE_VARIANTS.includes(variant);
              },
            }),
            defineField({
              name: "titleColor",
              title: "Headline colour",
              description:
                "Accent paints the headline red (source iconBox.titleColor #f40000).",
              type: "string",
              options: {
                list: [
                  { title: "Default", value: "default" },
                  { title: "Accent", value: "accent" },
                ],
                layout: "radio",
              },
              initialValue: "default",
            }),
            /* VP-D9 — the source title's own look: `heading4` (22px Galderglynn 900)
               on 16 icon-box titles, the plain body look everywhere else. */
            defineField({
              name: "titleLook",
              title: "Headline look",
              description:
                "Heading = the bold 22px heading look (icon boxes only); Default = body text.",
              type: "string",
              options: {
                list: [
                  { title: "Default", value: "default" },
                  { title: "Heading", value: "heading" },
                ],
                layout: "radio",
              },
              initialValue: "default",
            }),
            defineField({
              name: "description",
              title: "Description",
              description:
                "Supporting copy below the headline. Use the body-1 block style; bullet lists are allowed.",
              type: "featureCardRichText",
            }),
            defineField({
              name: "contentIcon",
              title: "Content icon",
              description:
                "Secondary icon shown inside the card body (source cardWithIcon.contentIcon)",
              type: "img",
            }),
            defineField({
              name: "image",
              title: "Image",
              description:
                "Optional picture shown below the text. Aspect ratio 4:3, recommended 800×600px (landscape).",
              type: "img",
            }),
            defineField({
              name: "link",
              title: "Link",
              description:
                "Optional destination — the whole card becomes a link (source cardWithIcon.link / centeredIconBox.href).",
              type: "link",
            }),
            /* NX-8 D5 — buttons INSIDE the card, below its copy. The source's
               pricing column is `iconBox` + `spacer` + `button` in ONE grid cell
               (`/Users/martin/1_PROJECTS/pagepro-career-portal/apps/site/src/components/storyblok/Grid/index.tsx:68-79`);
               without a home here the transformer emitted each button run as a
               full-width section between the cards and broke the 2-up grid. Not
               the whole-card `link` above: that is an overlay, these are buttons
               the editor styles. Icon boxes only. */
            defineField({
              name: "ctas",
              title: "Call-to-actions",
              description:
                "Buttons shown at the bottom of the card, below its description (Icon boxes only).",
              type: "array",
              of: [{ type: "cta" }],
              hidden: ({ document, path }) => {
                const variant = sectionVariantAt(document, path);

                return variant !== undefined && variant !== "icon-boxes";
              },
            }),
          ],
          /* A card needs SOMETHING to show: the four source bloks disagree on
             which field carries the copy (`centeredIconBox` has only a title,
             `cardWithIcon` has only content, `textCard` only content), so the
             rule is "at least one of" rather than a per-field `required()`. */
          validation: (Rule) =>
            Rule.custom((card) => {
              const { title, titleRich, description, icon } =
                (card as
                  | {
                      title?: string;
                      titleRich?: { children?: { text: string }[] }[];
                      description?: unknown[];
                      icon?: unknown;
                    }
                  | undefined) ?? {};

              /* F2 — a rich headline of one whitespace span, or of a block with
                 no children, says nothing: the card renders no heading at all
                 (ruling P3B-28), so it cannot satisfy "at least one of" either.
                 Measure the TEXT, exactly as `cardTitleText` does on the web
                 side (`web/src/ui/sections/FeatureGrid/utils.ts`). */
              if (
                title ||
                getBlockText(titleRich).trim() ||
                description?.length ||
                icon
              ) {
                return true;
              }

              return "Add a headline, a description or an icon.";
            }),
          preview: {
            select: {
              title: "title",
              titleRich: "titleRich",
              eyebrow: "eyebrow",
              description: "description",
              media: "icon.image",
              fallbackMedia: "image.image",
            },
            prepare: ({
              title,
              titleRich,
              eyebrow,
              description,
              media,
              fallbackMedia,
            }) => ({
              /* F3 — the page renders `titleRich` whenever it has words, so the
                 editor must be shown the same field first. Preferring `title`
                 titled the card with a string nobody sees. */
              title:
                getBlockText(titleRich).trim() ||
                title ||
                getBlockText(description) ||
                "Feature card",
              subtitle: eyebrow,
              /* `image` is still supported on the icon-boxes variant, so a card
                 with only an image must not preview blank. */
              media: media || fallbackMedia,
            }),
          },
        }),
      ],
    }),
  ],
  preview: {
    select: {
      content: "content",
      cards: "cards",
      variant: "variant",
      media: "cards.0.icon.image",
    },
    prepare: ({ content, cards, variant, media }) => ({
      title: getBlockText(content) || "Feature grid",
      subtitle: [
        cards?.length ? count(cards, "card") : "No cards yet",
        variant && variant !== "icon-boxes" ? variant : null,
      ]
        .filter(Boolean)
        .join(" · "),
      media,
    }),
  },
});
