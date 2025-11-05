import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { SearchFilters } from '@/types'

interface SearchStore {
  // Notes search state
  notesQuery: string
  notesFilters: SearchFilters
  notesPage: number
  
  // Users search state
  usersQuery: string
  usersFilters: SearchFilters
  usersPage: number
  
  // Actions
  setNotesQuery: (query: string) => void
  setNotesFilters: (filters: SearchFilters) => void
  setNotesPage: (page: number) => void
  resetNotesSearch: () => void
  
  setUsersQuery: (query: string) => void
  setUsersFilters: (filters: SearchFilters) => void
  setUsersPage: (page: number) => void
  resetUsersSearch: () => void
}

export const useSearchStore = create<SearchStore>()(
  persist(
    (set) => ({
      // Initial state
      notesQuery: '',
      notesFilters: {},
      notesPage: 1,
      
      usersQuery: '',
      usersFilters: {},
      usersPage: 1,
      
      // Notes actions
      setNotesQuery: (query) => set({ notesQuery: query, notesPage: 1 }),
      setNotesFilters: (filters) => set({ notesFilters: filters, notesPage: 1 }),
      setNotesPage: (page) => set({ notesPage: page }),
      resetNotesSearch: () => set({ notesQuery: '', notesFilters: {}, notesPage: 1 }),
      
      // Users actions
      setUsersQuery: (query) => set({ usersQuery: query, usersPage: 1 }),
      setUsersFilters: (filters) => set({ usersFilters: filters, usersPage: 1 }),
      setUsersPage: (page) => set({ usersPage: page }),
      resetUsersSearch: () => set({ usersQuery: '', usersFilters: {}, usersPage: 1 }),
    }),
    {
      name: 'search-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        notesFilters: state.notesFilters,
        usersFilters: state.usersFilters,
      }),
    }
  )
)