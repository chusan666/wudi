import { create } from 'zustand';

export interface Filter {
  search: string;
  dateRange?: {
    from: Date;
    to: Date;
  };
  tags: string[];
}

export interface UIState {
  theme: 'light' | 'dark' | 'system';
  sidebarOpen: boolean;
  filters: Filter;
  selectedEntities: string[];
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setFilters: (filters: Partial<Filter>) => void;
  resetFilters: () => void;
  setSelectedEntities: (entities: string[]) => void;
  toggleEntity: (entityId: string) => void;
  clearSelectedEntities: () => void;
}

const defaultFilters: Filter = {
  search: '',
  tags: [],
};

export const useUIStore = create<UIState>((set) => ({
  theme: 'system',
  sidebarOpen: true,
  filters: defaultFilters,
  selectedEntities: [],
  setTheme: (theme) => set({ theme }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setFilters: (filters) =>
    set((state) => ({ filters: { ...state.filters, ...filters } })),
  resetFilters: () => set({ filters: defaultFilters }),
  setSelectedEntities: (entities) => set({ selectedEntities: entities }),
  toggleEntity: (entityId) =>
    set((state) => ({
      selectedEntities: state.selectedEntities.includes(entityId)
        ? state.selectedEntities.filter((id) => id !== entityId)
        : [...state.selectedEntities, entityId],
    })),
  clearSelectedEntities: () => set({ selectedEntities: [] }),
}));
