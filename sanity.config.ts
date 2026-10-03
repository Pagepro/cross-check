'use client'

import {codeInput} from '@sanity/code-input'
import {table} from '@sanity/table'
import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'

import {projectId} from './lib/env'
import {auditSchemaTypes} from './sanity/audit/schemaTypes'
import {auditStructure} from './sanity/audit/structure'
import {auditTool} from './sanity/audit/tool'
// The Pagepro site schema, taken from the Pagepro Studio export. Editor-only rich text styling as in that Studio.
import './sanity/pagepro/schemaTypes/objects/richText/editor.css'
import {schemaTypes as pageproSchemaTypes} from './sanity/pagepro/schemaTypes'
import {simplerColor} from './sanity/pagepro/stubs/simplerColor'

export default defineConfig({
  name: 'audit',
  title: 'Pagepro',
  basePath: '/studio/audit',
  projectId,
  dataset: 'pagepro',
  plugins: [structureTool({structure: auditStructure}), auditTool(), table(), codeInput()],
  schema: {types: [...pageproSchemaTypes, simplerColor, ...auditSchemaTypes]},
})
