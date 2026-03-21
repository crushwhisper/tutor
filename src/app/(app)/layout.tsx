import type { Metadata } from 'next'
import Sidebar from '@/components/app/Sidebar'
import Topbar from '@/components/app/Topbar'
import ToastContainer from '@/components/app/ToastContainer'

export const metadata: Metadata = {
  title: 'TUTOR — Mon Espace',
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-navy overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          {children}
        </main>
      </div>
      <ToastContainer />
    </div>
  )
}
