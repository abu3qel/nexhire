'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { MOCK_ROLES } from '@/lib/mockData'

const NAV_ITEMS = [
  {
    label: 'Overview',
    href: '/dashboard',
    icon: (
      <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    label: 'Roles',
    href: '/dashboard/roles',
    icon: (
      <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <rect x="2" y="7" width="20" height="14" rx="2" />
        <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
      </svg>
    ),
  },
  {
    label: 'Candidates',
    href: '/dashboard/candidates',
    icon: (
      <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <circle cx="9" cy="7" r="4" />
        <path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        <path d="M21 21v-2a4 4 0 0 0-3-3.85" />
      </svg>
    ),
  },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside style={{
      width: '230px',
      flexShrink: 0,
      background: 'var(--panel)',
      borderRight: '1px solid var(--border)',
      minHeight: 'calc(100vh - 80px)',
      padding: '1.25rem 0.75rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
      position: 'sticky',
      top: '80px',
    }}>

      {/* Main nav */}
      <p style={{
        fontFamily: 'DM Mono, monospace',
        fontSize: '0.58rem',
        color: 'var(--text3)',
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        padding: '0 0.5rem',
        marginBottom: '0.25rem',
      }}>
        Menu
      </p>

      {NAV_ITEMS.map((item) => {
        const isActive = item.href === '/dashboard'
          ? pathname === '/dashboard'
          : pathname.startsWith(item.href)

        return (
          <Link
            key={item.href}
            href={item.href}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              padding: '0.55rem 0.75rem',
              borderRadius: '8px',
              background: isActive ? 'var(--gold-dim)' : 'transparent',
              color: isActive ? 'var(--gold)' : 'var(--text2)',
              fontFamily: 'Instrument Sans, sans-serif',
              fontSize: '0.85rem',
              fontWeight: isActive ? 600 : 400,
              textDecoration: 'none',
              transition: 'all 0.15s',
              border: isActive ? '1px solid rgba(240,165,0,0.15)' : '1px solid transparent',
            }}
          >
            {item.icon}
            {item.label}
          </Link>
        )
      })}

      {/* Divider */}
      <div style={{
        height: '1px',
        background: 'var(--border)',
        margin: '0.5rem 0',
      }} />

      {/* Active roles */}
      <p style={{
        fontFamily: 'DM Mono, monospace',
        fontSize: '0.58rem',
        color: 'var(--text3)',
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        padding: '0 0.5rem',
        marginBottom: '0.25rem',
      }}>
        Active Roles
      </p>

      {MOCK_ROLES.filter(r => r.status === 'active').map((role) => {
        const isActive = pathname === `/dashboard/roles/${role.id}`
        return (
          <Link
            key={role.id}
            href={`/dashboard/roles/${role.id}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.5rem 0.75rem',
              borderRadius: '8px',
              background: isActive ? 'var(--gold-dim)' : 'transparent',
              color: isActive ? 'var(--gold)' : 'var(--text2)',
              fontFamily: 'Instrument Sans, sans-serif',
              fontSize: '0.8rem',
              textDecoration: 'none',
              transition: 'all 0.15s',
              border: isActive ? '1px solid rgba(240,165,0,0.15)' : '1px solid transparent',
            }}
          >
            <span style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: '130px',
            }}>
              {role.title}
            </span>
            <span style={{
              fontFamily: 'DM Mono, monospace',
              fontSize: '0.6rem',
              color: isActive ? 'var(--gold)' : 'var(--text3)',
              flexShrink: 0,
            }}>
              {role.candidateCount}
            </span>
          </Link>
        )
      })}

      {/* Bottom — new role button */}
      <div style={{ marginTop: 'auto' }}>
        <Link
          href="/upload"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            padding: '0.65rem',
            borderRadius: '8px',
            background: 'var(--gold-dim)',
            border: '1px solid rgba(240,165,0,0.2)',
            color: 'var(--gold)',
            fontFamily: 'Instrument Sans, sans-serif',
            fontWeight: 600,
            fontSize: '0.82rem',
            textDecoration: 'none',
            transition: 'all 0.2s',
          }}
        >
          + New Role
        </Link>
      </div>
    </aside>
  )
}