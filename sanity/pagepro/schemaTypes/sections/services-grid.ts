import { ThListIcon } from "@sanity/icons/ThList";
import { VscSymbolMisc } from "react-icons/vsc";
import { defineArrayMember, defineField, defineType } from "sanity";

import { count } from "@/sanity/pagepro/stubs/utils";
import { getBlockText } from "@/sanity/pagepro/lib/utils";

/**
 * Services grid (ruling R-3B-14) — one section replaces the source's
 * `servicesList` (5 sections, 4/4/4/11/21 items) plus the two tile shapes it
 * carried: `serviceTile` (50) and `serviceCard` (3).
 *
 * `variant` picks the shape rather than splitting the section in two: both draw
 * the same content (icon, title, optional description, one link) and the source
 * put both through the same `ServicesList` rail
 * (`organisms/ServicesList/index.tsx:99-111`).
 *
 * `columns` is doing double duty on purpose: it is the desktop grid width AND
 * the carousel's page size once there are more items than fit, which is exactly
 * how the source's embla was configured — `slidesToScroll` 1 / 2 / 4 across its
 * three breakpoints (`organisms/ServicesList/index.tsx:24-33`).
 *
 * Six of the 50 source `serviceTile` occurrences sit in `menu_link.cards` (the
 * header mega-menu) and do NOT become items here — they become
 * `header.menu[].submenu[]` entries, deferred as owner decision NO-12
 * (ruling R-3B-15).
 */
export default defineType({
  name: "services-grid",
  title: "Services grid",
  icon: ThListIcon,
  type: "object",
  groups: [{ name: "content", default: true }, { name: "options" }],
  /* Object-level: this is what Sanity seeds when the section is inserted into a
     page's `sections` array, so the two option fields need no second one. */
  initialValue: { variant: "tile", columns: 4 },
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
        "Tile — a tall block with the icon at the top and the title, description and arrow at the bottom. Card — a centred card with a large icon above the title.",
      type: "string",
      initialValue: "tile",
      options: {
        layout: "radio",
        list: [
          { title: "Tile — icon top, title and arrow bottom", value: "tile" },
          { title: "Card — centred icon, title and description", value: "card" },
        ],
      },
      group: "options",
    }),
    defineField({
      name: "columns",
      title: "Columns",
      description:
        "Desktop columns, and the carousel's page size when there are more items than columns (source shows 4 per view from tablet up, `organisms/ServicesList/index.tsx:29-32`).",
      type: "number",
      initialValue: 4,
      options: {
        list: [
          { title: "2", value: 2 },
          { title: "3", value: 3 },
          { title: "4", value: 4 },
        ],
      },
      group: "options",
    }),
    defineField({
      name: "pretitle",
      title: "Tagline",
      description: "Short uppercase label above the heading, e.g. “What we do”.",
      type: "string",
      group: "content",
    }),
    defineField({
      name: "content",
      title: "Content",
      description:
        "Optional heading and supporting copy above the services. Leave empty for a bare grid.",
      type: "simpleRichText",
      group: "content",
    }),
    defineField({
      name: "items",
      title: "Services",
      description:
        "Each service is a single link: the whole tile or card is clickable, so keep the description plain copy. More items than the column count turns the grid into a carousel that pages by one column set.",
      type: "array",
      group: "content",
      of: [
        defineArrayMember({
          type: "object",
          name: "serviceItem",
          title: "Service",
          icon: VscSymbolMisc,
          fields: [
            defineField({
              name: "icon",
              title: "Icon",
              description:
                "Square icon. Aspect ratio 1:1, recommended 96×96px on the Tile variant and 328×328px on the Card variant (it renders at 3rem and up to 10.25rem respectively).",
              type: "img",
              validation: (Rule) =>
                Rule.required().error(
                  "The icon is the tile’s only imagery — without it the tile reads as a bare line of text.",
                ),
            }),
            defineField({
              name: "title",
              title: "Title",
              description:
                "The service name. It is also the link’s accessible name, so make it read on its own.",
              type: "string",
              validation: (Rule) =>
                Rule.required().error(
                  "A service with no title is an unnamed link — a screen reader announces it as its URL.",
                ),
            }),
            defineField({
              name: "description",
              title: "Description",
              description:
                "One or two lines under the title. Plain text. Hidden below tablet on the Card variant.",
              type: "text",
              rows: 2,
            }),
            defineField({
              name: "link",
              title: "Link",
              description:
                "Where the service goes — another page on this site, an external URL, or a file.",
              type: "link",
              validation: (Rule) =>
                Rule.required().error(
                  "The whole tile is this link; without it, it does nothing.",
                ),
            }),
          ],
          preview: {
            select: {
              title: "title",
              subtitle: "description",
              media: "icon.image",
            },
          },
        }),
      ],
      validation: (Rule) =>
        Rule.required().min(1).error("A services grid needs at least one service."),
    }),
  ],
  preview: {
    select: { content: "content", items: "items", variant: "variant" },
    prepare: ({ content, items, variant }) => ({
      title: getBlockText(content) || "Services grid",
      subtitle: items?.length
        ? count(items, variant === "card" ? "card" : "tile")
        : "Services grid",
    }),
  },
});
