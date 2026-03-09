'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

const TYPING_WORDS = ['Resumes', 'GitHub', 'LinkedIn', 'Portfolios']

function TypingEffect() {
  const [wordIndex, setWordIndex] = useState(0)
  const [displayed, setDisplayed] = useState('')
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const word = TYPING_WORDS[wordIndex]
    let timeout: NodeJS.Timeout

    if (!deleting && displayed.length < word.length) {
      timeout = setTimeout(() => setDisplayed(word.slice(0, displayed.length + 1)), 80)
    } else if (!deleting && displayed.length === word.length) {
      timeout = setTimeout(() => setDeleting(true), 1800)
    } else if (deleting && displayed.length > 0) {
      timeout = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 40)
    } else if (deleting && displayed.length === 0) {
      setDeleting(false)
      setWordIndex((i) => (i + 1) % TYPING_WORDS.length)
    }

    return () => clearTimeout(timeout)
  }, [displayed, deleting, wordIndex])

  return (
    <span style={{ color: 'var(--gold)' }}>
      {displayed}
      <span
        style={{
          display: 'inline-block',
          width: '3px',
          height: '1em',
          background: 'var(--gold)',
          marginLeft: '2px',
          verticalAlign: 'middle',
          animation: 'blink 1s step-end infinite',
        }}
      />
    </span>
  )
}

function useScrollFade() {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.15 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return { ref, visible }
}

function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const { ref, visible } = useScrollFade()
  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(28px)',
        transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}

// Animated dot grid
function DotGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animFrame: number
    let time = 0

    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const spacing = 36
      const cols = Math.ceil(canvas.width / spacing)
      const rows = Math.ceil(canvas.height / spacing)

      for (let i = 0; i <= cols; i++) {
        for (let j = 0; j <= rows; j++) {
          const x = i * spacing
          const y = j * spacing
          const dist = Math.sqrt(
            Math.pow(x - canvas.width / 2, 2) +
            Math.pow(y - canvas.height / 2, 2)
          )
          const wave = Math.sin(dist * 0.015 - time * 0.03) * 0.5 + 0.5
          const alpha = wave * 0.35
          const radius = wave * 1.8 + 0.4

          ctx.beginPath()
          ctx.arc(x, y, radius, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(240, 165, 0, ${alpha})`
          ctx.fill()
        }
      }

      time++
      animFrame = requestAnimationFrame(draw)
    }

    draw()
    return () => {
      cancelAnimationFrame(animFrame)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        opacity: 0.6,
        pointerEvents: 'none',
      }}
    />
  )
}

const STEPS = [
  {
    num: '01',
    title: 'Upload Candidates',
    desc: 'Upload resumes in PDF or DOCX format and add GitHub, LinkedIn, and portfolio links.',
  },
  {
    num: '02',
    title: 'Multi-Modal Analysis',
    desc: 'Our AI analyses all data sources simultaneously — code quality, credentials, network signals.',
  },
  {
    num: '03',
    title: 'Weighted Scoring',
    desc: 'Each modality is scored and combined using configurable weights tailored to your role.',
  },
  {
    num: '04',
    title: 'Ranked Results',
    desc: 'Get a ranked candidate list with full score breakdowns and bias detection reports.',
  },
]

const MODALITIES = [
  {
    icon: '📄',
    label: 'Resume',
    color: '#f0a500',
    title: 'Resume Analysis',
    desc: 'NLP-powered parsing extracts skills, experience, education and certifications with 85%+ accuracy — far beyond keyword matching.',
    tags: ['NLP Parsing', 'Skill Extraction', 'NER'],
  },
  {
    icon: '⌥',
    label: 'GitHub',
    color: '#00c8d4',
    title: 'GitHub Evaluation',
    desc: 'Analyse commit history, code quality, language proficiency, and open-source contributions as objective capability signals.',
    tags: ['Commit Analysis', 'Code Quality', 'Collaboration'],
  },
  {
    icon: 'in',
    label: 'LinkedIn',
    color: '#00d68f',
    title: 'LinkedIn Profiling',
    desc: 'Extract peer endorsements, verified skills, professional network signals and employment history to contextualise resume claims.',
    tags: ['Endorsements', 'Network Signals', 'Verification'],
  },
  {
    icon: '◈',
    label: 'Portfolio',
    color: '#ff4d6d',
    title: 'Portfolio Assessment',
    desc: 'Evaluate project complexity, technologies used, documentation quality and design execution from personal websites and GitHub Pages.',
    tags: ['Project Complexity', 'Tech Stack', 'Documentation'],
  },
]

export default function HomePage() {
  return (
    <div style={{ overflowX: 'hidden' }}>
      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
      `}</style>

      {/* ── HERO ── */}
      <section
        style={{
          position: 'relative',
          minHeight: '88vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        <DotGrid />

        {/* Glow */}
        <div style={{
          position: 'absolute',
          top: '20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '600px',
          height: '300px',
          background: 'radial-gradient(ellipse, rgba(240,165,0,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{
          position: 'relative',
          zIndex: 1,
          textAlign: 'center',
          padding: '0 1.5rem',
          maxWidth: '820px',
        }}>
          {/* Label */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.35rem 1rem',
            borderRadius: '9999px',
            background: 'var(--gold-dim)',
            border: '1px solid rgba(240,165,0,0.2)',
            marginBottom: '2rem',
          }}>
            <span style={{
              width: '6px', height: '6px',
              borderRadius: '50%',
              background: 'var(--gold)',
              display: 'inline-block',
              boxShadow: '0 0 6px var(--gold)',
            }} />
            <span style={{
              fontFamily: 'DM Mono, monospace',
              fontSize: '0.65rem',
              color: 'var(--gold)',
              letterSpacing: '0.1em',
            }}>
              QMUL FINAL YEAR PROJECT 2024/25
            </span>
          </div>

          {/* Headline */}
          <h1 style={{
            fontFamily: 'Syne, sans-serif',
            fontWeight: 800,
            fontSize: 'clamp(2.4rem, 6vw, 4.2rem)',
            lineHeight: 1.1,
            letterSpacing: '-0.04em',
            color: 'var(--text)',
            marginBottom: '1.5rem',
          }}>
            Hire better with<br />
            <TypingEffect />
          </h1>

          {/* Subheadline */}
          <p style={{
            fontSize: 'clamp(0.95rem, 2vw, 1.1rem)',
            color: 'var(--text2)',
            lineHeight: 1.7,
            maxWidth: '560px',
            margin: '0 auto 2.5rem',
          }}>
            Multi-modal AI assessment that goes beyond resumes — integrating
            GitHub, LinkedIn, and portfolios to rank technical candidates with
            accuracy and fairness.
          </p>

          {/* CTAs */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              href="/upload"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.8rem',
                borderRadius: '9999px',
                background: 'var(--gold)',
                color: '#000',
                fontFamily: 'Syne, sans-serif',
                fontWeight: 700,
                fontSize: '0.9rem',
                textDecoration: 'none',
                transition: 'all 0.2s',
                boxShadow: '0 4px 24px rgba(240,165,0,0.3)',
              }}
            >
              Get Started →
            </Link>
            <Link
              href="/dashboard"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.8rem',
                borderRadius: '9999px',
                background: 'transparent',
                color: 'var(--text2)',
                fontFamily: 'Syne, sans-serif',
                fontWeight: 600,
                fontSize: '0.9rem',
                textDecoration: 'none',
                border: '1px solid var(--border2)',
                transition: 'all 0.2s',
              }}
            >
              View Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ padding: '6rem 2rem', maxWidth: '1100px', margin: '0 auto' }}>
        <FadeIn>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <p style={{
              fontFamily: 'DM Mono, monospace',
              fontSize: '0.65rem',
              color: 'var(--gold)',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              marginBottom: '0.75rem',
            }}>
              HOW IT WORKS
            </p>
            <h2 style={{
              fontFamily: 'Syne, sans-serif',
              fontWeight: 800,
              fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
              letterSpacing: '-0.03em',
              color: 'var(--text)',
            }}>
              From upload to ranked results
            </h2>
          </div>
        </FadeIn>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '0',
          position: 'relative',
        }}>
          {/* Connecting line */}
          <div style={{
            position: 'absolute',
            top: '28px',
            left: '12.5%',
            right: '12.5%',
            height: '1px',
            background: 'linear-gradient(90deg, var(--gold), var(--border2), var(--border2), var(--gold))',
            zIndex: 0,
          }} />

          {STEPS.map((step, i) => (
            <FadeIn key={step.num} delay={i * 120}>
              <div style={{
                padding: '0 1.5rem',
                textAlign: 'center',
                position: 'relative',
                zIndex: 1,
              }}>
                {/* Step circle */}
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: i === 0 ? 'var(--gold)' : 'var(--panel)',
                  border: i === 0 ? 'none' : '1px solid var(--border2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.5rem',
                  boxShadow: i === 0 ? '0 0 24px rgba(240,165,0,0.3)' : 'none',
                }}>
                  <span style={{
                    fontFamily: 'DM Mono, monospace',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    color: i === 0 ? '#000' : 'var(--text3)',
                  }}>
                    {step.num}
                  </span>
                </div>

                <h3 style={{
                  fontFamily: 'Syne, sans-serif',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  color: 'var(--text)',
                  marginBottom: '0.6rem',
                  letterSpacing: '-0.01em',
                }}>
                  {step.title}
                </h3>
                <p style={{
                  fontSize: '0.8rem',
                  color: 'var(--text3)',
                  lineHeight: 1.65,
                }}>
                  {step.desc}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ── MODALITIES ── */}
      <section style={{
        padding: '6rem 2rem',
        background: 'var(--bg2)',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <FadeIn>
            <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
              <p style={{
                fontFamily: 'DM Mono, monospace',
                fontSize: '0.65rem',
                color: 'var(--gold)',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                marginBottom: '0.75rem',
              }}>
                DATA MODALITIES
              </p>
              <h2 style={{
                fontFamily: 'Syne, sans-serif',
                fontWeight: 800,
                fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
                letterSpacing: '-0.03em',
                color: 'var(--text)',
              }}>
                Four signals, one ranking
              </h2>
              <p style={{
                color: 'var(--text2)',
                fontSize: '0.95rem',
                marginTop: '0.75rem',
                maxWidth: '480px',
                margin: '0.75rem auto 0',
                lineHeight: 1.6,
              }}>
                Each modality captures a different dimension of candidate capability.
              </p>
            </div>
          </FadeIn>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '1.25rem',
          }}>
            {MODALITIES.map((m, i) => (
              <FadeIn key={m.label} delay={i * 100}>
                <div
                  style={{
                    background: 'var(--panel)',
                    border: '1px solid var(--border)',
                    borderRadius: '14px',
                    padding: '1.8rem',
                    transition: 'border-color 0.2s, transform 0.2s',
                    cursor: 'default',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLDivElement).style.borderColor = m.color
                    ;(e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)'
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)'
                    ;(e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'
                  }}
                >
                  {/* Icon + label */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                    <div style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '10px',
                      background: `${m.color}18`,
                      border: `1px solid ${m.color}33`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1rem',
                      fontFamily: 'DM Mono, monospace',
                      fontWeight: 700,
                      color: m.color,
                      flexShrink: 0,
                    }}>
                      {m.icon}
                    </div>
                    <div>
                      <div style={{
                        fontFamily: 'DM Mono, monospace',
                        fontSize: '0.6rem',
                        color: m.color,
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        marginBottom: '0.2rem',
                      }}>
                        {m.label}
                      </div>
                      <div style={{
                        fontFamily: 'Syne, sans-serif',
                        fontWeight: 700,
                        fontSize: '1rem',
                        color: 'var(--text)',
                        letterSpacing: '-0.02em',
                      }}>
                        {m.title}
                      </div>
                    </div>
                  </div>

                  <p style={{
                    fontSize: '0.82rem',
                    color: 'var(--text2)',
                    lineHeight: 1.65,
                    marginBottom: '1.2rem',
                  }}>
                    {m.desc}
                  </p>

                  {/* Tags */}
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                    {m.tags.map(tag => (
                      <span key={tag} style={{
                        padding: '0.2rem 0.6rem',
                        borderRadius: '4px',
                        background: 'var(--bg3)',
                        border: '1px solid var(--border)',
                        fontFamily: 'DM Mono, monospace',
                        fontSize: '0.62rem',
                        color: 'var(--text3)',
                      }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── BOTTOM CTA ── */}
      <section style={{ padding: '6rem 2rem', textAlign: 'center' }}>
        <FadeIn>
          <div style={{
            maxWidth: '560px',
            margin: '0 auto',
          }}>
            <h2 style={{
              fontFamily: 'Syne, sans-serif',
              fontWeight: 800,
              fontSize: 'clamp(1.8rem, 4vw, 2.6rem)',
              letterSpacing: '-0.03em',
              color: 'var(--text)',
              marginBottom: '1rem',
            }}>
              Ready to assess smarter?
            </h2>
            <p style={{
              color: 'var(--text2)',
              fontSize: '0.95rem',
              lineHeight: 1.6,
              marginBottom: '2rem',
            }}>
              Upload your first batch of candidates and see the difference
              multi-modal assessment makes.
            </p>
            <Link
              href="/upload"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.85rem 2.2rem',
                borderRadius: '9999px',
                background: 'var(--gold)',
                color: '#000',
                fontFamily: 'Syne, sans-serif',
                fontWeight: 700,
                fontSize: '0.95rem',
                textDecoration: 'none',
                boxShadow: '0 4px 32px rgba(240,165,0,0.25)',
                transition: 'all 0.2s',
              }}
            >
              Start Assessing →
            </Link>
          </div>
        </FadeIn>
      </section>
    </div>
  )
}