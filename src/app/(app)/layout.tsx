import type { Metadata } from 'next'
import Sidebar from '@/components/app/Sidebar'
import Topbar from '@/components/app/Topbar'
import ToastContainer from '@/components/app/ToastContainer'
import OwlJournal from '@/components/app/OwlJournal'

export const metadata: Metadata = {
  title: 'TUTOR — Mon Espace',
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="cockpit-wrapper" style={{ minHeight: '100dvh' }}>
      {/* Fixed top bar */}
      <Topbar />

      {/* Fixed sidebar */}
      <Sidebar />

      {/* Scrollable main content */}
      <main style={{
        marginLeft: '240px',
        marginTop: '64px',
        minHeight: 'calc(100dvh - 64px)',
        padding: '40px',
        background: 'var(--app-bg)',
        overflowY: 'auto',
      }}>
        {children}
      </main>

      {/* Owl / Journal panel */}
      <OwlJournal />

      <ToastContainer />
    </div>
  )
}
