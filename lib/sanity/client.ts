import 'server-only'

import {createClient} from 'next-sanity'

import {apiVersion, projectId, serverEnv} from '../env'

let pageproClientInstance: ReturnType<typeof createClient> | undefined

/** The private `pagepro` dataset: the Pagepro site copy, its Knowledge Base sources, the sales corpus and findings. */
export function pageproClient() {
  pageproClientInstance ??= createClient({
    projectId,
    dataset: 'pagepro',
    apiVersion,
    useCdn: false,
    token: serverEnv('SANITY_WRITE_TOKEN'),
  })
  return pageproClientInstance
}
