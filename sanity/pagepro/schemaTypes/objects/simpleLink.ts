import { VscLink } from "react-icons/vsc";
import { defineType } from "sanity";

import resolveSlug from "@/sanity/pagepro/lib/resolveSlug";

import { linkBaseFields, linkBasePreviewSelect } from "../partials/linkBaseSchema";

import { LinkAnnotation } from "./richText/components";

export default defineType({
  name: "simpleLink",
  title: "Link",
  icon: VscLink,
  type: "object",
  fields: [
    ...linkBaseFields,
    /* Contact route contract C5 — the source rich-text link's `target="_blank"`
       (251 of the snapshot's rich-text links; /contact's Privacy Policy). */
    {
      name: "openInNewTab",
      title: "Open in a new tab",
      type: "boolean",
      initialValue: false,
    },
  ],
  /* Rich-text editor preview of the source link rule (Task 1 fix round 1, M3). */
  components: { annotation: LinkAnnotation },
  preview: {
    select: linkBasePreviewSelect,
    prepare: ({ type, internal, params, external, fileLabel, fileOriginalFilename }) => ({
      title: "Link",
      subtitle: resolveSlug({
        type,
        internal,
        params,
        external,
        fileLabel,
        fileOriginalFilename,
      }),
    }),
  },
});
