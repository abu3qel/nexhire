'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

// ── Types ──
interface ParsedCandidate {
  id: string
  fileName: string
  status: 'parsing' | 'done'
  parsingStep: string
  name: string
  email: string
  github: string
  linkedin: string
  portfolio: string
}

const PARSING_STEPS = [
  'Reading document...',
  'Extracting candidate info...',
  'Scanning for GitHub profile...',
  'Detecting LinkedIn URL...',
  'Looking for portfolio links...',
  'Running NLP analysis...',
  'Assessment ready ✓',
]

// Mock parsed data per file
const MOCK_PARSED: Record<number, Partial<ParsedCandidate>> = {
  0: { name: 'Ahmed Al-Rashid',  email: 'ahmed@example.com',  github: 'github.com/ahmed',   linkedin: 'linkedin.com/in/ahmed',   portfolio: 'ahmed.dev' },
  1: { name: 'Sarah Chen',       email: 'sarah@example.com',  github: 'github.com/sarahc',  linkedin: '',                         portfolio: 'sarahchen.io' },
  2: { name: 'James Okafor',     email: 'james@example.com',  github: '',                   linkedin: 'linkedin.com/in/james',   portfolio: '' },
  3: { name: 'Priya Sharma',     email: 'priya@example.com',  github: 'github.com/priya',   linkedin: 'linkedin.com/in/priya',   portfolio: '' },
}

export default function UploadPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [step, setStep] = useState<1 | 2>(1)
  const [title, setTitle] = useState('')
  const [department, setDepartment] = useState('')
  const [description, setDescription] = useState('')
  const [candidates, setCandidates] = useState<ParsedCandidate[]>([])
  const [dragging, setDragging] = useState(false)

  // ── Simulate parsing ──
  const simulateParsing = (id: string, fileIndex: number) => {
    let stepIndex = 0

    const interval = setInterval(() => {
      if (stepIndex < PARSING_STEPS.length - 1) {
        setCandidates(prev => prev.map(c =>
          c.id === id ? { ...c, parsingStep: PARSING_STEPS[stepIndex] } : c
        ))
        stepIndex++
      } else {
        clearInterval(interval)
        const mock = MOCK_PARSED[fileIndex % 4] || {}
        setCandidates(prev => prev.map(c =>
          c.id === id
            ? {
                ...c,
                status: 'done',
                parsingStep: PARSING_STEPS[PARSING_STEPS.length - 1],
                name: mock.name || '',
                email: mock.email || '',
                github: mock.github || '',
                linkedin: mock.linkedin || '',
                portfolio: mock.portfolio || '',
              }
            : c
        ))
      }
    }, 400)
  }

  const handleFiles = (files: FileList) => {
    const newCandidates: ParsedCandidate[] = Array.from(files).map((file, i) => ({
      id: `${Date.now()}-${i}`,
      fileName: file.name,
      status: 'parsing',
      parsingStep: PARSING_STEPS[0],
      name: '', email: '', github: '', linkedin: '', portfolio: '',
    }))
    setCandidates(prev => {
      const updated = [...prev, ...newCandidates]
      newCandidates.forEach((c, i) => {
        setTimeout(() => simulateParsing(c.id, prev.length + i), i * 600)
      })
      return updated
    })
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files)
  }

  const updateCandidate = (id: string, field: string, value: string) => {
    setCandidates(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c))
  }

  const removeCandidate = (id: string) => {
    setCandidates(prev => prev.filter(c => c.id !== id))
  }

  const handleSubmit = () => {
    router.push('/dashboard/roles/role-1')
  }

  const allDone = candidates.length > 0 && candidates.every(c => c.status === 'done')

  // ── Input style ──
  const inputStyle = {
    width: '100%',
    background: 'var(--bg3)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    color: 'var(--text)',
    fontFamily: 'Instrument Sans, sans-serif',
    fontSize: '0.85rem',
    padding: '0.6rem 0.9rem',
    outline: 'none',
  }

  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '2.5rem 2rem' }}>

      {/* Header */}
      <div style={{ marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border)' }}>
        <p style={{
          fontFamily: 'DM Mono, monospace', fontSize: '0.62rem',
          color: 'var(--gold)', letterSpacing: '0.12em',
          textTransform: 'uppercase', marginBottom: '0.4rem',
        }}>
          New Role
        </p>
        <h1 style={{
          fontFamily: 'Syne, sans-serif', fontWeight: 800,
          fontSize: '1.8rem', letterSpacing: '-0.03em', color: 'var(--text)',
        }}>
          {step === 1 ? 'Create Job Role' : 'Upload Candidates'}
        </h1>
        <p style={{ color: 'var(--text2)', fontSize: '0.85rem', marginTop: '0.3rem' }}>
          {step === 1
            ? 'Define the role before uploading candidate CVs'
            : `${title} · Upload CVs and we'll extract candidate details automatically`}
        </p>
      </div>

      {/* Step indicator */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0',
        marginBottom: '2rem',
        background: 'var(--panel)',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        overflow: 'hidden',
        width: 'fit-content',
      }}>
        {[
          { num: '01', label: 'Role Details' },
          { num: '02', label: 'Upload CVs' },
        ].map((s, i) => {
          const isActive = step === i + 1
          const isDone = step > i + 1
          return (
            <div
              key={s.num}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.5rem 1.2rem',
                borderRight: i === 0 ? '1px solid var(--border)' : 'none',
                background: isActive ? 'var(--gold-dim)' : 'transparent',
                fontFamily: 'DM Mono, monospace', fontSize: '0.68rem',
                color: isActive ? 'var(--gold)' : isDone ? 'var(--green)' : 'var(--text3)',
              }}
            >
              <span style={{
                width: '18px', height: '18px',
                borderRadius: '4px',
                background: isActive ? 'var(--gold)' : isDone ? 'var(--green)' : 'var(--border2)',
                color: isActive || isDone ? '#000' : 'var(--text3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.6rem', fontWeight: 700,
              }}>
                {isDone ? '✓' : s.num}
              </span>
              {s.label}
            </div>
          )
        })}
      </div>

      {/* ── STEP 1 ── */}
      {step === 1 && (
        <div style={{
          background: 'var(--panel)',
          border: '1px solid var(--border)',
          borderRadius: '14px',
          padding: '1.75rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
        }}>
          {/* Title */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{
              fontFamily: 'DM Mono, monospace', fontSize: '0.62rem',
              color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em',
            }}>
              Job Title *
            </label>
            <input
              style={inputStyle}
              placeholder="e.g. Senior Frontend Engineer"
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
          </div>

          {/* Department */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{
              fontFamily: 'DM Mono, monospace', fontSize: '0.62rem',
              color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em',
            }}>
              Department *
            </label>
            <input
              style={inputStyle}
              placeholder="e.g. Engineering"
              value={department}
              onChange={e => setDepartment(e.target.value)}
            />
          </div>

          {/* Description */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{
              fontFamily: 'DM Mono, monospace', fontSize: '0.62rem',
              color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em',
            }}>
              Job Description *
            </label>
            <textarea
              style={{
                ...inputStyle,
                height: '160px',
                resize: 'none',
                lineHeight: 1.6,
              }}
              placeholder="Paste the full job description here..."
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          {/* Continue */}
          <button
            onClick={() => title && department && description && setStep(2)}
            style={{
              alignSelf: 'flex-end',
              padding: '0.65rem 1.8rem',
              borderRadius: '9999px',
              background: title && department && description ? 'var(--gold)' : 'var(--border)',
              color: title && department && description ? '#000' : 'var(--text3)',
              fontFamily: 'Syne, sans-serif',
              fontWeight: 700, fontSize: '0.88rem',
              border: 'none', cursor: title && department && description ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s',
            }}
          >
            Continue →
          </button>
        </div>
      )}

      {/* ── STEP 2 ── */}
      {step === 2 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* Drop zone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={e => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            style={{
              border: `2px dashed ${dragging ? 'var(--gold)' : 'var(--border2)'}`,
              borderRadius: '14px',
              padding: '3rem 2rem',
              textAlign: 'center',
              cursor: 'pointer',
              background: dragging ? 'var(--gold-dim)' : 'var(--gold-dim2)',
              transition: 'all 0.2s',
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.docx"
              style={{ display: 'none' }}
              onChange={e => e.target.files && handleFiles(e.target.files)}
            />
            <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>📄</div>
            <p style={{
              fontFamily: 'Syne, sans-serif', fontWeight: 700,
              fontSize: '1rem', color: 'var(--text)', marginBottom: '0.3rem',
            }}>
              Drop CV files here
            </p>
            <p style={{ fontSize: '0.78rem', color: 'var(--text3)' }}>
              PDF or DOCX · Multiple files supported
            </p>
          </div>

          {/* Parsed candidates */}
          {candidates.map(c => (
            <div
              key={c.id}
              style={{
                background: 'var(--panel)',
                border: `1px solid ${c.status === 'done' ? 'var(--border2)' : 'var(--border)'}`,
                borderRadius: '14px',
                padding: '1.5rem',
                transition: 'border-color 0.3s',
              }}
            >
              {/* File header */}
              <div style={{
                display: 'flex', alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1.25rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    width: '36px', height: '36px',
                    borderRadius: '8px',
                    background: 'var(--gold-dim)',
                    border: '1px solid rgba(240,165,0,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1rem',
                  }}>
                    📄
                  </div>
                  <div>
                    <p style={{
                      fontFamily: 'DM Mono, monospace', fontSize: '0.72rem',
                      color: 'var(--text)', fontWeight: 500,
                    }}>
                      {c.fileName}
                    </p>
                    <p style={{
                      fontFamily: 'DM Mono, monospace', fontSize: '0.62rem',
                      color: c.status === 'done' ? 'var(--green)' : 'var(--gold)',
                      marginTop: '0.15rem',
                    }}>
                      {c.parsingStep}
                    </p>
                  </div>
                </div>

                {c.status === 'parsing' ? (
                  /* Parsing progress bar */
                  <div style={{
                    width: '120px', height: '4px',
                    background: 'var(--border)',
                    borderRadius: '2px', overflow: 'hidden',
                  }}>
                    <div style={{
                      height: '100%',
                      background: 'var(--gold)',
                      borderRadius: '2px',
                      animation: 'parsing 2.4s ease infinite',
                    }} />
                  </div>
                ) : (
                  <button
                    onClick={() => removeCandidate(c.id)}
                    style={{
                      background: 'transparent', border: 'none',
                      color: 'var(--text3)', cursor: 'pointer', fontSize: '1rem',
                    }}
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Parsed fields */}
              {c.status === 'done' && (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0.75rem',
                }}>
                  {[
                    { key: 'name',      label: 'Full Name',      placeholder: 'Not detected — enter manually' },
                    { key: 'email',     label: 'Email',          placeholder: 'Not detected — enter manually' },
                    { key: 'github',    label: 'GitHub',         placeholder: 'Not found — enter manually' },
                    { key: 'linkedin',  label: 'LinkedIn',       placeholder: 'Not found — enter manually' },
                    { key: 'portfolio', label: 'Portfolio',      placeholder: 'Not found — enter manually' },
                  ].map(field => (
                    <div key={field.key} style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                      <label style={{
                        fontFamily: 'DM Mono, monospace', fontSize: '0.58rem',
                        color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em',
                        display: 'flex', alignItems: 'center', gap: '0.3rem',
                      }}>
                        {field.label}
                        {(c as any)[field.key] ? (
                          <span style={{ color: 'var(--green)', fontSize: '0.6rem' }}>✓ detected</span>
                        ) : (
                          <span style={{ color: 'var(--red)', fontSize: '0.6rem' }}>✗ not found</span>
                        )}
                      </label>
                      <input
                        style={{
                          ...inputStyle,
                          borderColor: (c as any)[field.key] ? 'var(--border)' : 'rgba(255,77,109,0.3)',
                          fontSize: '0.8rem',
                          padding: '0.5rem 0.75rem',
                        }}
                        value={(c as any)[field.key]}
                        placeholder={field.placeholder}
                        onChange={e => updateCandidate(c.id, field.key, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Skeleton while parsing */}
              {c.status === 'parsing' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {[100, 70, 85, 60].map((w, i) => (
                    <div key={i} style={{
                      height: '32px', borderRadius: '6px',
                      background: 'var(--border)',
                      width: `${w}%`,
                      animation: 'pulse 1.5s ease infinite',
                    }} />
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Submit */}
          {allDone && (
            <button
              onClick={handleSubmit}
              style={{
                width: '100%',
                padding: '0.85rem',
                borderRadius: '9999px',
                background: 'var(--gold)',
                color: '#000',
                fontFamily: 'Syne, sans-serif',
                fontWeight: 700, fontSize: '0.95rem',
                border: 'none', cursor: 'pointer',
                boxShadow: '0 4px 24px rgba(240,165,0,0.25)',
                transition: 'all 0.2s',
              }}
            >
              Create Role & Assess {candidates.length} Candidate{candidates.length > 1 ? 's' : ''} →
            </button>
          )}
        </div>
      )}

      {/* Animations */}
      <style>{`
        @keyframes parsing {
          0% { width: 0%; }
          50% { width: 80%; }
          100% { width: 100%; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
      `}</style>
    </div>
  )
}