import type { Metadata } from 'next'
import Navbar from '@/components/layout/NavBar'
import Footer from '@/components/layout/Footer'
import './globals.css'

export const metadata: Metadata = {
  title: 'NexHire — Multi-Modal Candidate Assessment',
  description: 'AI-powered technical recruitment assessment platform',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        className="min-h-screen grid-bg flex flex-col"
        style={{ background: 'var(--bg)' }}
      >
        <Navbar />
        <main className="flex-1" style={{ paddingTop: '80px' }}>{children}</main>
        <Footer />
      </body>
    </html>
  )
}