'use client'

import {DocumentsIcon} from '@sanity/icons/Documents'
import {SplitHorizontalIcon} from '@sanity/icons/SplitHorizontal'
import {LaunchIcon} from '@sanity/icons/Launch'
import {Badge, Box, Button, Card, Flex, Grid, Heading, Spinner, Stack, Text} from '@sanity/ui'
import {useCallback, useEffect, useMemo, useState} from 'react'
import {definePlugin, useClient} from 'sanity'
import {IntentLink, route} from 'sanity/router'

import {DRIFT_VERDICTS, type DriftVerdict} from '../../lib/probe/drift'
import {DifferenceTool} from './difference'

type DriftLink = {questionNumber: number; verdict: DriftVerdict}

type Finding = {
  _id: string
  questionText: string
  category?: string
  verdict: 'gap' | 'ambiguity' | 'contradiction' | 'covered'
  priority?: 'high' | 'medium' | 'low'
  headline?: string
  explanation?: string
  suggestedFix?: string
  siteAnswer?: string
  siteFound?: boolean
  siteCitations?: {title?: string; url?: string}[]
  salesEvidence?: {quote?: string; client?: string; date?: string}[]
  retrievalCheck?: {searches?: string[]; pageTextHits?: string[]}
  review?: string
  duplicateOf?: string
  drift?: DriftLink
  alsoAskedAs?: {_id: string; questionText: string; number?: number; drift?: DriftLink}[]
}

const GROUPS = [
  {verdict: 'contradiction', title: 'Contradictions', tone: 'critical'},
  {verdict: 'gap', title: 'Gaps', tone: 'caution'},
  {verdict: 'ambiguity', title: 'Ambiguities', tone: 'primary'},
  // Shown last so the probe's "nothing wrong here" calls get reviewed too.
  {verdict: 'covered', title: 'Covered', tone: 'positive'},
] as const

const PRIORITY_RANK = {high: 0, medium: 1, low: 2} as const

/** Agent answers come as light Markdown: render **bold** and drop other markers. */
function Prose({text}: {text: string}) {
  return (
    <>
      {text
        .replace(/^#+\s*/gm, '')
        .split(/(\*\*[^*]+\*\*)/g)
        .map((part, i) => (part.startsWith('**') && part.endsWith('**') ? <strong key={i}>{part.slice(2, -2)}</strong> : part))}
    </>
  )
}

// The same question's row in the latest Answer drift run, if it was checked there (gaps never are).
const DRIFT = `*[_type == "comparison" && question._ref == ^.question._ref
  && runId == *[_type == "comparison" && defined(runId)] | order(runAt desc)[0].runId][0]{questionNumber, verdict}`

const QUERY = `*[_type == "finding"]{
  _id, questionText, category, verdict, priority, headline, explanation, suggestedFix,
  siteAnswer, siteFound, siteCitations, salesEvidence, retrievalCheck, review, "duplicateOf": duplicateOf._ref,
  "drift": ${DRIFT},
  "alsoAskedAs": *[_type == "finding" && duplicateOf._ref == ^._id]{_id, questionText, "number": question->number, "drift": ${DRIFT}}
}`

/** Opens the question in the Answer drift tab: does the fact reach buyers who ask an AI assistant? */
function DriftLinkText({drift}: {drift?: DriftLink}) {
  if (!drift?.questionNumber) return null
  return (
    <Text size={1}>
      <IntentLink intent="drift" params={{question: String(drift.questionNumber)}}>
        Answer drift: {DRIFT_VERDICTS.find((v) => v.value === drift.verdict)?.title ?? drift.verdict} →
      </IntentLink>
    </Text>
  )
}

function Column({title, children}: {title: string; children: React.ReactNode}) {
  return (
    <Card padding={4} radius={2} border tone="transparent">
      <Stack gap={4}>
        <Text size={1} weight="semibold" muted style={{textTransform: 'uppercase', letterSpacing: '0.04em'}}>
          {title}
        </Text>
        {children}
      </Stack>
    </Card>
  )
}

function FindingDetail({finding, onReview}: {finding: Finding; onReview: (id: string, review: string) => void}) {
  const group = GROUPS.find((g) => g.verdict === finding.verdict)
  return (
    <Stack gap={5}>
      <Stack gap={3}>
        <Flex gap={2} align="center" wrap="wrap">
          <Badge tone={group?.tone}>{group?.title === 'Covered' ? 'Covered' : group?.title.replace(/ies$/, 'y').replace(/s$/, '')}</Badge>
          {finding.priority ? <Badge tone={finding.priority === 'high' ? 'critical' : 'default'}>{finding.priority} priority</Badge> : null}
          {finding.category ? <Badge>{finding.category}</Badge> : null}
        </Flex>
        <Heading size={1} as="h2">{finding.headline ?? finding.questionText}</Heading>
        {finding.explanation ? <Text muted>{finding.explanation}</Text> : null}
      </Stack>

      <Grid gridTemplateColumns={[1, 1, 3]} gap={3}>
        <Column title="Buyers ask">
          <Text size={2}>“{finding.questionText}”</Text>
          <DriftLinkText drift={finding.drift} />
          {finding.alsoAskedAs?.length ? (
            <Stack gap={2}>
              <Text size={1} muted>
                Also asked as:
              </Text>
              {finding.alsoAskedAs.map((d) => (
                <Stack key={d._id} gap={2}>
                  <Text size={1}>
                    “{d.questionText}”{d.number ? ` (#${d.number})` : ''}
                  </Text>
                  <DriftLinkText drift={d.drift} />
                </Stack>
              ))}
            </Stack>
          ) : null}
        </Column>
        <Column title="The site says">
          <Text size={2} style={{whiteSpace: 'pre-line'}}>
            {finding.siteFound === false ? 'Nothing. The Knowledge Base has no answer.' : <Prose text={finding.siteAnswer ?? ''} />}
          </Text>
          {finding.siteCitations?.length ? (
            <Stack gap={2}>
              {finding.siteCitations.map((c) => (
                <Text key={c.url} size={1}>
                  <a href={c.url} target="_blank" rel="noreferrer">
                    {c.title ?? c.url} <LaunchIcon />
                  </a>
                </Text>
              ))}
            </Stack>
          ) : null}
        </Column>
        <Column title="We told clients">
          {finding.salesEvidence?.length ? (
            <Stack gap={4}>
              {finding.salesEvidence.map((e, i) => (
                <Stack key={i} gap={2}>
                  <Text size={2}>“{e.quote}”</Text>
                  <Text size={1} muted>
                    {[e.client, e.date].filter(Boolean).join(' · ')}
                  </Text>
                </Stack>
              ))}
            </Stack>
          ) : (
            <Text size={2} muted>
              No sales answer on record.
            </Text>
          )}
        </Column>
      </Grid>

      {finding.suggestedFix ? (
        <Card padding={4} radius={2} tone="positive" border>
          <Stack gap={3}>
            <Text size={1} weight="semibold">
              Suggested fix
            </Text>
            <Text size={2}>{finding.suggestedFix}</Text>
          </Stack>
        </Card>
      ) : null}

      {finding.verdict === 'gap' && finding.retrievalCheck?.searches?.length ? (
        <Text size={1} muted>
          Checked before filing: {finding.retrievalCheck.searches.join(' · ')}
          {finding.retrievalCheck.pageTextHits?.length ? ` · page text matched on ${finding.retrievalCheck.pageTextHits.join(', ')}` : ' · no page text matched'}
        </Text>
      ) : null}

      <Flex gap={2} align="center" wrap="wrap">
        <Text size={1} muted>
          Is this real?
        </Text>
        {[
          {value: 'true', text: 'Yes', tone: 'positive'},
          {value: 'false-retrieval', text: 'No: the site does answer it', tone: 'critical'},
          {value: 'false-other', text: 'No: other reason', tone: 'caution'},
        ].map((b) => (
          <Button
            key={b.value}
            text={b.text}
            mode={finding.review === b.value ? 'default' : 'ghost'}
            tone={b.tone as 'positive' | 'critical' | 'caution'}
            fontSize={1}
            padding={2}
            onClick={() => onReview(finding._id, b.value)}
          />
        ))}
        <IntentLink intent="edit" params={{id: finding._id, type: 'finding'}} style={{marginLeft: 'auto', fontSize: 13}}>
          Open document
        </IntentLink>
      </Flex>
    </Stack>
  )
}

function AuditTool() {
  const client = useClient({apiVersion: '2026-09-01'})
  const [findings, setFindings] = useState<Finding[] | null>(null)
  const [selected, setSelected] = useState<string>()

  const load = useCallback(() => client.fetch<Finding[]>(QUERY).then(setFindings), [client])
  useEffect(() => {
    load()
  }, [load])

  const grouped = useMemo(
    () =>
      GROUPS.map((g) => ({
        ...g,
        items: (findings ?? [])
          // A duplicate shows under the finding it repeats, not as its own card.
          .filter((f) => f.verdict === g.verdict && !f.duplicateOf)
          .toSorted((a, b) => PRIORITY_RANK[a.priority ?? 'low'] - PRIORITY_RANK[b.priority ?? 'low']),
      })),
    [findings],
  )

  const shown = (findings ?? []).filter((f) => !f.duplicateOf)
  const reviewed = shown.filter((f) => f.review && f.review !== 'unreviewed')
  const real = reviewed.filter((f) => f.review === 'true').length
  const current = findings?.find((f) => f._id === selected) ?? grouped.find((g) => g.items.length)?.items[0]

  const onReview = async (id: string, review: string) => {
    setFindings((all) => all?.map((f) => (f._id === id ? {...f, review} : f)) ?? null)
    await client.patch(id).set({review}).commit()
  }

  if (!findings) {
    return (
      <Flex padding={6} justify="center">
        <Spinner />
      </Flex>
    )
  }

  return (
    <Flex height="fill" style={{minHeight: 0}}>
      <Card borderRight style={{width: 320, flexShrink: 0, overflowY: 'auto'}}>
        <Stack padding={4} gap={5}>
          <Stack gap={2}>
            <Heading size={1}>Content audit</Heading>
            <Text size={1} muted>
              {shown.length} findings · reviewed {reviewed.length}, {real} confirmed
            </Text>
          </Stack>
          {grouped.map((g) => (
            <Stack key={g.verdict} gap={2}>
              <Flex align="center" gap={2}>
                <Text size={1} weight="semibold">
                  {g.title}
                </Text>
                <Badge tone={g.tone}>{g.items.length}</Badge>
              </Flex>
              {g.items.map((f) => (
                <Card
                  key={f._id}
                  as="button"
                  padding={3}
                  radius={2}
                  tone={current?._id === f._id ? 'primary' : 'default'}
                  onClick={() => setSelected(f._id)}
                  style={{textAlign: 'left', cursor: 'pointer'}}
                >
                  <Stack gap={2}>
                    <Text size={1} weight="medium">
                      {f.headline ?? f.questionText}
                    </Text>
                    <Text size={0} muted>
                      {[f.priority && `${f.priority} priority`, f.category, f.review && f.review !== 'unreviewed' && `reviewed: ${f.review}`]
                        .filter(Boolean)
                        .join(' · ')}
                    </Text>
                  </Stack>
                </Card>
              ))}
            </Stack>
          ))}
        </Stack>
      </Card>
      <Box flex={1} padding={5} style={{overflowY: 'auto'}}>
        {current ? (
          <FindingDetail finding={current} onReview={onReview} />
        ) : (
          <Text muted>No findings yet. Run the probe to fill this list.</Text>
        )}
      </Box>
    </Flex>
  )
}

export const auditTool = definePlugin({
  name: 'content-audit',
  tools: [
    {name: 'content-audit', title: 'Content audit', icon: DocumentsIcon, component: AuditTool},
    {
      name: 'answer-drift',
      title: 'Answer drift',
      icon: SplitHorizontalIcon,
      component: DifferenceTool,
      router: route.create('/', [route.create('/:question')]),
      canHandleIntent: (intent, params) => intent === 'drift' && Boolean(params.question),
      getIntentState: (_intent, params) => ({question: params.question}),
    },
  ],
})
