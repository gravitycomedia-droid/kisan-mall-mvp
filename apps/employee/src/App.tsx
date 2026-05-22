export default function App() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#FAF6EE',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: '"Plus Jakarta Sans", sans-serif',
        gap: '8px',
      }}
    >
      {/* Kisan Logo */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <span
          style={{
            fontSize: 32,
            fontWeight: 800,
            color: '#E91E8C',
            letterSpacing: '-0.02em',
          }}
        >
          KISAN
        </span>
        <span
          style={{
            fontSize: 10,
            fontWeight: 500,
            color: '#6B7280',
            letterSpacing: '0.2em',
          }}
        >
          FASHION MALL
        </span>
      </div>

      <div style={{ height: 24 }} />

      <div
        style={{
          background: '#1F7A4E',
          color: '#fff',
          padding: '12px 32px',
          borderRadius: 12,
          fontSize: 14,
          fontWeight: 600,
        }}
      >
        ✅ Employee App — Phase 0 Running
      </div>

      <p style={{ color: '#6B7280', fontSize: 13, marginTop: 8 }}>
        Port 3000 · Firebase Connected · Phase 1 coming next
      </p>
    </div>
  )
}
