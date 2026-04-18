import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'Splitrec — Split receipts, not friendships.',
  description: 'Bagi tagihan dengan mudah dan cepat. No login required.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${inter.variable} h-full`}>
      <body className="min-h-full bg-white font-sans antialiased">{children}</body>
    </html>
  )
}
