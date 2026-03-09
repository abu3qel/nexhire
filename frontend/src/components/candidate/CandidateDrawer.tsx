'use client'

import { useState } from 'react'
import { Candidate } from '@/types'
import ScoreBar from '@/components/candidate/ScoreBar'

interface CandidateDrawerProps {
  candidate: Candidate | null
  onClose: () => void
}

const MODALITIES = [
  { key: 'resume',    label: 'Resume',    color: 'var(--gold)'  },
  { key: 'github',    label: 'GitHub',    color: 'var(--cyan)'  },
  { key: 'linkedin',  label: 'LinkedIn',  color: 'var(--green)' },
  { key: 'portfolio', label: 'Portfolio', color: 'var(--red)'   },
] as const

const MOCK_MESSAGES = [
  { role: 'assistant', text: 'Hi! I have full context on this candidate. Ask me anything — their technical skills, experience, GitHub activity, or how they compare to the job requirements.' },
]

export default function CandidateDrawer({ candidate, onClose }: CandidateDrawerProps) {
  const [chatOpen, setChatOpen] = useState(false)
  const [messages, setMessages] = useState(MOCK_MESSAGES)
  const [input, setInput] = useState('')

  const handleSend = () => {
    if (!input.trim()) return
    const userMsg = { role: 'user', text: input }
    const aiMsg = {
      role: 'assistant',
      text: `Based on ${candidate?.name}'s profile, their strongest modality is GitHub with a score of ${candidate?.scores.github}/100. Their resume shows strong fundamentals, and their portfolio demonstrates practical experience. Would you like more specific details?`,
    }
    setMessages(prev => [...prev, userMsg, aiMsg])
    setInput('')
  }

  if (!candidate) return null

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          zIndex: 40,
          backdropFilter: 'blur(2px)',
        }}
      />

      {/* Drawer */}
      <div style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        width: chatOpen ? '820px' : '420px',
        background: 'var(--bg2)',
        borderLeft: '1px solid var(--border)',
        zIndex: 50,
        display: 'flex',
        transition: 'width 0.3s ease',
        boxShadow: '-8px 0 40px rgba(0,0,0,0.4)',
      }}>

        {/* ── Candidate Panel ── */}
        <div style={{
          width: '420px',
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          borderRight: chatOpen ? '1px solid var(--border)' : 'none',
          overflowY: 'auto',
        }}>
          {/* Header */}
          <div style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            background: 'var(--bg2)',
            zIndex: 1,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: '38px', height: '38px',
                borderRadius: '10px',
                background: `${candidate.color}20`,
                border: `1px solid ${candidate.color}40`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'Syne, sans-serif',
                fontWeight: 700,
                fontSize: '0.75rem',
                color: candidate.color,
                flexShrink: 0,
              }}>
                {candidate.initials}
              </div>
              <div>
                <p style={{
                  fontFamily: 'Syne, sans-serif',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  color: 'var(--text)',
                }}>
                  {candidate.name}
                </p>
                <p style={{
                  fontFamily: 'DM Mono, monospace',
                  fontSize: '0.62rem',
                  color: 'var(--text3)',
                }}>
                  {candidate.email}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text3)',
                cursor: 'pointer',
                fontSize: '1.2rem',
                lineHeight: 1,
                padding: '0.25rem',
              }}
            >
              ✕
            </button>
          </div>

          {/* Content */}
          <div style={{ padding: '1.5rem', flex: 1 }}>
            {/* Overall score */}
            <div style={{
              background: 'var(--panel)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '1.25rem',
              marginBottom: '1.25rem',
              textAlign: 'center',
            }}>
              <p style={{
                fontFamily: 'DM Mono, monospace',
                fontSize: '0.6rem',
                color: 'var(--text3)',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                marginBottom: '0.5rem',
              }}>
                Overall Score
              </p>
              <p style={{
                fontFamily: 'Syne, sans-serif',
                fontWeight: 800,
                fontSize: '3rem',
                letterSpacing: '-0.05em',
                color: 'var(--text)',
                lineHeight: 1,
              }}>
                {candidate.overall}
                <span style={{ fontSize: '1.2rem', color: 'var(--text3)', fontWeight: 400 }}>/100</span>
              </p>
            </div>

            {/* Modality scores */}
            <div style={{
              background: 'var(--panel)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '1.25rem',
              marginBottom: '1.25rem',
            }}>
              <p style={{
                fontFamily: 'DM Mono, monospace',
                fontSize: '0.6rem',
                color: 'var(--text3)',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                marginBottom: '1rem',
              }}>
                Modality Breakdown
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {MODALITIES.map(m => (
                  <div key={m.key}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '0.3rem',
                    }}>
                      <span style={{
                        fontFamily: 'Instrument Sans, sans-serif',
                        fontSize: '0.8rem',
                        color: 'var(--text2)',
                      }}>
                        {m.label}
                      </span>
                      <span style={{
                        fontFamily: 'DM Mono, monospace',
                        fontSize: '0.75rem',
                        color: m.color,
                        fontWeight: 600,
                      }}>
                        {candidate.scores[m.key]}/100
                      </span>
                    </div>
                    <ScoreBar value={candidate.scores[m.key]} color={m.color} showValue={false} />
                  </div>
                ))}
              </div>
            </div>

            {/* Links */}
            <div style={{
              background: 'var(--panel)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '1.25rem',
              marginBottom: '1.25rem',
            }}>
              <p style={{
                fontFamily: 'DM Mono, monospace',
                fontSize: '0.6rem',
                color: 'var(--text3)',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                marginBottom: '0.75rem',
              }}>
                Profiles
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {candidate.githubUrl && (
                  <a href={candidate.githubUrl} target="_blank" rel="noreferrer" style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    fontFamily: 'DM Mono, monospace', fontSize: '0.72rem',
                    color: 'var(--cyan)', textDecoration: 'none',
                  }}>
                    ⌥ GitHub Profile →
                  </a>
                )}
                {candidate.linkedinUrl && (
                  <a href={candidate.linkedinUrl} target="_blank" rel="noreferrer" style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    fontFamily: 'DM Mono, monospace', fontSize: '0.72rem',
                    color: 'var(--green)', textDecoration: 'none',
                  }}>
                    in LinkedIn Profile →
                  </a>
                )}
                {candidate.portfolioUrl && (
                  <a href={candidate.portfolioUrl} target="_blank" rel="noreferrer" style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    fontFamily: 'DM Mono, monospace', fontSize: '0.72rem',
                    color: 'var(--gold)', textDecoration: 'none',
                  }}>
                    ◈ Portfolio →
                  </a>
                )}
              </div>
            </div>

            {/* Background badge */}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <span style={{
                padding: '0.3rem 0.8rem',
                borderRadius: '6px',
                background: 'var(--gold-dim)',
                border: '1px solid rgba(240,165,0,0.2)',
                fontFamily: 'DM Mono, monospace',
                fontSize: '0.62rem',
                color: 'var(--gold)',
                textTransform: 'uppercase',
              }}>
                {candidate.background}
              </span>
              <span style={{
                padding: '0.3rem 0.8rem',
                borderRadius: '6px',
                background: candidate.status === 'assessed' ? 'var(--green-dim)' : 'var(--gold-dim)',
                border: candidate.status === 'assessed' ? '1px solid rgba(0,214,143,0.2)' : '1px solid rgba(240,165,0,0.2)',
                fontFamily: 'DM Mono, monospace',
                fontSize: '0.62rem',
                color: candidate.status === 'assessed' ? 'var(--green)' : 'var(--gold)',
                textTransform: 'uppercase',
              }}>
                {candidate.status}
              </span>
            </div>
          </div>

          {/* RAG Chat Button */}
          <div style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid var(--border)',
          }}>
            <button
              onClick={() => setChatOpen(!chatOpen)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.6rem',
                padding: '0.7rem',
                borderRadius: '10px',
                background: chatOpen ? 'var(--gold)' : 'var(--gold-dim)',
                border: '1px solid rgba(240,165,0,0.3)',
                color: chatOpen ? '#000' : 'var(--gold)',
                fontFamily: 'Syne, sans-serif',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              {chatOpen ? 'Close AI Chat' : 'Ask AI about Candidate'}
            </button>
          </div>
        </div>

        {/* ── RAG Chat Panel ── */}
        {chatOpen && (
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}>
            {/* Chat header */}
            <div style={{
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
            }}>
              <div style={{
                width: '32px', height: '32px',
                borderRadius: '8px',
                background: 'var(--gold-dim)',
                border: '1px solid rgba(240,165,0,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <svg width="14" height="14" fill="none" stroke="var(--gold)" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <div>
                <p style={{
                  fontFamily: 'Syne, sans-serif',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  color: 'var(--text)',
                }}>
                  AI Candidate Chat
                </p>
                <p style={{
                  fontFamily: 'DM Mono, monospace',
                  fontSize: '0.6rem',
                  color: 'var(--text3)',
                }}>
                  RAG · {candidate.name}'s knowledge base
                </p>
              </div>
            </div>

            {/* Messages */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}>
              {messages.map((msg, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  }}
                >
                  <div style={{
                    maxWidth: '85%',
                    padding: '0.75rem 1rem',
                    borderRadius: msg.role === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                    background: msg.role === 'user' ? 'var(--gold)' : 'var(--panel)',
                    border: msg.role === 'user' ? 'none' : '1px solid var(--border)',
                    color: msg.role === 'user' ? '#000' : 'var(--text)',
                    fontSize: '0.82rem',
                    lineHeight: 1.6,
                    fontFamily: 'Instrument Sans, sans-serif',
                  }}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div style={{
              padding: '1rem 1.25rem',
              borderTop: '1px solid var(--border)',
              display: 'flex',
              gap: '0.75rem',
            }}>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder={`Ask about ${candidate.name}...`}
                style={{
                  flex: 1,
                  background: 'var(--panel)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  color: 'var(--text)',
                  fontFamily: 'Instrument Sans, sans-serif',
                  fontSize: '0.82rem',
                  padding: '0.6rem 0.9rem',
                  outline: 'none',
                }}
              />
              <button
                onClick={handleSend}
                style={{
                  padding: '0.6rem 1rem',
                  borderRadius: '8px',
                  background: 'var(--gold)',
                  border: 'none',
                  color: '#000',
                  fontFamily: 'Syne, sans-serif',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                }}
              >
                Send
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}