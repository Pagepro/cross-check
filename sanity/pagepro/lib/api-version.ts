/**
 * One definition of the Sanity API version for everything in the Studio
 * package, so a schema-side `getClient({ apiVersion })` can never drift from
 * the client the Studio itself runs on.
 *
 * Both prefixes are read because the same schemas run in two hosts: the
 * standalone Studio (Vite, which only inlines `SANITY_STUDIO_*`) and the
 * embedded Studio inside `web/` (Next, which only inlines `NEXT_PUBLIC_*`).
 * The literal is the last resort and matches `web/src/sanity/lib/env.ts`.
 */
export const API_VERSION =
  process.env.SANITY_STUDIO_API_VERSION ||
  process.env.NEXT_PUBLIC_SANITY_API_VERSION ||
  "2024-12-01";
