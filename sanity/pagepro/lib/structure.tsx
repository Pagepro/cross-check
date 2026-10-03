"use client";

import { EyeOpenIcon } from "@sanity/icons/EyeOpen";
import { IconType } from "react-icons/lib";
import { VscGlobe } from "react-icons/vsc";
import { type PortableTextTextBlock, type SanityDocument } from "sanity";
import { useRouter } from "sanity/router";
import { type StructureBuilder } from "sanity/structure";

// Local minimal type – avoids importing from the app package
type Metadata = { slug?: { current?: string | null } | null } | null;

type DocumentDisplayed = Partial<SanityDocument> & {
  metadata?: Metadata;
  slug?: { current?: string | null } | null;
  title?: string | PortableTextTextBlock[];
  name?: string;
};

type SlugResolver = (document: DocumentDisplayed) => string | undefined;

const parseSlug = (slug: string | undefined) => {
  if (!slug || slug === "/") return "/";

  return slug;
};

const metadataSlugResolver: SlugResolver = (document) =>
  document.metadata?.slug?.current ?? undefined;

const metadataSlugWithPrefixResolver =
  (prefix: string): SlugResolver =>
  (document) => {
    const slug = document.metadata?.slug?.current;
    return slug ? `${prefix}/${slug}` : undefined;
  };

const fixedSlugResolver =
  (fixedSlug: string): SlugResolver =>
  () =>
    fixedSlug;

/**
 * Creates the "Open In Visual Editor" and "Open on the Website" view tabs
 * for use in any document structure item.
 */
const createPreviewViews = (S: StructureBuilder, resolveSlug: SlugResolver) => {
  const handleRedirect = (document: { displayed: DocumentDisplayed }) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const router = useRouter();

    const slug = resolveSlug(document.displayed);
    const id = document.displayed._id;
    const documentType = document.displayed._type;

    if (!slug) {
      return <div>Please set a slug to enable preview</div>;
    }

    const url = new URL(`/admin/editor/${documentType}/${id}`, window.location.origin);

    url.searchParams.append("preview", parseSlug(slug));
    router.navigateUrl({ path: url.toString() });

    return <div>Opening a Visual Editor... Please wait...</div>;
  };

  const handleRedirectOutside = (document: { displayed: DocumentDisplayed }) => {
    const slug = resolveSlug(document.displayed);

    if (!slug) {
      return <div>Please set a slug to enable preview [Metadata -&gt; Slug]</div>;
    }

    window.open(`${window.location.origin}/${parseSlug(slug)}`, "_blank");

    return <div>Your page should be opened in a new tab...</div>;
  };

  return [
    S.view.form(),
    S.view
      .component(({ document }) => handleRedirect(document))
      .title("Open In Visual Editor")
      .icon(EyeOpenIcon),
    S.view
      .component(({ document }) => handleRedirectOutside(document))
      .title("Open on the Website")
      .icon(VscGlobe),
  ];
};

export const createDocumentListWithPreview = (
  S: StructureBuilder,
  {
    title,
    type,
    icon,
  }: {
    title: string;
    type: string;
    icon: React.ReactNode | IconType;
  },
) => {
  return S.listItem()
    .title(title)
    .icon(icon)
    .child(
      S.documentTypeList(type)
        .title(title)
        .apiVersion("v2024-10-28")
        .child((documentId) =>
          S.document()
            .documentId(documentId)
            .schemaType(type)
            .views(createPreviewViews(S, metadataSlugResolver)),
        ),
    );
};

/**
 * Creates a document list where detail pages live under a URL prefix.
 * E.g. case-study documents at /case-studies/:slug
 */
export const createDocumentListWithSlugPrefix = (
  S: StructureBuilder,
  {
    title,
    type,
    slugPrefix,
  }: {
    title: string;
    type: string;
    slugPrefix: string;
  },
) => {
  return S.documentTypeList(type)
    .title(title)
    .apiVersion("v2024-10-28")
    .child((documentId) =>
      S.document()
        .documentId(documentId)
        .schemaType(type)
        .views(createPreviewViews(S, metadataSlugWithPrefixResolver(slugPrefix))),
    );
};

/**
 * Creates a singleton document editor with preview views for a fixed URL.
 * E.g. case-studies-listing-page always previews at /case-studies
 */
export const createSingletonWithPreview = (
  S: StructureBuilder,
  {
    id,
    schemaType,
    title,
    icon,
    previewSlug,
  }: {
    id: string;
    schemaType: string;
    title: string;
    icon: React.ReactNode | IconType;
    previewSlug: string;
  },
) => {
  return S.listItem()
    .id(id)
    .title(title)
    .icon(icon)
    .child(
      S.document()
        .id(id)
        .schemaType(schemaType)
        .documentId(id)
        .views(createPreviewViews(S, fixedSlugResolver(previewSlug))),
    );
};
