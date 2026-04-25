import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'),
  title: 'Splitrec — Split receipts, not friendships.',
  description: 'Bagi tagihan dengan mudah dan cepat. No login required.',
  authors: [{ name: '@pratamadli' }],
  creator: '@pratamadli',
  other: {
    'github': '@pratamadli',
    'instagram': '@pratamadli',
  },
  openGraph: {
    title: 'Splitrec — Split receipts, not friendships.',
    description: 'Bagi tagihan dengan mudah dan cepat. No login required.',
    siteName: 'Splitrec',
    images: [{ url: '/logo.png', width: 1200, height: 630, alt: 'Splitrec' }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Splitrec — Split receipts, not friendships.',
    description: 'Bagi tagihan dengan mudah dan cepat. No login required.',
    images: ['/logo.png'],
    creator: '@pratamadli',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${inter.variable} h-full`}>
      <body className="min-h-full bg-white font-sans antialiased">{children}</body>
    </html>
  )
}
