import Link from 'next/link'
import { JobRole } from '@/types'

interface RoleCardProps {
  role: JobRole
}

export default function RoleCard({ role }: RoleCardProps) {
  const statusColor = role.status === 'active' ? 'var(--green)' : 'var(--text3)'
  const statusBg = role.status === 'active' ? 'var(--green-dim)' : 'rgba(255,255,255,0.04)'
  const statusBorder = role.status === 'active'
    ? '1px solid rgba(0,214,143,0.2)'
    : '1px solid var(--border)'

  return (
    <Link href={`/dashboard/roles/${role.id}`} style={{ textDecoration: 'none' }}>
      <div
        style={{
          background: 'var(--panel)',
          border: '1px solid var(--border)',
          borderRadius: '14px',
          padding: '1.5rem',
          cursor: 'pointer',
          transition: 'border-color 0.2s, transform 0.2s',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border2)'
          ;(e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)'
          ;(e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'
        }}
      >
        {/* Top row */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: '1rem',
        }}>
          <div>
            <p style={{
              fontFamily: 'DM Mono, monospace',
              fontSize: '0.6rem',
              color: 'var(--text3)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: '0.3rem',
            }}>
              {role.department}
            </p>
            <h3 style={{
              fontFamily: 'Syne, sans-serif',
              fontWeight: 700,
              fontSize: '1rem',
              color: 'var(--text)',
              letterSpacing: '-0.02em',
            }}>
              {role.title}
            </h3>
          </div>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.3rem',
            padding: '0.2rem 0.6rem',
            borderRadius: '9999px',
            background: statusBg,
            border: statusBorder,
            fontFamily: 'DM Mono, monospace',
            fontSize: '0.6rem',
            color: statusColor,
            textTransform: 'uppercase',
            flexShrink: 0,
          }}>
            <span style={{
              width: '5px', height: '5px',
              borderRadius: '50%',
              background: statusColor,
              display: 'inline-block',
            }} />
            {role.status}
          </span>
        </div>

        {/* Description */}
        <p style={{
          fontSize: '0.8rem',
          color: 'var(--text3)',
          lineHeight: 1.6,
          marginBottom: '1.2rem',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {role.description}
        </p>

        {/* Bottom row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '1rem',
          borderTop: '1px solid var(--border)',
        }}>
          {/* Candidates */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <svg width="13" height="13" fill="none" stroke="var(--text3)" strokeWidth="1.8" viewBox="0 0 24 24">
              <circle cx="9" cy="7" r="4" />
              <path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
            </svg>
            <span style={{
              fontFamily: 'DM Mono, monospace',
              fontSize: '0.68rem',
              color: 'var(--text2)',
            }}>
              {role.candidateCount} candidates
            </span>
          </div>

          {/* Avg score */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{
              fontFamily: 'DM Mono, monospace',
              fontSize: '0.65rem',
              color: 'var(--text3)',
            }}>
              AVG
            </span>
            <span style={{
              fontFamily: 'Syne, sans-serif',
              fontWeight: 800,
              fontSize: '1rem',
              color: 'var(--gold)',
              letterSpacing: '-0.02em',
            }}>
              {role.avgScore}
            </span>
          </div>

          {/* Date */}
          <span style={{
            fontFamily: 'DM Mono, monospace',
            fontSize: '0.62rem',
            color: 'var(--text3)',
          }}>
            {role.createdAt}
          </span>
        </div>
      </div>
    </Link>
  )
}