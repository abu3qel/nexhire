'use client'

import RoleCard from '@/components/ui/RoleCard'
import { MOCK_ROLES } from '@/lib/mockData'
import Link from 'next/link'

export default function RolesPage() {
  return (
    <div style={{ padding: '2rem' }}>
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: '2rem',
        paddingBottom: '1.5rem',
        borderBottom: '1px solid var(--border)',
      }}>
        <div>
          <p style={{
            fontFamily: 'DM Mono, monospace',
            fontSize: '0.62rem',
            color: 'var(--gold)',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            marginBottom: '0.4rem',
          }}>
            Roles
          </p>
          <h1 style={{
            fontFamily: 'Syne, sans-serif',
            fontWeight: 800,
            fontSize: '1.8rem',
            letterSpacing: '-0.03em',
            color: 'var(--text)',
          }}>
            Job Roles
          </h1>
          <p style={{ color: 'var(--text2)', fontSize: '0.85rem', marginTop: '0.3rem' }}>
            {MOCK_ROLES.length} active roles · {MOCK_ROLES.reduce((s, r) => s + r.candidateCount, 0)} total candidates
          </p>
        </div>
        <Link
          href="/upload"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.6rem 1.2rem',
            borderRadius: '9999px',
            background: 'var(--gold)',
            color: '#000',
            fontFamily: 'Syne, sans-serif',
            fontWeight: 700,
            fontSize: '0.82rem',
            textDecoration: 'none',
          }}
        >
          + New Role
        </Link>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '1.25rem',
      }}>
        {MOCK_ROLES.map(role => (
          <RoleCard key={role.id} role={role} />
        ))}
      </div>
    </div>
  )
}