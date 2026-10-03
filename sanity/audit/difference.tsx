'use client'

import {Badge, Box, Card, Flex, Grid, Heading, Spinner, Stack, Text} from '@sanity/ui'
import {useEffect, useMemo, useState} from 'react'
import {useClient} from 'sanity'
import {useRouter} from 'sanity/router'

import {DRIFT_VERDICTS, type DriftVerdict, type Grade} from '../../lib/probe/drift'

type Comparison = {
  _id: string
  runId: string
  runAt: string
  questionNumber?: number
  questionText: string
  verdict: DriftVerdict
  priority?: string
  alone: string
  aloneGrade: Grade
  aloneGradeReason?: string
  withSearch: string
  withSearchGrade: Grade
  withSearchGradeReason?: string
  searchSources?: string[]
  withKb: string
  kbConflicted?: boolean
  citations?: {title?: string; url?: string}[]
  suggestedFix?: string
  model?: string
}

// Latest batch run only; earlier runs stay in the dataset so a later run can show the content got better.
const QUERY = `*[_type == "comparison" && runId == *[_type == "comparison" && defined(runId)] | order(runAt desc)[0].runId] | order(order asc){
  _id, runId, runAt, questionNumber, questionText, verdict, priority, alone, aloneGrade, aloneGradeReason,
  withSearch, withSearchGrade, withSearchGradeReason, searchSources, withKb, kbConflicted, citations, suggestedFix, model
}`

const VERDICT_TONE: Record<DriftVerdict, 'critical' | 'caution' | 'primary' | 'default' | 'positive'> = {
  'not-communicated': 'critical',
  'world-guesses': 'caution',
  'search-misled': 'primary',
  'stale-priors': 'default',
  aligned: 'positive',
}

/** Agent answers come as light Markdown: render **bold** and drop heading markers. */
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

function chipFor(column: 'alone' | 'search', grade: Grade) {
  if (grade === 'correct') return {text: '✓ matches our content', tone: 'positive' as const}
  if (grade === 'evasive') return {text: '⚠ no real answer', tone: 'caution' as const}
  return column === 'search' ? {text: '⚠ had the site, still wrong', tone: 'critical' as const} : {text: '⚠ confident and untrue', tone: 'critical' as const}
}

function Column({title, chip, tone, text, reason, children}: {title: string; chip: string; tone: 'positive' | 'caution' | 'critical'; text: string; reason?: string; children?: React.ReactNode}) {
  return (
    <Card padding={4} radius={3} tone={tone} border>
      <Stack gap={4}>
        <Stack gap={3}>
          <Text size={1} weight="semibold" muted style={{textTransform: 'uppercase', letterSpacing: '0.04em'}}>
            {title}
          </Text>
          <Box>
            <Badge tone={tone}>{chip}</Badge>
          </Box>
        </Stack>
        <Text size={2} style={{whiteSpace: 'pre-line', lineHeight: 1.5}}>
          <Prose text={text} />
        </Text>
        {children}
        {reason ? (
          <Text size={1} muted>
            {reason}
          </Text>
        ) : null}
      </Stack>
    </Card>
  )
}

const pathOf = (url?: string) => {
  try {
    return url ? new URL(url).pathname : ''
  } catch {
    return url ?? ''
  }
}

function Detail({row}: {row: Comparison}) {
  const verdict = DRIFT_VERDICTS.find((v) => v.value === row.verdict)
  const alone = chipFor('alone', row.aloneGrade)
  const search = chipFor('search', row.withSearchGrade)
  return (
    <Stack gap={5}>
      <Stack gap={3}>
        <Flex gap={2} align="center" wrap="wrap">
          <Badge tone={VERDICT_TONE[row.verdict]}>{verdict?.title}</Badge>
          {row.priority ? <Badge>{row.priority} priority</Badge> : null}
          {row.kbConflicted ? <Badge tone="caution">our content disagrees with itself</Badge> : null}
        </Flex>
        <Heading size={1} as="h2">
          {row.questionText}
          {row.questionNumber ? (
            <Text as="span" size={1} muted>
              {' '}
              · buyer question #{row.questionNumber}
            </Text>
          ) : null}
        </Heading>
        <Text size={1} muted>
          {verdict?.meaning}
        </Text>
      </Stack>
      <Grid gridTemplateColumns={[1, 1, 3]} gap={3}>
        <Column title="Model alone" chip={alone.text} tone={alone.tone} text={row.alone} reason={row.aloneGrade === 'correct' ? undefined : row.aloneGradeReason} />
        <Column title="With web search" chip={search.text} tone={search.tone} text={row.withSearch} reason={row.withSearchGrade === 'correct' ? undefined : row.withSearchGradeReason}>
          {row.searchSources?.length ? (
            <Text size={1} muted>
              Read: {row.searchSources.slice(0, 4).map((u) => new URL(u).hostname + pathOf(u)).join(' · ')}
            </Text>
          ) : null}
        </Column>
        <Column title="Agent with our KB" chip={`✓ ${row.citations?.length ?? 0} ${row.citations?.length === 1 ? 'citation' : 'citations'}`} tone="positive" text={row.withKb}>
          {row.citations?.length ? (
            <Flex gap={3} wrap="wrap">
              {row.citations.map((c) => (
                <Text key={c.url} size={1}>
                  <a href={c.url} target="_blank" rel="noreferrer">
                    {pathOf(c.url) || c.title}
                  </a>
                </Text>
              ))}
            </Flex>
          ) : null}
        </Column>
      </Grid>
      {row.suggestedFix ? (
        <Card padding={4} radius={2} tone="positive" border>
          <Stack gap={3}>
            <Text size={1} weight="semibold">
              Suggested fix
            </Text>
            <Text size={2}>{row.suggestedFix}</Text>
          </Stack>
        </Card>
      ) : null}
    </Stack>
  )
}

/** Stage 4: the same buyer question answered three ways. The finding is the middle column going wrong. */
export function DifferenceTool() {
  const client = useClient({apiVersion: '2026-09-01'})
  const router = useRouter()
  const [rows, setRows] = useState<Comparison[] | null>(null)
  // The selected row lives in the URL (/answer-drift/<question number>), so Content audit can link straight to it.
  const selected = Number(router.state.question) || undefined

  useEffect(() => {
    client.fetch<Comparison[]>(QUERY).then(setRows)
  }, [client])

  const groups = useMemo(
    () => DRIFT_VERDICTS.map((v) => ({...v, items: (rows ?? []).filter((r) => r.verdict === v.value)})),
    [rows],
  )

  if (!rows) {
    return (
      <Flex padding={6} justify="center">
        <Spinner />
      </Flex>
    )
  }

  const current = rows.find((r) => r.questionNumber === selected) ?? groups.find((g) => g.items.length)?.items[0]
  const runAt = rows[0]?.runAt ? new Date(rows[0].runAt).toLocaleString('en-GB', {dateStyle: 'medium', timeStyle: 'short'}) : null

  return (
    <Flex direction="column" height="fill" style={{minHeight: 0}}>
      <Card paddingX={4} paddingY={3} borderBottom tone="transparent">
        <Flex gap={4} align="center" wrap="wrap">
          <Text size={1} weight="semibold">
            {runAt ? `Last run ${runAt}` : 'No run yet'}
          </Text>
          <Text size={1} muted>
            npm run stage4 · {rows[0]?.model ?? '—'} · web_search
          </Text>
          <Badge>Batch run, not live</Badge>
          <Text size={1} muted style={{marginLeft: 'auto'}}>
            {rows.length} checked · {groups.filter((g) => g.items.length).map((g) => `${g.items.length} ${g.title.toLowerCase()}`).join(' · ')}
          </Text>
        </Flex>
      </Card>
      <Flex flex={1} style={{minHeight: 0}}>
        <Card borderRight style={{width: 320, flexShrink: 0, overflowY: 'auto'}}>
          <Stack padding={4} gap={5}>
            {rows.length === 0 ? <Text muted>Run npm run stage4 to fill this tab.</Text> : null}
            {groups
              .filter((g) => g.items.length)
              .map((g) => (
                <Stack key={g.value} gap={2}>
                  <Flex align="center" gap={2}>
                    <Text size={1} weight="semibold">
                      {g.title}
                    </Text>
                    <Badge tone={VERDICT_TONE[g.value]}>{g.items.length}</Badge>
                  </Flex>
                  {g.items.map((r) => (
                    <Card
                      key={r._id}
                      as="button"
                      padding={3}
                      radius={2}
                      tone={current?._id === r._id ? 'primary' : 'default'}
                      onClick={() => router.navigate({question: String(r.questionNumber)})}
                      style={{textAlign: 'left', cursor: 'pointer'}}
                    >
                      <Text size={1}>{r.questionText}</Text>
                    </Card>
                  ))}
                </Stack>
              ))}
          </Stack>
        </Card>
        <Box flex={1} padding={5} style={{overflowY: 'auto'}}>
          {current ? <Detail row={current} /> : null}
        </Box>
      </Flex>
    </Flex>
  )
}
