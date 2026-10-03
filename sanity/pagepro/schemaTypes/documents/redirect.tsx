import { PiFlowArrow } from "react-icons/pi";
import { defineField, defineType } from "sanity";

import resolveSlug from "@/sanity/pagepro/lib/resolveSlug";

const regex = /^(\/|https?:\/\/)/;

export default defineType({
  name: "redirect",
  title: "Redirect",
  icon: PiFlowArrow,
  type: "document",
  fields: [
    defineField({
      name: "source",
      description: "Redirect from",
      placeholder: "e.g. /old-path, /legacy/:slug",
      type: "string",
      validation: (Rule) => Rule.required().regex(regex),
    }),
    defineField({
      name: "destination",
      description: "Redirect to",
      type: "simpleLink",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "permanent",
      type: "boolean",
      initialValue: true,
      description: (
        <>
          <p>
            If <code>true</code> will use the 301 status code which instructs
            clients/search engines to cache the redirect forever, if <code>false</code>{" "}
            will use the 302 status code which is temporary and is not cached.
          </p>
          <p>
            <a
              href="https://nextjs.org/docs/app/api-reference/next-config-js/redirects"
              target="_blank"
              rel="noopener noreferrer"
            >
              Next.js redirects documentation
            </a>
          </p>
        </>
      ),
    }),
  ],
  preview: {
    select: {
      title: "source",
      type: "destination.type",
      internal: "destination.internal.metadata.slug.current",
      params: "destination.params",
      external: "destination.external",
    },
    prepare: ({ title, type, internal, params, external }) => ({
      title,
      subtitle:
        (external || internal) &&
        `to ${external || resolveSlug({ type, internal, params })}`,
    }),
  },
});
