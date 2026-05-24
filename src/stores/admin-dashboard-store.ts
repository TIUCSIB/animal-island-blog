import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type { AdminSection } from '@/pages/admin/types'

type AdminDashboardStore = {
  activeSection: AdminSection
  selectedId: string | null
  setActiveSection: (section: AdminSection) => void
  setSelectedId: (id: string | null) => void
  resetSelection: () => void
}

export const useAdminDashboardStore = create<AdminDashboardStore>()(
  persist(
    (set) => ({
      activeSection: 'posts',
      selectedId: null,
      setActiveSection: (activeSection) => set({ activeSection }),
      setSelectedId: (selectedId) => set({ selectedId }),
      resetSelection: () => set({ selectedId: null }),
    }),
    {
      name: 'island-admin-dashboard-store',
      partialize: (state) => ({ activeSection: state.activeSection }),
    },
  ),
)
