'use client'

import StatCard from '@/components/ui/StatsCard'
import { MOCK_ROLES, ALL_CANDIDATES } from '@/lib/mockData'

export default function OverviewPage() {
  const totalRoles = MOCK_ROLES.length
  const totalCandidates = ALL_CANDIDATES.length
  const assessed = ALL_CANDIDATES.filter(c => c.status === 'assessed').length
  const avgScore = Math.round(
    ALL_CANDIDATES.reduce((sum, c) => sum + c.overall, 0) / ALL_CANDIDATES.length
  )
  const topCandidate = ALL_CANDIDATES.reduce((a, b) => a.overall > b.overall ? a : b)

  const STATS = [
    { label: 'Active Roles',       value: String(totalRoles),      delta: 'Across all departments',       color: 'var(--gold)'  },
    { label: 'Total Candidates',   value: String(totalCandidates), delta: `${assessed} assessed`,         color: 'var(--cyan)'  },
    { label: 'Avg Overall Score',  value: String(avgScore),        delta: '+4.2 vs resume-only baseline', color: 'var(--green)' },
    { label: 'Top Match',          value: `${topCandidate.overall}%`, delta: topCandidate.name,           color: 'var(--red)'   },
  ]

  return (
    <div style={{ padding: '2rem' }}>
      {/* Header */}
      <div style={{
        marginBottom: '2rem',
        paddingBottom: '1.5rem',
        borderBottom: '1px solid var(--border)',
      }}>
        <p style={{
          fontFamily: 'DM Mono, monospace',
          fontSize: '0.62rem',
          color: 'var(--gold)',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          marginBottom: '0.4rem',
        }}>
          Dashboard
        </p>
        <h1 style={{
          fontFamily: 'Syne, sans-serif',
          fontWeight: 800,
          fontSize: '1.8rem',
          letterSpacing: '-0.03em',
          color: 'var(--text)',
        }}>
          Overview
        </h1>
        <p style={{ color: 'var(--text2)', fontSize: '0.85rem', marginTop: '0.3rem' }}>
          Multi-modal assessment summary across all active roles
        </p>
      </div>

      {/* Stat cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '1rem',
        marginBottom: '2.5rem',
      }}>
        {STATS.map(s => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {/* Roles summary */}
      <div style={{
        background: 'var(--panel)',
        border: '1px solid var(--border)',
        borderRadius: '14px',
        overflow: 'hidden',
      }}>
        <div style={{
          padding: '1rem 1.4rem',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <h2 style={{
            fontFamily: 'Syne, sans-serif',
            fontWeight: 700,
            fontSize: '0.95rem',
            color: 'var(--text)',
          }}>
            Active Roles
          </h2>
          <a href="/dashboard/roles" style={{
            fontFamily: 'DM Mono, monospace',
            fontSize: '0.65rem',
            color: 'var(--gold)',
            textDecoration: 'none',
          }}>
            View all →
          </a>
        </div>

        {MOCK_ROLES.map((role, i) => (
          <a
            key={role.id}
            href={`/dashboard/roles/${role.id}`}
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 120px 80px 80px',
              alignItems: 'center',
              gap: '1rem',
              padding: '1rem 1.4rem',
              borderBottom: i < MOCK_ROLES.length - 1 ? '1px solid var(--border)' : 'none',
              textDecoration: 'none',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--panel2)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <div>
              <p style={{
                fontFamily: 'Syne, sans-serif',
                fontWeight: 600,
                fontSize: '0.88rem',
                color: 'var(--text)',
                marginBottom: '0.15rem',
              }}>
                {role.title}
              </p>
              <p style={{
                fontFamily: 'DM Mono, monospace',
                fontSize: '0.62rem',
                color: 'var(--text3)',
              }}>
                {role.department}
              </p>
            </div>

            <span style={{
              fontFamily: 'DM Mono, monospace',
              fontSize: '0.72rem',
              color: 'var(--text2)',
            }}>
              {role.candidateCount} candidates
            </span>

            <span style={{
              fontFamily: 'Syne, sans-serif',
              fontWeight: 800,
              fontSize: '1rem',
              color: 'var(--gold)',
            }}>
              {role.avgScore}
            </span>

            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
              padding: '0.2rem 0.6rem',
              borderRadius: '9999px',
              background: 'var(--green-dim)',
              border: '1px solid rgba(0,214,143,0.2)',
              fontFamily: 'DM Mono, monospace',
              fontSize: '0.6rem',
              color: 'var(--green)',
            }}>
              ● {role.status}
            </span>
          </a>
        ))}
      </div>
    </div>
  )
}