import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ToastMessage, User } from '@/types'

interface AppState {
  // User
  user: User | null
  setUser: (user: User | null) => void

  // Sidebar
  sidebarCollapsed: boolean
  toggleSidebar: () => void

  // Toasts
  toasts: ToastMessage[]
  addToast: (toast: Omit<ToastMessage, 'id'>) => void
  removeToast: (id: string) => void

  // UI state
  isLoading: boolean
  setLoading: (loading: boolean) => void

  // Active module
  activeModuleId: string | null
  setActiveModule: (id: string | null) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // User
      user: null,
      setUser: (user) => set({ user }),

      // Sidebar
      sidebarCollapsed: false,
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

      // Toasts
      toasts: [],
      addToast: (toast) => {
        const id = Math.random().toString(36).slice(2)
        set((s) => ({ toasts: [...s.toasts, { ...toast, id }] }))
        setTimeout(() => get().removeToast(id), 5000)
      },
      removeToast: (id) =>
        set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

      // UI
      isLoading: false,
      setLoading: (isLoading) => set({ isLoading }),

      // Active module
      activeModuleId: null,
      setActiveModule: (activeModuleId) => set({ activeModuleId }),
    }),
    {
      name: 'tutor-app',
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        activeModuleId: state.activeModuleId,
      }),
    }
  )
)
