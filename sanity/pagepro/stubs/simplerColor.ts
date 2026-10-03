import {defineField, defineType} from 'sanity'

// The exported schema annotates rich text with `sanity-plugin-simpler-color-input`, which does not support Sanity 6.
// Same shape as the plugin's type, so the imported content validates; editors pick a preset color by label.
export const simplerColor = defineType({
  name: 'simplerColor',
  title: 'Color',
  type: 'object',
  fields: [
    defineField({name: 'label', type: 'string'}),
    defineField({name: 'value', type: 'string', description: 'Hex color, e.g. #F5333F'}),
  ],
  preview: {select: {title: 'label', subtitle: 'value'}},
})
