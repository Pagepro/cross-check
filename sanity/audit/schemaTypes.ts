import {defineArrayMember, defineField, defineType} from 'sanity'

import {DRIFT_VERDICTS} from '../../lib/probe/drift'

// Cross-Check: what the Pagepro site says (Knowledge Base) vs what buyers ask and what sales told them.

export const VERDICTS = [
  {title: 'Gap — the site does not answer it', value: 'gap'},
  {title: 'Ambiguity — the site answers it two ways', value: 'ambiguity'},
  {title: 'Contradiction — the site and sales disagree', value: 'contradiction'},
  {title: 'Covered — the site answers it consistently', value: 'covered'},
]

export const kbSource = defineType({
  name: 'kbSource',
  title: 'KB source page',
  type: 'document',
  readOnly: true,
  fields: [
    defineField({name: 'title', type: 'string'}),
    defineField({name: 'url', type: 'url'}),
    defineField({name: 'kind', type: 'string'}),
    defineField({name: 'description', type: 'text', rows: 2}),
    defineField({name: 'body', type: 'text', rows: 20}),
    defineField({name: 'sourceId', title: 'Original document id', type: 'string'}),
  ],
  preview: {select: {title: 'title', subtitle: 'url'}},
})

export const buyerQuestion = defineType({
  name: 'buyerQuestion',
  title: 'Buyer question',
  type: 'document',
  fields: [
    defineField({name: 'number', type: 'number'}),
    defineField({name: 'category', type: 'string'}),
    defineField({name: 'question', type: 'text', rows: 2}),
    defineField({name: 'priorLabel', type: 'string', description: 'Label from the question corpus, before the site was checked'}),
    defineField({name: 'inSample', type: 'boolean', description: 'One of the questions run through the probe'}),
    defineField({
      name: 'siteCoverage',
      type: 'string',
      readOnly: true,
      options: {list: ['yes', 'partly', 'no']},
      description: 'Does the site answer it? Measured by npm run coverage',
    }),
    defineField({name: 'siteCoverageReason', type: 'string', readOnly: true}),
    defineField({name: 'siteCoverageAnswer', type: 'text', rows: 3, readOnly: true}),
    defineField({name: 'siteCoverageCitations', type: 'array', of: [{type: 'url'}], readOnly: true}),
    defineField({name: 'siteCoverageCheckedAt', type: 'datetime', readOnly: true}),
  ],
  preview: {
    select: {title: 'question', number: 'number', category: 'category', coverage: 'siteCoverage'},
    prepare: ({title, number, category, coverage}) => ({
      title,
      subtitle: [`#${number ?? '?'}`, category, coverage && `site answers it: ${coverage}`].filter(Boolean).join(' · '),
    }),
  },
})

export const salesAnswer = defineType({
  name: 'salesAnswer',
  title: 'Sales answer',
  type: 'document',
  fields: [
    defineField({name: 'topic', type: 'string'}),
    defineField({name: 'client', type: 'string', description: 'Anonymised, e.g. "Client AM"'}),
    defineField({name: 'date', type: 'string'}),
    defineField({name: 'text', type: 'text', rows: 4, description: 'What we told the client, as written'}),
  ],
  preview: {
    select: {title: 'text', topic: 'topic', client: 'client', date: 'date'},
    prepare: ({title, topic, client, date}) => ({title, subtitle: [topic, client, date].filter(Boolean).join(' · ')}),
  },
})

export const finding = defineType({
  name: 'finding',
  title: 'Finding',
  type: 'document',
  fields: [
    defineField({name: 'question', type: 'reference', to: [{type: 'buyerQuestion'}]}),
    defineField({name: 'questionText', type: 'string'}),
    defineField({name: 'category', type: 'string'}),
    defineField({name: 'verdict', type: 'string', options: {list: VERDICTS, layout: 'radio'}}),
    defineField({name: 'priority', type: 'string', options: {list: ['high', 'medium', 'low']}, description: 'How close the question sits to money'}),
    defineField({name: 'headline', type: 'string', description: 'One line an editor reads in the list'}),
    defineField({name: 'explanation', type: 'text', rows: 3}),
    defineField({name: 'suggestedFix', type: 'text', rows: 3}),
    defineField({name: 'siteAnswer', type: 'text', rows: 4, description: 'What the Knowledge Base agent answered'}),
    defineField({name: 'siteFound', type: 'boolean'}),
    defineField({
      name: 'siteCitations',
      type: 'array',
      of: [defineArrayMember({type: 'object', name: 'citation', fields: [{name: 'title', type: 'string'}, {name: 'url', type: 'url'}]})],
    }),
    defineField({
      name: 'salesEvidence',
      title: 'What we told clients',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'evidence',
          fields: [
            {name: 'answer', type: 'reference', to: [{type: 'salesAnswer'}]},
            {name: 'quote', type: 'text', rows: 2},
            {name: 'client', type: 'string'},
            {name: 'date', type: 'string'},
          ],
          preview: {select: {title: 'quote', subtitle: 'client'}},
        }),
      ],
    }),
    defineField({
      name: 'retrievalCheck',
      type: 'object',
      description: 'A "gap" is only filed after the page text itself was searched too',
      fields: [
        {name: 'searches', type: 'array', of: [{type: 'string'}]},
        {name: 'pageTextHits', type: 'array', of: [{type: 'string'}], description: 'Pages whose text matched'},
        {name: 'verdictChanged', type: 'boolean'},
      ],
    }),
    defineField({
      name: 'review',
      type: 'string',
      options: {list: ['unreviewed', 'true', 'false-retrieval', 'false-other'], layout: 'radio'},
      initialValue: 'unreviewed',
    }),
    defineField({name: 'runId', type: 'string', readOnly: true}),
    defineField({
      name: 'duplicateOf',
      type: 'reference',
      to: [{type: 'finding'}],
      description: 'Same problem as another finding, raised by a different buyer question. Shown under that one, not on its own.',
    }),
  ],
  preview: {
    select: {title: 'headline', verdict: 'verdict', q: 'questionText', priority: 'priority'},
    prepare: ({title, verdict, q, priority}) => ({title: title ?? q, subtitle: [verdict, priority].filter(Boolean).join(' · ')}),
  },
})

const GRADES = ['correct', 'evasive', 'wrong']

export const comparison = defineType({
  name: 'comparison',
  title: 'Answer drift',
  type: 'document',
  description: 'One buyer question answered three ways: the model alone, the model with web search, our agent with the Knowledge Base',
  fields: [
    defineField({name: 'runId', type: 'string', readOnly: true, description: 'Batch run this belongs to; the tab shows the latest'}),
    defineField({name: 'runAt', type: 'datetime', readOnly: true}),
    defineField({name: 'order', type: 'number'}),
    defineField({name: 'question', type: 'reference', to: [{type: 'buyerQuestion'}]}),
    defineField({name: 'questionNumber', type: 'number'}),
    defineField({name: 'questionText', type: 'string'}),
    defineField({
      name: 'verdict',
      type: 'string',
      options: {list: DRIFT_VERDICTS.map((v) => ({title: v.title, value: v.value})), layout: 'radio'},
    }),
    defineField({name: 'priority', type: 'string', options: {list: ['high', 'medium', 'low']}}),
    defineField({name: 'alone', title: 'Model alone', type: 'text', rows: 4}),
    defineField({name: 'aloneGrade', type: 'string', options: {list: GRADES}}),
    defineField({name: 'aloneGradeReason', type: 'string'}),
    defineField({name: 'withSearch', title: 'Model with web search', type: 'text', rows: 4}),
    defineField({name: 'withSearchGrade', type: 'string', options: {list: GRADES}}),
    defineField({name: 'withSearchGradeReason', type: 'string'}),
    defineField({name: 'searchSources', type: 'array', of: [{type: 'url'}]}),
    defineField({name: 'withKb', title: 'Agent with the Knowledge Base', type: 'text', rows: 4}),
    defineField({name: 'kbConflicted', type: 'boolean', description: 'The Knowledge Base entries disagree with each other on this'}),
    defineField({
      name: 'citations',
      type: 'array',
      of: [defineArrayMember({type: 'object', name: 'citation', fields: [{name: 'title', type: 'string'}, {name: 'url', type: 'url'}]})],
    }),
    defineField({
      name: 'suggestedFix',
      type: 'text',
      rows: 3,
      description: 'What to change on the site so the fact reaches buyers. Written by npm run stage4 or npm run stage4:recommend',
    }),
    defineField({name: 'model', type: 'string', readOnly: true}),
    // Superseded by `alone` and the verdict; kept so the first two-column run still opens.
    defineField({name: 'withoutKb', type: 'text', hidden: true}),
    defineField({name: 'withoutKbLabel', type: 'string', hidden: true}),
    defineField({name: 'askedAt', type: 'datetime', hidden: true}),
  ],
  preview: {
    select: {title: 'questionText', legacy: 'question', verdict: 'verdict', runAt: 'runAt'},
    prepare: ({title, verdict, runAt}) => ({
      title: title ?? 'Comparison',
      subtitle: [DRIFT_VERDICTS.find((v) => v.value === verdict)?.title, runAt?.slice(0, 10)].filter(Boolean).join(' · '),
    }),
  },
})

export const auditSchemaTypes = [finding, buyerQuestion, salesAnswer, kbSource, comparison]
