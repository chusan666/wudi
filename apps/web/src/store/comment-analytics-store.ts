import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface CommentAnalyticsFilters {
  minLikes: number;
  hasReplies: boolean;
  timeRange: {
    from: Date | null;
    to: Date | null;
  };
  keyword: string;
}

export interface CommentAnalyticsState {
  filters: CommentAnalyticsFilters;
  setFilters: (filters: Partial<CommentAnalyticsFilters>) => void;
  resetFilters: () => void;
  exportFormat: 'csv' | 'json';
  setExportFormat: (format: 'csv' | 'json') => void;
}

const defaultFilters: CommentAnalyticsFilters = {
  minLikes: 0,
  hasReplies: false,
  timeRange: {
    from: null,
    to: null,
  },
  keyword: '',
};

export const useCommentAnalyticsStore = create<CommentAnalyticsState>()(
  persist(
    (set) => ({
      filters: defaultFilters,
      setFilters: (filters) =>
        set((state) => ({
          filters: { ...state.filters, ...filters },
        })),
      resetFilters: () => set({ filters: defaultFilters }),
      exportFormat: 'csv',
      setExportFormat: (format) => set({ exportFormat: format }),
    }),
    {
      name: 'comment-analytics-filters',
      partialize: (state) => ({ filters: state.filters }),
      storage: createJSONStorage(() => localStorage),
    }
  )
);