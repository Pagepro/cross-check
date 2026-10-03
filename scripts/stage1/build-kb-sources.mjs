// Knowledge Base source for the Pagepro site: one `kbSource` document per page or case study, with its full URL
// and its text in reading order. The page-builder documents carry ~40% styling noise (options, spacing, colors),
// and the Context build skipped the largest ones, so the KB reads these flattened copies instead.
// Reads and writes the private `pagepro` dataset. Run: npx sanity exec scripts/stage1/build-kb-sources.mjs --with-user-token
import {getCliClient} from 'sanity/cli'

const SITE = 'https://pagepro.co'
// Pages that answer no buyer question (utility, legal, forms).
const EXCLUDED_PAGES = [
  'page-00433457-a479-4c07-8ae1-dbc71e0230d0', // Career
  'page-1e153df4-c92e-4ecd-b4a2-f3cca1571989', // Consultation (form)
  'page-37ad916b-ba8e-4fec-9cb7-6a50c5e5b22c', // Cookies Policy
  'page-3d9940e4-58ca-40e7-bddb-6b8785cd500a', // Newsletter
  'page-cb946e00-8b9d-4d2e-85e2-5e6de5f5c44e', // Privacy Policy
  'page-13003a46-98f8-4259-9e82-e55eaa04b2a7', // Thank You
  'page-0ea7efff-2a38-4462-97e1-1a5e2487bcc4', // Waiting list
]
// Keys that hold layout, styling or plumbing rather than words a reader sees.
const SKIP_KEYS = new Set([
  '_id', '_key', '_ref', '_rev', '_type', '_createdAt', '_updatedAt', '_weak', '_strengthenOnPublish',
  'options', 'markDefs', 'marks', 'style', 'listItem', 'level', 'asset', 'crop', 'hotspot', 'image', 'icon', 'media',
  'colorTheme', 'containerWidth', 'alignment', 'textAlign', 'titleAs', 'variant', 'layout', 'theme', 'size',
  'href', 'url', 'link', 'internal', 'external', 'slug', 'anchor', 'formId', 'embed', 'video', 'isHeaderTransparent',
  'stickyButtonHidden', 'pageType', 'submenu', 'metadata', 'seo',
])

// Layout sizing keys vary per breakpoint (gapMobile, sizeTablet, ...).
const SKIP_KEY_PATTERN = /^(gap|size|spacing|ratio|width|height|columns|padding|margin|offset)/i

const client = getCliClient({apiVersion: '2026-09-01'}).withConfig({dataset: 'pagepro'})

/** Words in reading order: Portable Text blocks become paragraphs, other strings their own lines. */
function textOf(value, out = []) {
  if (typeof value === 'string') {
    const s = value.trim()
    // Skip enum-like tokens ("xxl", "light", "h1") that slipped past SKIP_KEYS.
    // Also skip CSS lengths ("12rem", "8.75") from sizing fields with unpredictable names.
    if (s && (s.includes(' ') || /\d/.test(s) || s.length > 12) && !/^[\d.:]+(rem|em|px|%|vh|vw)?$/.test(s)) out.push(s)
  } else if (Array.isArray(value)) {
    for (const item of value) textOf(item, out)
  } else if (value && typeof value === 'object') {
    // A stat stores its number and label apart; keep them together so "20" stays attached to "TEAM MEMBERS".
    if (value._type === 'stat' && value.label) {
      out.push(`${value.label}: ${value.value ?? ''}${value.superscript ?? ''}`.trim())
      return out
    }
    if (value._type === 'block' && Array.isArray(value.children)) {
      const line = value.children.map((c) => c.text ?? '').join('').trim()
      if (line) out.push(value.listItem ? `- ${line}` : line)
      return out
    }
    for (const [key, v] of Object.entries(value)) if (!SKIP_KEYS.has(key) && !SKIP_KEY_PATTERN.test(key)) textOf(v, out)
  }
  return out
}

const slugOf = (doc) => doc.metadata?.slug?.current ?? doc.slug?.current ?? ''
const urlOf = (doc) => {
  const slug = slugOf(doc).replace(/^\/+/, '')
  if (doc._type === 'case-study') return `${SITE}/case-studies/${slug}`
  return slug && slug !== 'home' && slug !== '/' ? `${SITE}/${slug}` : `${SITE}/`
}

const docs = await client.fetch(
  `*[_type in ["page", "case-study"] && !(_id in path("drafts.**")) && !(_id in $excluded)]`,
  {excluded: EXCLUDED_PAGES},
)

const tx = client.transaction()
let largest = 0
for (const doc of docs) {
  // Dedupe consecutive repeats (page builders repeat headings in mobile/desktop variants).
  const lines = textOf(doc.sections ?? doc).filter((line, i, all) => line !== all[i - 1])
  const body = lines.join('\n\n')
  largest = Math.max(largest, body.length)
  tx.createOrReplace({
    _id: `kbSource.${doc._id}`,
    _type: 'kbSource',
    title: doc.metadata?.title ?? doc.title,
    url: urlOf(doc),
    kind: doc._type === 'case-study' ? 'case study' : 'page',
    description: doc.metadata?.description ?? null,
    body,
    sourceId: doc._id,
  })
}
await tx.commit()
console.log(`wrote ${docs.length} kbSource documents · largest body ${largest} chars`)
