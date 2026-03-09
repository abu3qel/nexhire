interface StatCardProps {
  label: string
  value: string
  delta: string
  color: string
}

export default function StatCard({ label, value, delta, color }: StatCardProps) {
  return (
    <div style={{
      background: 'var(--panel)',
      border: '1px solid var(--border)',
      borderRadius: '12px',
      padding: '1.2rem 1.4rem',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0,
        height: '2px',
        background: color,
      }} />
      <p style={{
        fontFamily: 'DM Mono, monospace',
        fontSize: '0.6rem',
        color: 'var(--text3)',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        marginBottom: '0.5rem',
      }}>
        {label}
      </p>
      <p style={{
        fontFamily: 'Syne, sans-serif',
        fontWeight: 800,
        fontSize: '1.8rem',
        letterSpacing: '-0.04em',
        color: 'var(--text)',
        lineHeight: 1,
        marginBottom: '0.4rem',
      }}>
        {value}
      </p>
      <p style={{
        fontFamily: 'DM Mono, monospace',
        fontSize: '0.62rem',
        color: color,
      }}>
        {delta}
      </p>
    </div>
  )
}