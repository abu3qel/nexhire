'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { MOCK_ROLES } from '@/lib/mockData'
import { Candidate } from '@/types'
import ScoreBar from '@/components/candidate/ScoreBar'
import CandidateDrawer from '@/components/candidate/CandidateDrawer'
import Link from 'next/link'

export default function RoleCandidatesPage() {
  const { id } = useParams()
  const role = MOCK_ROLES.find(r => r.id === id)
  const [selected, setSelected] = useState<Candidate | null>(null)

  if (!role) return (
    <div style={{ padding: '2rem', color: 'var(--text2)' }}>Role not found.</div>
  )

  const bgStyle = (b: string) => {
    if (b === 'bootcamp') return { bg: 'var(--cyan-dim)', color: 'var(--cyan)', border: '1px solid rgba(0,200,212,0.2)' }
    if (b === 'self-taught') return { bg: 'var(--red-dim)', color: 'var(--red)', border: '1px solid rgba(255,77,109,0.2)' }
    return { bg: 'rgba(255,255,255,0.04)', color: 'var(--text3)', border: '1px solid var(--border)' }
  }

  return (
    <div style={{ padding: '2rem' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: '2rem',
        paddingBottom: '1.5rem',
        borderBottom: '1px solid var(--border)',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
            <Link href="/dashboard/roles" style={{
              fontFamily: 'DM Mono, monospace',
              fontSize: '0.62rem',
              color: 'var(--text3)',
              textDecoration: 'none',
            }}>
              Roles
            </Link>
            <span style={{ color: 'var(--text3)', fontSize: '0.7rem' }}>→</span>
            <span style={{
              fontFamily: 'DM Mono, monospace',
              fontSize: '0.62rem',
              color: 'var(--gold)',
            }}>
              {role.title}
            </span>
          </div>
          <h1 style={{
            fontFamily: 'Syne, sans-serif',
            fontWeight: 800,
            fontSize: '1.8rem',
            letterSpacing: '-0.03em',
            color: 'var(--text)',
          }}>
            {role.title}
          </h1>
          <p style={{ color: 'var(--text2)', fontSize: '0.85rem', marginTop: '0.3rem' }}>
            {role.department} · {role.candidateCount} candidates · Avg score {role.avgScore}
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
          + Add Candidate
        </Link>
      </div>

      {/* Table */}
      <div style={{
        background: 'var(--panel)',
        border: '1px solid var(--border)',
        borderRadius: '14px',
        overflow: 'hidden',
      }}>
        {/* Table header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '32px 1fr 100px 100px 100px 100px 110px 90px 90px',
          gap: '0.75rem',
          padding: '0.6rem 1.2rem',
          background: 'var(--bg3)',
          borderBottom: '1px solid var(--border)',
          fontFamily: 'DM Mono, monospace',
          fontSize: '0.6rem',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: 'var(--text3)',
        }}>
          <span>#</span>
          <span>Candidate</span>
          <span>Resume</span>
          <span>GitHub</span>
          <span>LinkedIn</span>
          <span>Portfolio</span>
          <span>Overall</span>
          <span>Status</span>
          <span>Background</span>
        </div>

        {role.candidates.map((c, i) => (
          <div
            key={c.id}
            onClick={() => setSelected(c)}
            style={{
              display: 'grid',
              gridTemplateColumns: '32px 1fr 100px 100px 100px 100px 110px 90px 90px',
              gap: '0.75rem',
              padding: '0.9rem 1.2rem',
              borderBottom: i < role.candidates.length - 1 ? '1px solid var(--border)' : 'none',
              alignItems: 'center',
              cursor: 'pointer',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--panel2)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <span style={{
              fontFamily: 'DM Mono, monospace',
              fontSize: '0.75rem',
              color: i < 3 ? 'var(--gold)' : 'var(--text3)',
              fontWeight: i < 3 ? 700 : 400,
              textAlign: 'center',
            }}>
              {i + 1}
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: '32px', height: '32px',
                borderRadius: '8px',
                background: `${c.color}20`,
                border: `1px solid ${c.color}40`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'Syne, sans-serif',
                fontWeight: 700, fontSize: '0.65rem',
                color: c.color, flexShrink: 0,
              }}>
                {c.initials}
              </div>
              <div>
                <p style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text)', marginBottom: '0.1rem' }}>
                  {c.name}
                </p>
                <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.62rem', color: 'var(--text3)' }}>
                  {c.email}
                </p>
              </div>
            </div>

            <ScoreBar value={c.scores.resume}    color="var(--gold)"  />
            <ScoreBar value={c.scores.github}    color="var(--cyan)"  />
            <ScoreBar value={c.scores.linkedin}  color="var(--green)" />
            <ScoreBar value={c.scores.portfolio} color="var(--red)"   />

            <div>
              <span style={{
                fontFamily: 'Syne, sans-serif',
                fontWeight: 800, fontSize: '1.1rem',
                letterSpacing: '-0.02em', color: 'var(--text)',
              }}>
                {c.overall}
              </span>
              <span style={{
                fontFamily: 'DM Mono, monospace',
                fontSize: '0.6rem', color: 'var(--text3)', marginLeft: '2px',
              }}>
                /100
              </span>
            </div>

            <span style={{
              display: 'inline-flex', alignItems: 'center',
              padding: '0.2rem 0.55rem', borderRadius: '9999px',
              background: c.status === 'assessed' ? 'var(--green-dim)' : 'var(--gold-dim)',
              border: c.status === 'assessed' ? '1px solid rgba(0,214,143,0.2)' : '1px solid rgba(240,165,0,0.2)',
              fontFamily: 'DM Mono, monospace', fontSize: '0.6rem',
              color: c.status === 'assessed' ? 'var(--green)' : 'var(--gold)',
              textTransform: 'uppercase', letterSpacing: '0.06em',
            }}>
              {c.status}
            </span>

            <span style={{
              display: 'inline-flex', alignItems: 'center',
              padding: '0.2rem 0.55rem', borderRadius: '4px',
              background: bgStyle(c.background).bg,
              border: bgStyle(c.background).border,
              fontFamily: 'DM Mono, monospace', fontSize: '0.6rem',
              color: bgStyle(c.background).color,
            }}>
              {c.background}
            </span>
          </div>
        ))}
      </div>

      {/* Drawer */}
      {selected && (
        <CandidateDrawer
          candidate={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  )
}