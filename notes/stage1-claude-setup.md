# Stage 1: Claude with the Pagepro Knowledge Base

Claude reads the "Pagepro site" Knowledge Base (73 pages and case studies) through Sanity Context MCP.
No token is in this file. Use the org token with the **Context Viewer** role (read-only), shared by password manager.

## Endpoint

```
https://api.sanity.io/v1/context/organizations/ofijSgqoX/mcp/coverage-kb?mode=knowledge_base&knowledgeBases=kbi0gfXDPOux
Header: Authorization: Bearer <TOKEN>
```

### Claude Code

```bash
claude mcp add --transport http pagepro-kb \
  "https://api.sanity.io/v1/context/organizations/ofijSgqoX/mcp/coverage-kb?mode=knowledge_base&knowledgeBases=kbi0gfXDPOux" \
  --header "Authorization: Bearer <TOKEN>"
```

### Claude Desktop (`claude_desktop_config.json`)

```json
{
  "mcpServers": {
    "pagepro-kb": {
      "command": "npx",
      "args": [
        "-y", "mcp-remote",
        "https://api.sanity.io/v1/context/organizations/ofijSgqoX/mcp/coverage-kb?mode=knowledge_base&knowledgeBases=kbi0gfXDPOux",
        "--header", "Authorization:${SANITY_AUTH}"
      ],
      "env": {"SANITY_AUTH": "Bearer <TOKEN>"}
    }
  }
}
```

## Instruction to paste at the start of the chat

Search matches exact keywords only, with no stemming ("receive" does not find "receives"). Without this, Claude
tends to run one search and give up, and then says something is missing when it is not.

> Answer questions about Pagepro using only the pagepro-kb knowledge base. Before answering, run at least three
> searches with different wordings, using `return: "entries"`, and read every hit. Quote figures exactly and name the
> source pages. If nothing answers the question, say the knowledge base does not cover it; never fill the gap.

## The four checks

| Ask | Expect |
|---|---|
| How long does it take to see a demo of our site rebuilt with Nexity? | 48-hour demo in week 1 of a 4-week engagement, sources /services/nexity, /services/website-migration-services |
| Do you hold ISO 27001 certification? | Not in the knowledge base; no invented certification |
| Do unused support hours roll over to the next month? | No: "we do not allow for the rollover of unused hours", source /services/post-release-support |
| How many people work at Pagepro? (also in plain ChatGPT) | KB: 40 team members. Plain model: does not know |

Our own run of these: `npm run stage1`, log in `notes/stage1-2026-10-01.log`.

The planted-fact test ("printed project handbook bound in green linen" on /about) passed on 2026-10-01 and was then removed
from the dataset and the Knowledge Base. To repeat it: `npx sanity exec scripts/stage1/plant-fact.mjs --with-user-token`,
then `npx sanity exec scripts/stage1/build-kb-sources.mjs --with-user-token`, re-import and rebuild; `-- --remove` undoes it.
