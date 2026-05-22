export default function App() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#F8F9FA',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: '"Plus Jakarta Sans", sans-serif',
      }}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: 20,
          padding: '48px 64px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 12,
        }}
      >
        {/* Kisan Logo */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{ fontSize: 28, fontWeight: 800, color: '#E91E8C', letterSpacing: '-0.02em' }}>
            KISAN
          </span>
          <span style={{ fontSize: 9, fontWeight: 500, color: '#6B7280', letterSpacing: '0.2em' }}>
            FASHION MALL
          </span>
        </div>

        <div style={{ height: 16 }} />

        <div
          style={{
            background: '#1F7A4E',
            color: '#fff',
            padding: '12px 32px',
            borderRadius: 10,
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          ✅ Admin Dashboard — Phase 0 Running
        </div>

        <p style={{ color: '#6B7280', fontSize: 13 }}>
          Port 3001 · Firebase Connected · Phase 2 coming next
        </p>
      </div>
    </div>
  )
}
