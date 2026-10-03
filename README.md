# Cross-Check

An agent that compares what Pagepro's website says with what our sales team actually told prospects, and files
**gaps** (buyers ask, the site doesn't answer), **ambiguities** (the site answers two ways) and **contradictions**
(the site disagrees with sales, or with itself). Findings land in Sanity Studio, next to the evidence, for the editor
who fixes the page. Entry for the DEV.to Sanity Challenge, Path One.

The Vercel deploy still carries the project's earlier working name, `coverage-gap-probe`.

## How it works

```
Pagepro site (private dataset `pagepro`)
  └─ scripts/stage1/build-kb-sources.mjs → 73 `kbSource` docs (one per page / case study: URL + text)
       └─ Knowledge Base "Pagepro site" (Sanity Context, built with `sanity context`)
            └─ Context MCP, Knowledge Base mode ── KB agent (lib/probe/kb-agent.ts)
                                                     │
buyerQuestion (87, from 209 prospect emails) ──────┤
salesAnswer (65, what we told clients) ────────────┤  judge (lib/probe/judge.ts):
page text search (gap check, independent of KB) ───┘  verdict, priority, fix
                                                     │
                                         `finding` docs → Studio tab "Content audit"
```

- **Why flattened `kbSource` docs:** the page-builder documents are ~40% layout settings, and the Context build skipped
  the 12 largest service pages. One text document per page, with its full URL, keeps every page in and lets answers
  cite the subpage.
- **Why a page-text check before every "gap":** Knowledge Base search matches exact keywords with no stemming. A gap
  is only filed after the page text itself was searched, so the tool never sends someone to write content that exists.
- **Why the sales corpus stays outside the Knowledge Base:** the KB knows only the site. The evidence against it comes
  from what we promised in emails and offers.

## Stages

1. `npm run stage1`: the KB agent answers with citations, admits what is missing, differs from a model without the KB.
   Claude setup: [notes/stage1-claude-setup.md](notes/stage1-claude-setup.md).
2. `npm run stage2`: each buyer question → one `finding` document, in budgeted batches. All 87 are done: 57 gaps,
   13 ambiguities, 9 contradictions, 8 covered.
3. Studio → **Pagepro** workspace (`/studio/audit`): **Pages** in Structure, edited with the real Pagepro schema
   (vendored in `sanity/pagepro/` from the Pagepro Studio export), and the **Content audit** tab with the findings.
4. `npm run stage4`: **Answer drift**. Each buyer question the site answers goes three ways: the model alone, the
   same model with web search, and the KB agent. Both outside answers are graded against the KB answer, and the
   verdict is computed in code (`lib/probe/drift.ts`). Rows that missed get a suggested fix for the editor
   (`lib/probe/recommend.ts`). `npm run stage4:recommend` writes fixes onto an existing run without redoing the web
   searches. Content audit links each question to its row in the latest run.
5. `npm run coverage`: does the site answer each of the 87 buyer questions (yes / partly / no)? Stage 4 skips the
   ones it does not, since there is nothing to grade against.

`/` redirects to the Studio; there is no other public page.

## Setup

```bash
npm install
cp .env.example .env.local   # fill in; never commit
npm run dev                  # http://localhost:3000, Studio at /studio
```

| Variable | What |
|---|---|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Sanity project (`jupwoq5l`); all content lives in its private `pagepro` dataset |
| `SANITY_WRITE_TOKEN` | Project token, Editor (writes scans; reads/writes the private `pagepro` dataset) |
| `SANITY_ORG_TOKEN` | Org token, Context Viewer (reads Context MCP) |
| `SANITY_MCP_KB_URL` | Context MCP, KB mode: `…/mcp/coverage-kb?mode=knowledge_base&knowledgeBases=<kb id>` |
| `AI_GATEWAY_API_KEY` | Vercel AI Gateway, for the scripts only; the deployed app makes no model calls |

The sales corpus (`data/*.json`) holds real rates and contract terms. It is git-ignored and lives only in the private
dataset.

## Checks

`npm test` · `npm run lint` · `npm run check:mcp -- kb --full` (KB outline) · `npm run check:kb-issues` (what the build flagged)
