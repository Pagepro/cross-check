import { ImagesIcon } from "@sanity/icons/Images";
import { defineField, defineType } from "sanity";

import { count } from "@/sanity/pagepro/stubs/utils";
import { getBlockText } from "@/sanity/pagepro/lib/utils";

import { SpeedSlider } from "./SpeedSlider";

export default defineType({
  name: "logos-carousel",
  title: "Logos carousel",
  icon: ImagesIcon,
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
      name: "pretitle",
      title: "Tagline",
      description: "Small uppercase label above the heading (e.g. “Our clients”).",
      type: "string",
      group: "content",
    }),
    defineField({
      name: "content",
      title: "Section title",
      description:
        "Centered heading shown above the logo strip. Use the section-heading-lg block style.",
      type: "simpleRichText",
      group: "content",
    }),
    defineField({
      name: "logos",
      title: "Logos",
      description:
        "Partner / customer logos. Each is shown in greyscale, fitted inside an 8rem × 3.125rem box (128 × 50 px) without cropping — use a transparent PNG or SVG. Arrows appear when there are more logos than fit on screen.",
      type: "array",
      of: [{ type: "img" }],
      validation: (Rule) => Rule.min(4).warning("Add at least 4 logos."),
      group: "content",
    }),
    /* VP-R7 (final review M4) — the strip no longer scrolls on its own, so
       nothing reads this value. Kept (hidden, deprecated) because staging
       documents still hold it; removing the field would flag those values as
       unknown in the Studio. */
    defineField({
      name: "speed",
      title: "Scroll speed (no longer used)",
      description:
        "Not used: the logo strip does not scroll on its own — visitors move it with the arrows when the logos overflow. Changing this value has no effect.",
      type: "number",
      deprecated: {
        reason:
          "The logo strip is a manual carousel with arrows (VP-R7); nothing reads this value.",
      },
      hidden: true,
      readOnly: true,
      validation: (Rule) => Rule.min(1).max(5).integer(),
      components: { input: SpeedSlider },
      group: "content",
    }),
    defineField({
      name: "marquee",
      title: "Marquee band",
      description:
        "Decorative repeating text band behind the logos (source marqueeBackground).",
      type: "marquee-band",
      group: "content",
    }),
  ],
  preview: {
    select: {
      title: "content",
      logos: "logos",
      media: "logos.0.image",
    },
    prepare: ({ title, logos, media }) => ({
      title: getBlockText(title) || "Logos carousel",
      subtitle: logos?.length ? count(logos, "logo") : "No logos yet",
      media,
    }),
  },
});
