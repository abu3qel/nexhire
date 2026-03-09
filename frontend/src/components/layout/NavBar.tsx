'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Upload',    href: '/upload' },
  { label: 'Bias Report', href: '/bias-report' },
]

export default function Navbar() {
  const pathname = usePathname()

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 flex justify-center"
      style={{ padding: '16px 24px' }}
    >
      <nav
        className="flex items-center justify-between w-full"
        style={{
          maxWidth: '860px',
          background: 'rgba(13, 19, 32, 0.92)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '9999px',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 8px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
          padding: '6px 6px 6px 16px',
        }}
      >
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div
            className="flex items-center justify-center"
            style={{
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              background: 'var(--gold)',
              flexShrink: 0,
            }}
          >
            <span style={{
              fontFamily: 'Syne, sans-serif',
              fontWeight: 800,
              fontSize: '0.65rem',
              color: '#000',
              letterSpacing: '-0.02em',
            }}>
              NH
            </span>
          </div>
          <span style={{
            fontFamily: 'Syne, sans-serif',
            fontWeight: 700,
            fontSize: '0.95rem',
            color: 'var(--text)',
            letterSpacing: '-0.02em',
          }}>
            Nex<span style={{ color: 'var(--gold)' }}>Hire</span>
          </span>
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-0.5">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  fontFamily: 'Instrument Sans, sans-serif',
                  fontSize: '0.83rem',
                  fontWeight: isActive ? 600 : 400,
                  borderRadius: '9999px',
                  padding: '0.4rem 1rem',
                  background: isActive ? 'var(--gold)' : 'transparent',
                  color: isActive ? '#000' : 'var(--text2)',
                  transition: 'all 0.2s',
                  whiteSpace: 'nowrap',
                }}
              >
                {item.label}
              </Link>
            )
          })}
        </div>

        {/* Right pill */}
        <div
          className="flex items-center gap-2"
          style={{
            background: 'var(--bg3)',
            border: '1px solid var(--border)',
            borderRadius: '9999px',
            padding: '0.4rem 1rem',
          }}
        >
          <span style={{
            width: '7px',
            height: '7px',
            borderRadius: '50%',
            background: 'var(--green)',
            display: 'inline-block',
            flexShrink: 0,
            boxShadow: '0 0 6px var(--green)',
          }} />
          <span style={{
            fontFamily: 'DM Mono, monospace',
            fontSize: '0.7rem',
            color: 'var(--text2)',
            whiteSpace: 'nowrap',
          }}>
            naif@nexhire
          </span>
        </div>
      </nav>
    </div>
  )
}