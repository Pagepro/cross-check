import { HelpCircleIcon } from "@sanity/icons/HelpCircle";
import { defineField, defineType } from "sanity";

/**
 * Multi-step questionnaire section (phase 3C Task 4).
 *
 * Source: the `questionnaireForm` blok (1 published instance, story
 * `services/custom-cms-development`, `organisms/forms/QuestionnaireForm/*`).
 * The blok declares exactly ONE field — `agreement` — and everything else the
 * form needs is hard-coded in the source component.
 *
 * The 13 steps are deliberately NOT schema fields (ruling R-3C-7 / P3C-2): the
 * source hard-codes them in `QuestionnaireForm/utils.ts:5-307` and its API
 * re-derives the SAME list to validate the answers
 * (`api/questionnaire/consts.ts:22-30`). Putting them in the CMS would create a
 * second source of truth that the `/api/questionnaire` validator could silently
 * disagree with — every mismatch a 400 the visitor cannot act on. They live in
 * `web/src/lib/forms/questionnaire-steps.ts` instead, where both the zod factory
 * and the wizard read them.
 *
 * Attachments are forwarded to the delivery target and never stored here: at
 * most 5 files, 4 MB each (spec B4 / NO-20), enforced identically by the client
 * and by the route because both read the same three constants.
 *
 * Ruling P3A-2: the colour band, vertical rhythm, dividers and anchor id belong
 * to the `section-options` wrapper — this section adds none of them.
 */
export default defineType({
  name: "questionnaire-form",
  title: "Questionnaire",
  icon: HelpCircleIcon,
  type: "object",
  groups: [{ name: "content", default: true }, { name: "options" }],
  fields: [
    defineField({
      name: "options",
      title: "Section options",
      type: "section-options",
      group: "options",
    }),
    defineField({
      name: "pretitle",
      title: "Tagline",
      description: "Short uppercase label above the heading, e.g. “CMS audit”.",
      type: "string",
      group: "content",
    }),
    defineField({
      name: "content",
      title: "Heading and intro",
      description:
        "The section's own heading and the copy above the wizard. The 13 questions themselves are NOT editable here — they are code, kept in step with the answer validator (see web/src/lib/forms/questionnaire-steps.ts).",
      type: "simpleRichText",
      group: "content",
    }),
    defineField({
      name: "agreement",
      title: "Consent statement",
      description:
        "The copy beside the consent checkbox on the final contact step. Required: the visitor cannot submit without ticking it.",
      type: "simpleRichText",
      group: "content",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "submitLabel",
      title: "Submit button label",
      description: "Shown on the last step (source literal, `index.tsx:223`).",
      type: "string",
      group: "content",
      initialValue: "Submit",
    }),
    defineField({
      name: "nextLabel",
      title: "Next button label",
      description: "Shown on every step but the last (source literal, `index.tsx:225`).",
      type: "string",
      group: "content",
      initialValue: "Next",
    }),
    defineField({
      name: "previousLabel",
      title: "Previous button label",
      description:
        "Shown from the second step onwards (source literal, `index.tsx:217`).",
      type: "string",
      group: "content",
      initialValue: "Previous",
    }),
    defineField({
      name: "successMessage",
      title: "Success message",
      description:
        "Shown in place of the wizard after a successful submission (source default, `index.tsx:53`).",
      type: "text",
      rows: 2,
      group: "content",
      initialValue: "Thank you! Your questionnaire has been submitted successfully.",
    }),
  ],
  preview: {
    select: { pretitle: "pretitle", submitLabel: "submitLabel" },
    prepare: ({ pretitle, submitLabel }) => ({
      title: "Questionnaire",
      subtitle: [pretitle, "13 steps", submitLabel].filter(Boolean).join(" — "),
    }),
  },
  initialValue: {
    submitLabel: "Submit",
    nextLabel: "Next",
    previousLabel: "Previous",
    successMessage: "Thank you! Your questionnaire has been submitted successfully.",
  },
});
