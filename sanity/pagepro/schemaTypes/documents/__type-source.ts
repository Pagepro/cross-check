import { defineField, defineType } from "sanity";

/**
 * Internal Type Source Document
 *
 * This is a hidden internal document type used ONLY for TypeScript type generation.
 * It enables generating types for reusable fragments (image, link, metadata, etc.)
 * without needing actual document instances in the database.
 *
 * HOW IT WORKS:
 * 1. Add a field here with the Sanity schema type you want to generate types for
 * 2. Create a corresponding fragment file in `src/sanity/lib/fragments/`
 * 3. Use `defineQuery` to create a query that fetches from this document type
 * 4. Run `pnpm ts:typegen` to generate the TypeScript types
 * 5. Export the type alias in `src/types/fragments.ts`
 *
 * @example
 * // To add a new fragment type for "myNewType":
 * defineField({
 *   name: "myNewField",
 *   type: "myNewType",
 * }),
 *
 * @see src/sanity/lib/fragments/ - Fragment query definitions
 * @see src/types/fragments.ts - Exported type aliases
 * @see README.md - "How to Add New Types" section for detailed instructions
 */
export default defineType({
  name: "internal.typeSource",
  type: "document",
  hidden: true,
  fields: [
    defineField({
      name: "image",
      type: "img",
    }),
    defineField({
      name: "link",
      type: "link",
    }),
    defineField({
      name: "metadata",
      type: "metadata",
    }),
    defineField({
      name: "cta",
      type: "cta",
    }),
  ],
});
