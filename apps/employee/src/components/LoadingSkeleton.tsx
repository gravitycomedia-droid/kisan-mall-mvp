export function LoadingSkeleton() {
  return (
    <div
      className="bg-[#FAF6EE] dark:bg-[#0F1A14]" style={{
        minHeight: '100vh',
        
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 20px',
        maxWidth: 480,
        margin: '0 auto',
        gap: 16,
      }}
    >
      {/* Top bar skeleton */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div style={skeletonStyle(80, 20)} />
        <div style={skeletonStyle(60, 20)} />
      </div>

      {/* Greeting skeleton */}
      <div style={skeletonStyle('60%', 24)} />
      <div style={skeletonStyle('40%', 16)} />

      {/* Card skeleton */}
      <div
        className="bg-white dark:bg-[#1A2E22]" style={{
          
          borderRadius: 16,
          overflow: 'hidden',
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        }}
      >
        <div style={{ ...skeletonStyle('100%', 200), borderRadius: 0 }} />
        <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={skeletonStyle('80%', 18)} />
          <div style={skeletonStyle(80, 22)} />
          <div style={skeletonStyle('100%', 14)} />
          <div style={skeletonStyle('70%', 14)} />
        </div>
      </div>

      {/* Button skeletons */}
      <div style={skeletonStyle('100%', 52)} />
      <div style={skeletonStyle('100%', 52)} />
    </div>
  )
}

function skeletonStyle(
  width: string | number,
  height: number
): React.CSSProperties {
  return {
    width,
    height,
    borderRadius: 8,
    background: 'linear-gradient(90deg, #e8e2d8 25%, #f0ece4 50%, #e8e2d8 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite',
  }
}
