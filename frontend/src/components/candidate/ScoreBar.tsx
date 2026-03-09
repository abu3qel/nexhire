interface ScoreBarProps {
  value: number
  color: string
  showValue?: boolean
}

export default function ScoreBar({ value, color, showValue = true }: ScoreBarProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      {showValue && (
        <span style={{
          fontFamily: 'DM Mono, monospace',
          fontSize: '0.78rem',
          color: 'var(--text)',
          width: '28px',
          textAlign: 'right',
          flexShrink: 0,
        }}>
          {value}
        </span>
      )}
      <div style={{
        flex: 1,
        height: '4px',
        background: 'var(--border)',
        borderRadius: '2px',
        overflow: 'hidden',
        minWidth: '40px',
      }}>
        <div style={{
          width: `${value}%`,
          height: '100%',
          background: color,
          borderRadius: '2px',
        }} />
      </div>
    </div>
  )
}