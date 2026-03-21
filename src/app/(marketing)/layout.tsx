export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="marketing-wrapper"
      style={{ background: '#FFFFFF', color: '#09090B', minHeight: '100dvh' }}
    >
      {children}
    </div>
  )
}
