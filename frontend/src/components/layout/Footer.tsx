import Link from 'next/link'

export default function Footer() {
  return (
    <footer
      style={{
        borderTop: '1px solid var(--border)',
        background: 'var(--bg2)',
        padding: '3rem 0 1.5rem',
        marginTop: '4rem',
      }}
    >
      <div
        style={{
          maxWidth: '1100px',
          margin: '0 auto',
          padding: '0 2rem',
        }}
      >
        {/* Top grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr 1fr 1fr',
            gap: '2.5rem',
            marginBottom: '3rem',
          }}
        >
          {/* Brand col */}
          <div>
            <div className="flex items-center gap-2.5" style={{ marginBottom: '1rem' }}>
              <div
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  background: 'var(--gold)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <span style={{
                  fontFamily: 'Syne, sans-serif',
                  fontWeight: 800,
                  fontSize: '0.65rem',
                  color: '#000',
                }}>NH</span>
              </div>
              <span style={{
                fontFamily: 'Syne, sans-serif',
                fontWeight: 700,
                fontSize: '0.95rem',
                color: 'var(--text)',
              }}>
                Nex<span style={{ color: 'var(--gold)' }}>Hire</span>
              </span>
            </div>
            <p style={{
              fontSize: '0.8rem',
              color: 'var(--text3)',
              lineHeight: 1.7,
              maxWidth: '240px',
            }}>
              AI-powered multi-modal candidate assessment for modern technical recruitment.
            </p>
            {/* Status badge */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                marginTop: '1rem',
                padding: '0.3rem 0.8rem',
                borderRadius: '9999px',
                background: 'var(--green-dim)',
                border: '1px solid rgba(0,214,143,0.2)',
              }}
            >
              <span style={{
                width: '6px', height: '6px',
                borderRadius: '50%',
                background: 'var(--green)',
                display: 'inline-block',
                boxShadow: '0 0 6px var(--green)',
              }} />
              <span style={{
                fontFamily: 'DM Mono, monospace',
                fontSize: '0.62rem',
                color: 'var(--green)',
              }}>
                ALL SYSTEMS OPERATIONAL
              </span>
            </div>
          </div>

          {/* Platform col */}
          <div>
            <h4 style={{
              fontFamily: 'Syne, sans-serif',
              fontWeight: 600,
              fontSize: '0.78rem',
              color: 'var(--text)',
              marginBottom: '1rem',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}>
              Platform
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {['Dashboard', 'Upload Candidates', 'Bias Report'].map((item) => (
                <Link
                  key={item}
                  href="#"
                  style={{
                    fontSize: '0.82rem',
                    color: 'var(--text3)',
                    textDecoration: 'none',
                    transition: 'color 0.2s',
                  }}
                >
                  {item}
                </Link>
              ))}
            </div>
          </div>

          {/* Assessment col */}
          <div>
            <h4 style={{
              fontFamily: 'Syne, sans-serif',
              fontWeight: 600,
              fontSize: '0.78rem',
              color: 'var(--text)',
              marginBottom: '1rem',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}>
              Assessment
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {['Resume Analysis', 'GitHub Evaluation', 'LinkedIn Profile', 'Portfolio Review'].map((item) => (
                <span
                  key={item}
                  style={{
                    fontSize: '0.82rem',
                    color: 'var(--text3)',
                  }}
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* Project col */}
          <div>
            <h4 style={{
              fontFamily: 'Syne, sans-serif',
              fontWeight: 600,
              fontSize: '0.78rem',
              color: 'var(--text)',
              marginBottom: '1rem',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}>
              Project
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {['QMUL Final Year Project', 'BSc CS with AI', 'Supervisor: Mr Haris Zia', 'v0.1.0 Beta'].map((item) => (
                <span
                  key={item}
                  style={{
                    fontSize: '0.82rem',
                    color: 'var(--text3)',
                  }}
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{
            fontFamily: 'DM Mono, monospace',
            fontSize: '0.65rem',
            color: 'var(--text3)',
          }}>
            © 2025 NexHire — Naif Mohammed Alaqeili
          </span>
          <span style={{
            fontFamily: 'DM Mono, monospace',
            fontSize: '0.65rem',
            color: 'var(--text3)',
          }}>
            QMUL · School of Electronic Engineering and Computer Science
          </span>
        </div>
      </div>
    </footer>
  )
}