import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production',
  },
  // External studio registration; the Context MCP endpoints require one.
  deployment: {
    appId: 'rfi5623hob9uu52q01nwgiu1',
  },
})
