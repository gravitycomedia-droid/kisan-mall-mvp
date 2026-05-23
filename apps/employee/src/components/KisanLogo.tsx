interface KisanLogoProps {
  size?: 'sm' | 'md' | 'lg'
}

const sizes = {
  sm: { kisan: 18, mall: 7 },
  md: { kisan: 24, mall: 9 },
  lg: { kisan: 36, mall: 11 },
}

export function KisanLogo({ size = 'md' }: KisanLogoProps) {
  const s = sizes[size]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1 }}>
      <span
        style={{
          fontSize: s.kisan,
          fontWeight: 800,
          color: '#E91E8C',
          letterSpacing: '-0.02em',
          fontFamily: '"Plus Jakarta Sans", sans-serif',
        }}
      >
        KISAN
      </span>
      <span
        style={{
          fontSize: s.mall,
          fontWeight: 500,
          color: '#9CA3AF',
          letterSpacing: '0.18em',
          fontFamily: '"Plus Jakarta Sans", sans-serif',
          marginTop: 1,
        }}
      >
        FASHION MALL
      </span>
    </div>
  )
}
