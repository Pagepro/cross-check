/**
 * `/blog/*` is served by an external WordPress origin (edge-routed), NOT by this
 * Next.js app. The prefix is therefore reserved: no `page` document may claim
 * `blog` or anything beneath it, or the edge route and the catchall route would
 * fight over the same URL.
 *
 * Slugs are stored WITHOUT a leading slash, but editors sometimes paste one — so
 * both shapes are treated as reserved. Pure + dependency-free so both the Studio
 * validation rule and the unit test can use it.
 */
export const RESERVED_BLOG_PREFIX = "blog";

export const RESERVED_BLOG_SLUG_MESSAGE =
  '"blog" is a reserved prefix (external blog) — choose another slug';

/** True for `blog`, `blog/…`, `/blog`, `/blog/…`; false for e.g. `blogging`. */
export function isReservedBlogSlug(slug: string | undefined): boolean {
  if (!slug) return false;

  const normalized = slug.startsWith("/") ? slug.slice(1) : slug;

  return (
    normalized === RESERVED_BLOG_PREFIX ||
    normalized.startsWith(`${RESERVED_BLOG_PREFIX}/`)
  );
}
