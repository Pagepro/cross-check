"use client";

import { Box, Button, Flex, Text, TextInput } from "@sanity/ui";
import { useState } from "react";
import { VscCheck, VscCopy } from "react-icons/vsc";
import { defineField, defineType } from "sanity";

/**
 * Vertical rhythm scale — transcribed 1:1 from the Storyblok `spacings`
 * datasource (`docs/parity/storyblok/snapshot/datasource-entries.json`). The
 * pixel values are the ones `--spacing-section-*` in `web/src/styles/app.css`
 * declares; keep the two lists in sync.
 */
const SPACING_OPTIONS = [
  { title: "None (0)", value: "none" },
  { title: "XXS (12px)", value: "xxs" },
  { title: "XS (24px)", value: "xs" },
  { title: "S (48px)", value: "s" },
  { title: "M (64px)", value: "m" },
  { title: "L (80px)", value: "l" },
  { title: "XL (96px)", value: "xl" },
  { title: "XXL (128px)", value: "xxl" },
];

export default defineType({
  name: "section-options",
  title: "Section options",
  type: "object",
  fieldsets: [
    {
      name: "spacing",
      title: "Spacing",
      options: { columns: 2 },
      description:
        "Vertical rhythm around the section: mobile below 768px, tablet 768–1023px, desktop from 1024px. The mobile and tablet values are optional — when left empty the desktop value applies at that width.",
    },
  ],
  fields: [
    defineField({
      name: "hidden",
      type: "boolean",
      description: "Hide the section from the page",
      initialValue: false,
    }),
    defineField({
      name: "withTopDivider",
      title: "Show top divider",
      type: "boolean",
      description: "Show a horizontal line above the section",
      initialValue: false,
    }),
    defineField({
      name: "withBottomDivider",
      title: "Show bottom divider",
      type: "boolean",
      description: "Show a horizontal line below the section",
      initialValue: false,
    }),
    defineField({
      name: "colorTheme",
      title: "Color theme",
      type: "string",
      description:
        "Background/foreground pairing for the section. The list is closed on purpose (plan ruling R-3A-2): the migrated content only ever used these five palette entries — white, grey #E7EEF1, navy #00141F, navy-2 #0A2B3D and the brand red. Muted = #E7EEF1, the grey used by 37 source sections.",
      options: {
        list: [
          { title: "Light", value: "light" },
          { title: "Muted (grey)", value: "muted" },
          { title: "Dark (navy)", value: "dark" },
          { title: "Dark alt (navy 2)", value: "dark-alt" },
          { title: "Accent (red)", value: "accent" },
        ],
        layout: "radio",
      },
      initialValue: "light",
    }),
    /* TB-N1 (supersedes R-Q3-1's boolean `nestedBand`) — the source renders a
       band nested in another padded container INSIDE that container, so both
       gutters apply. Two shapes do it: a `section` inside a `section`
       (R-Q3-1) and an `inner` blok inside its band's own Inner (TB-N1); the
       snapshot has 104 of the second and none nested deeper than two.

       The OUTER variant is what is stored, not a boolean, because the outer
       cap can bind before the inner one: live renders `narrow > narrow` at
       1008px at 1440 (the outer's 1072 content minus the inner's 2 x 32),
       where a boolean plus the band's own container would give 1072. With the
       outer variant the renderer reproduces
       `min(min(viewport, outer) - 2p, inner) - 2p` exactly, at every width. */
    defineField({
      name: "nestedInside",
      title: "Nested inside container",
      type: "string",
      description:
        "The source band sat inside ANOTHER container of this width, so both gutters apply. Set by the migration.",
      options: {
        list: [
          { title: "Default (1354px)", value: "default" },
          { title: "Wide (1600px)", value: "wide" },
          { title: "Narrow (1136px)", value: "narrow" },
          { title: "Very small (914px)", value: "verySmall" },
          { title: "Extra small (666px)", value: "extraSmall" },
        ],
      },
    }),
    defineField({
      name: "containerWidth",
      title: "Container width",
      type: "string",
      description:
        "Max width of the section's content container. Maps to the `section*` utilities in web/src/styles/app.css: default 84.625rem, wide 100rem, narrow 71rem, very small 57.125rem, extra small 41.625rem. “None” lets the section span the full viewport.",
      options: {
        list: [
          { title: "Default (1354px)", value: "default" },
          { title: "Wide (1600px)", value: "wide" },
          { title: "Narrow (1136px)", value: "narrow" },
          { title: "Very small (914px)", value: "verySmall" },
          { title: "Extra small (666px)", value: "extraSmall" },
          { title: "None (full width)", value: "none" },
        ],
      },
      initialValue: "default",
    }),
    defineField({
      name: "spacingTop",
      title: "Top spacing",
      type: "string",
      description:
        "Desktop value (from 1024px; also tablet and mobile when those are empty). Migration note: the most common source combination was desktop XXL / tablet L / mobile M — the transformer sets the per-section value, this initial value is only the default for hand-authored sections.",
      options: { list: SPACING_OPTIONS },
      initialValue: "m",
      fieldset: "spacing",
    }),
    defineField({
      name: "spacingBottom",
      title: "Bottom spacing",
      type: "string",
      description:
        "Desktop value (from 1024px; also tablet and mobile when those are empty). Migration note: the most common source combination was desktop XXL / tablet L / mobile M.",
      options: { list: SPACING_OPTIONS },
      initialValue: "m",
      fieldset: "spacing",
    }),
    defineField({
      name: "spacingTopTablet",
      title: "Top spacing (tablet)",
      type: "string",
      description: "Optional, 768–1023px. Leave empty to use the desktop value.",
      options: { list: SPACING_OPTIONS },
      fieldset: "spacing",
    }),
    defineField({
      name: "spacingBottomTablet",
      title: "Bottom spacing (tablet)",
      type: "string",
      description: "Optional, 768–1023px. Leave empty to use the desktop value.",
      options: { list: SPACING_OPTIONS },
      fieldset: "spacing",
    }),
    defineField({
      name: "spacingTopMobile",
      title: "Top spacing (mobile)",
      type: "string",
      description: "Optional, below 768px. Leave empty to use the desktop value.",
      options: { list: SPACING_OPTIONS },
      fieldset: "spacing",
    }),
    defineField({
      name: "spacingBottomMobile",
      title: "Bottom spacing (mobile)",
      type: "string",
      description: "Optional, below 768px. Leave empty to use the desktop value.",
      options: { list: SPACING_OPTIONS },
      fieldset: "spacing",
    }),
    defineField({
      name: "backgroundImage",
      title: "Background image",
      type: "img",
      description:
        "Optional decorative image painted behind the section's content (cover). Leave the alt text empty — it is rendered as decoration.",
    }),
    defineField({
      name: "uid",
      title: "Unique identifier",
      description: "Used for anchor/jump links (HTML `id` attribute).",
      type: "string",
      validation: (Rule) =>
        Rule.regex(/^[a-zA-Z0-9-]+$/).error(
          "Must not contain spaces or special characters",
        ),
      components: {
        input: ({ elementProps, path }) => {
          const indexOfSection = path.indexOf("sections");
          const sectionKey = (path[indexOfSection + 1] as any)?._key;
          // eslint-disable-next-line react-hooks/rules-of-hooks
          const [checked, setChecked] = useState(false);

          return (
            <Flex align="center" gap={1}>
              <Text muted>#</Text>

              <Box flex={1}>
                <TextInput
                  {...elementProps}
                  style={elementProps.style as React.CSSProperties}
                  placeholder={sectionKey}
                />
              </Box>

              <Button
                title="Click to copy"
                mode="ghost"
                icon={checked ? VscCheck : VscCopy}
                disabled={checked}
                onClick={() => {
                  navigator.clipboard.writeText("#" + (elementProps.value || sectionKey));

                  setChecked(true);
                  setTimeout(() => setChecked(false), 1000);
                }}
              />
            </Flex>
          );
        },
      },
    }),
    /* VP-D6 — the source band's scroll-down button target (`section.scrollTo.anchor`,
       `/Users/martin/1_PROJECTS/pagepro-career-portal/apps/site/src/components/layout/Section/index.tsx:14-24`):
       the uid of the section it jumps to. */
    defineField({
      name: "scrollTo",
      title: "Scroll-down button target",
      description:
        "Unique identifier of the section the square arrow button on this section's bottom edge scrolls to. Empty = no button.",
      type: "string",
      validation: (Rule) =>
        Rule.regex(/^[a-zA-Z0-9-]+$/).error(
          "Must not contain spaces or special characters",
        ),
    }),
  ],
});
