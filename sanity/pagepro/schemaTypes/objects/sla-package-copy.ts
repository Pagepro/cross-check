import { VscCreditCard } from "react-icons/vsc";
import { defineField, defineType } from "sanity";

import { getBlockText } from "@/sanity/pagepro/lib/utils";
import { listBlock } from "@/sanity/pagepro/schemaTypes/objects/richText/list-block";

/**
 * The editorial copy for ONE SLA tier (phase 3C Task 5).
 *
 * The tier itself — its name, its monthly price in each of the three
 * currencies, its included hours, its CTA label and whether it is the "Most
 * popular" one — is CODE, not content: `web/src/ui/sections/SlaPackages/data.ts`,
 * transcribed from the source's own `organisms/SlaPackages/consts.ts:14-72`,
 * whose header already said so ("Prices are code-controlled (not CMS-editable)
 * by design"). Ruling P3C-2 keeps it that way.
 *
 * So an entry here is a JOIN: `tier` names which code-owned tier this copy
 * belongs to, and the two copy fields are everything Storyblok actually held
 * (`slaPackages.{maintain,evolve,accelerate}Description` / `…Features` and
 * `slaPackages.{care,custom}Description`). This mirrors the source's own prop
 * shape, a `Record<tierKey, copy>` (`SlaPackages/types.ts:43-49`).
 */
export default defineType({
  name: "slaPackageCopy",
  title: "Package copy",
  icon: VscCreditCard,
  type: "object",
  fields: [
    defineField({
      name: "tier",
      title: "Tier",
      description:
        "Which code-owned tier this copy belongs to. The name, price, hours, CTA label and the “Most popular” flag all come from `web/src/ui/sections/SlaPackages/data.ts` — only the two fields below are editable here.",
      type: "string",
      options: {
        list: [
          { title: "Care — entry", value: "care" },
          { title: "Maintain", value: "maintain" },
          { title: "Evolve", value: "evolve" },
          { title: "Accelerate", value: "accelerate" },
          { title: "Custom — enterprise", value: "custom" },
        ],
      },
      validation: (Rule) =>
        Rule.required().error(
          "Without a tier this copy has nothing to attach to and the card renders from the code constants alone.",
        ),
    }),
    defineField({
      name: "tagline",
      title: "Tagline",
      description:
        "One line under the tier name, on the three featured cards (source `{tier}Description`, e.g. “Healthy, current, and steadily moving forward.”).",
      type: "text",
      rows: 2,
      validation: (Rule) => Rule.max(160).warning("Keep the tagline to one line."),
    }),
    defineField({
      name: "body",
      title: "Body",
      description:
        "The feature list on a featured tier (source `{tier}Features` — a bullet list) or the short blurb on the Care / Custom entry cards (source `{tier}Description` — paragraphs).",
      type: "array",
      /* `listBlock()` (ruling P3A-57 / R-3B-9), not `simpleRichText`: the
         featured tiers' source copy IS a bullet list and `simpleRichText`
         declares `lists: []`. Same projection either way — `SIMPLE_RICHTEXT_QUERY`
         covers a block-only array (`tabs`, `timeline`, `offices` do the same). */
      of: [listBlock()],
    }),
  ],
  preview: {
    select: { tier: "tier", tagline: "tagline", body: "body" },
    prepare: ({ tier, tagline, body }) => ({
      title: tier ? tier.charAt(0).toUpperCase() + tier.slice(1) : "Package copy",
      subtitle: tagline || getBlockText(body) || "No copy yet",
    }),
  },
});
