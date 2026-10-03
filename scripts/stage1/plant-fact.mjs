// Stage 1 test: plant one fact that exists nowhere else, so a KB answer that repeats it proves the agent read the KB.
// Only touches the private `pagepro` copy. Run: npx sanity exec scripts/stage1/plant-fact.mjs --with-user-token
// Remove again with: ... plant-fact.mjs --with-user-token -- --remove
import {getCliClient} from 'sanity/cli'

const PAGE = 'page-46ecce45-a0a0-4b94-bc2e-a7d4d8cf34c8' // About
const SECTION = 'c149bfff-294f-46d2-b6a7-a99dc27d022c'
const KEY = 'plantedfact01'
export const PLANTED_FACT = 'Every new client receives a printed project handbook bound in green linen.'

const client = getCliClient({apiVersion: '2026-09-01'}).withConfig({dataset: 'pagepro'})
const path = `sections[_key=="${SECTION}"].content`

if (process.argv.includes('--remove')) {
  await client.patch(PAGE).unset([`${path}[_key=="${KEY}"]`]).commit()
  console.log('removed planted fact')
} else {
  await client
    .patch(PAGE)
    .unset([`${path}[_key=="${KEY}"]`])
    .insert('after', `${path}[-1]`, [
      {_key: KEY, _type: 'block', style: 'normal', markDefs: [], children: [{_key: `${KEY}s`, _type: 'span', marks: [], text: PLANTED_FACT}]},
    ])
    .commit()
  const check = await client.fetch(`*[_id == $id][0].${path}[_key == $key][0].children[0].text`, {id: PAGE, key: KEY})
  console.log('planted:', check)
}
