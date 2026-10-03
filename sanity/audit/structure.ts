import {VscChecklist, VscComment, VscFiles, VscFileSubmodule, VscMail, VscWarning} from 'react-icons/vsc'
import type {StructureResolver} from 'sanity/structure'

import {VERDICTS} from './schemaTypes'

// The Pagepro site as editors see it in the Pagepro Studio: Pages and Case studies, same titles and icons.
// (Their "Open In Visual Editor" / "Open on the Website" views are left out: neither exists in this app.)
// Below them, the audit's own documents; the "Content audit" tool shows the same findings with their evidence.
export const auditStructure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      S.listItem().title('Pages').icon(VscFiles).child(S.documentTypeList('page').title('Pages')),
      S.divider().title('Case studies'),
      S.listItem()
        .title('Case Studies Listing Page')
        .icon(VscFileSubmodule)
        .child(S.document().schemaType('case-studies-listing-page').documentId('caseStudiesListingPage')),
      S.listItem()
        .title('Case studies')
        .schemaType('case-study')
        .child(S.documentTypeList('case-study').title('Case studies')),
      S.divider().title('Audit'),
      S.listItem()
        .title('Findings')
        .icon(VscWarning)
        .child(
          S.list()
            .title('Findings')
            .items(
              VERDICTS.map((v) =>
                S.listItem()
                  .id(v.value)
                  .title(v.title)
                  .child(S.documentTypeList('finding').title(v.title).filter('_type == "finding" && verdict == $verdict').params({verdict: v.value})),
              ),
            ),
        ),
      S.listItem()
        .title('Site coverage')
        .icon(VscChecklist)
        .child(
          S.list()
            .title('Does the site answer it?')
            .items(
              [
                {id: 'no', title: 'No — the site does not answer it', filter: 'siteCoverage == "no"'},
                {id: 'partly', title: 'Partly — some of it, or only vaguely', filter: 'siteCoverage == "partly"'},
                {id: 'yes', title: 'Yes — a buyer gets the fact', filter: 'siteCoverage == "yes"'},
                {id: 'unchecked', title: 'Not checked yet', filter: '!defined(siteCoverage)'},
              ].map((c) =>
                S.listItem()
                  .id(c.id)
                  .title(c.title)
                  .child(
                    S.documentTypeList('buyerQuestion')
                      .title(c.title)
                      .filter(`_type == "buyerQuestion" && ${c.filter}`)
                      .defaultOrdering([{field: 'number', direction: 'asc'}]),
                  ),
              ),
            ),
        ),
      S.listItem()
        .title('Buyer questions')
        .icon(VscComment)
        .child(S.documentTypeList('buyerQuestion').title('Buyer questions').defaultOrdering([{field: 'number', direction: 'asc'}])),
      S.listItem().title('Sales answers').icon(VscMail).child(S.documentTypeList('salesAnswer').title('Sales answers')),
    ])
