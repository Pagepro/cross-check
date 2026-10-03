import { VscRobot } from "react-icons/vsc";
import { defineField, defineType } from "sanity";

import { AGENT_SKILL_SLUG_MESSAGE, isAgentSkillSlug } from "@/sanity/pagepro/lib/agentSkillSlug";

/**
 * A machine-readable "agent skill" published under `/.well-known/agent-skills`
 * (spec §4 AI-agent discovery, `:147-153`).
 *
 * In the source this was a Storyblok `agentSkill` blok read at BUILD time by
 * `apps/site/scripts/generate-agent-skills.js`, which wrote `index.json` plus one
 * `SKILL.md` per skill into `public/`. Here the same two artifacts are served
 * live by read-only route handlers, so publishing a skill in the Studio makes
 * it discoverable without a deploy, and unpublishing 404s its file.
 *
 * The document is deliberately NOT part of the website: it has no HTML page, no
 * `sitemap.ts` entry (its two URLs are agent-facing, not crawl-facing) and it is
 * not internally linkable — no `resolveUrl` branch, no `LINK_QUERY` /
 * `LINK_FRAGMENT` slug projection and no `linkBaseSchema.ts` `to` entry. A
 * `presentation.ts` `locations` entry DOES exist, because unlike `job-override`
 * this document's slug is the whole path, so both served URLs resolve from the
 * document alone.
 */
export default defineType({
  name: "agent-skill",
  title: "Agent skill",
  icon: VscRobot,
  type: "document",
  groups: [{ name: "content", title: "Content", default: true }],
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      group: "content",
      description:
        "Internal label for this skill in the Studio list. It is never published — the frontmatter carries the slug and the description, not this.",
      validation: (Rule) => Rule.required().error("An agent skill needs a title."),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      group: "content",
      options: { source: "title", maxLength: 96 },
      description:
        "URL-safe id — lower-case letters, digits and single hyphens. It appears verbatim as `name:` in the skill's frontmatter and in /.well-known/agent-skills/{slug}/SKILL.md, so changing it changes a published URL.",
      /* Ruling P3D-23. The charset is enforced, not assumed: the Generate
         button's slugify runs only when an editor presses it, and an imported
         or API-written document never sees a widget at all. Same
         `Rule.custom`-on-a-slug shape as `job-override.jobSlug`. The predicate
         is shared with the unit test (`studio/src/sanity/lib/agentSkillSlug`),
         and the two published surfaces defend themselves independently — the
         composer JSON-quotes the name and the index `encodeURIComponent`s the
         URL segment — so this rule is the first line, not the only one. */
      validation: (Rule) =>
        Rule.required()
          .error("An agent skill needs a slug.")
          .custom((value) =>
            !value?.current || isAgentSkillSlug(value.current)
              ? true
              : AGENT_SKILL_SLUG_MESSAGE,
          ),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 3,
      group: "content",
      description:
        "One or two sentences telling an agent what this skill is for. Published in both the index and the SKILL.md frontmatter.",
      validation: (Rule) =>
        Rule.required().error(
          "Agent skills are indexed by their description — an empty one makes the skill undiscoverable.",
        ),
    }),
    defineField({
      name: "skillContent",
      title: "Skill content",
      type: "text",
      rows: 24,
      group: "content",
      description:
        "The SKILL.md body, in Markdown. YAML frontmatter is generated — do not write your own.",
      validation: (Rule) => Rule.required().error("An agent skill needs a body."),
    }),
  ],
  preview: {
    select: {
      title: "title",
      slug: "slug.current",
    },
    prepare: ({ title, slug }) => ({
      title: title || slug || "Agent skill",
      subtitle: slug
        ? `/.well-known/agent-skills/${slug}/SKILL.md`
        : "No slug yet — not published",
    }),
  },
});
