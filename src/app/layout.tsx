import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import './globals.css'

export const metadata: Metadata = {
  title: 'TUTOR — Préparation aux concours médicaux',
  description: '808 cours structurés, des QCM ciblés et des programmes sur mesure (90j / 180j) pour réussir votre concours médical.',
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="fr"
      className={`h-full antialiased ${GeistSans.variable} ${GeistMono.variable}`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  )
}
