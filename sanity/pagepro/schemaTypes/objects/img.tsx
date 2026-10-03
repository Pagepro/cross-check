import { VscFileMedia } from "react-icons/vsc";
import { defineArrayMember, defineField, defineType } from "sanity";

import { count } from "@/sanity/pagepro/stubs/utils";
import TextInputWithPresets, {
  getPreset,
  type Preset,
} from "@/sanity/pagepro/ui/TextInputWithPresets";

const presets: Preset[] = [
  { title: "Tablet and below", value: "(width < 48rem)" },
  { title: "Mobile only", value: "(width < 24rem)" },
  { title: "Dark mode", value: "(prefers-color-scheme: dark)" },
];

export default defineType({
  name: "img",
  title: "Image",
  type: "object",
  icon: VscFileMedia,
  fieldsets: [
    { name: "details" },
    {
      name: "options",
      options: { collapsed: true },
      description: "If you need to add responsive images, add them here.",
    },
    {
      name: "attributes",
      options: { columns: 2, collapsed: true },
      description: "Image attributes (alt and loading strategy)",
    },
  ],
  fields: [
    defineField({
      name: "image",
      title: "Default image",
      type: "image",
      options: {
        hotspot: true,
        metadata: ["lqip"],
      },
      fieldset: "details",
    }),
    defineField({
      name: "responsive",
      title: "Responsive images",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "responsive",
          fields: [
            defineField({
              name: "image",
              type: "image",
              options: {
                hotspot: true,
              },
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "media",
              title: "Media query",
              type: "string",
              placeholder: `e.g. ${presets.map((p) => getPreset(p)).join(", ")}`,
              validation: (Rule) => Rule.required(),
              initialValue: getPreset(presets[0]),
              components: {
                input: (props) => (
                  <TextInputWithPresets prefix="@media" presets={presets} {...props} />
                ),
              },
            }),
          ],
          preview: {
            select: {
              title: "media",
              media: "image",
            },
          },
        }),
      ],
      fieldset: "options",
    }),
    defineField({
      name: "alt",
      type: "string",
      fieldset: "attributes",
    }),
    defineField({
      name: "loading",
      type: "string",
      description:
        "Image loading strategy (this field will be used by developers to optimize app performance)",
      options: {
        list: ["lazy", "eager"],
        layout: "radio",
      },
      initialValue: "lazy",
      fieldset: "attributes",
    }),
  ],
  preview: {
    select: {
      image: "image",
      responsive: "responsive",
      alt: "alt",
      loading: "loading",
    },
    prepare: ({ image, responsive, alt, loading = "lazy" }) => ({
      title: alt,
      subtitle: [
        responsive && count(responsive, "responsive image"),
        loading && `loading="${loading}"`,
      ]
        .filter(Boolean)
        .join(", "),
      media: image,
    }),
  },
});
