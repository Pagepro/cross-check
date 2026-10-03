import type {Metadata} from 'next'
import {Archivo, JetBrains_Mono, Source_Sans_3} from 'next/font/google'

import './globals.css'

const archivo = Archivo({variable: '--font-archivo', subsets: ['latin'], weight: ['500', '600', '700']})
const sourceSans = Source_Sans_3({variable: '--font-source-sans', subsets: ['latin']})
const jetbrains = JetBrains_Mono({variable: '--font-jetbrains', subsets: ['latin']})

export const metadata: Metadata = {
  title: 'Cross-Check',
  description: "What buyers ask, what our site says, and what we told clients: gaps, ambiguities and contradictions in Sanity Studio.",
}

export default function RootLayout({children}: LayoutProps<'/'>) {
  return (
    <html lang="en" className={`${archivo.variable} ${sourceSans.variable} ${jetbrains.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">{children}</body>
    </html>
  )
}
