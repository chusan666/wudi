import { describe, it, expect, beforeEach, vi } from 'vitest';
import { act } from '@testing-library/react';
import { useCommentAnalyticsStore } from '@/store/comment-analytics-store';

// Helper to get a fresh store instance for each test
const getFreshStore = () => {
  const { getState, setState } = useCommentAnalyticsStore;
  return { getState, setState };
};

describe('Comment Analytics Store', () => {
  beforeEach(() => {
    // Reset store state before each test
    const { setState } = useCommentAnalyticsStore;
    act(() => {
      setState({
        filters: {
          minLikes: 0,
          hasReplies: false,
          timeRange: { from: null, to: null },
          keyword: '',
        },
        exportFormat: 'csv',
      });
    });
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should have correct default filters', () => {
      const { getState } = getFreshStore();
      const state = getState();
      
      expect(state.filters.minLikes).toBe(0);
      expect(state.filters.hasReplies).toBe(false);
      expect(state.filters.timeRange.from).toBe(null);
      expect(state.filters.timeRange.to).toBe(null);
      expect(state.filters.keyword).toBe('');
    });

    it('should have default export format as CSV', () => {
      const { getState } = getFreshStore();
      const state = getState();
      
      expect(state.exportFormat).toBe('csv');
    });
  });

  describe('Filter Management', () => {
    it('should update minLikes filter', () => {
      const { getState } = getFreshStore();
      const store = useCommentAnalyticsStore.getState();
      
      act(() => {
        store.setFilters({ minLikes: 5 });
      });
      
      expect(getState().filters.minLikes).toBe(5);
      // Other filters should remain unchanged
      expect(getState().filters.hasReplies).toBe(false);
      expect(getState().filters.keyword).toBe('');
    });

    it('should update hasReplies filter', () => {
      const { getState } = getFreshStore();
      const store = useCommentAnalyticsStore.getState();
      
      act(() => {
        store.setFilters({ hasReplies: true });
      });
      
      expect(getState().filters.hasReplies).toBe(true);
    });

    it('should update keyword filter', () => {
      const { getState } = getFreshStore();
      const store = useCommentAnalyticsStore.getState();
      
      act(() => {
        store.setFilters({ keyword: 'amazing' });
      });
      
      expect(getState().filters.keyword).toBe('amazing');
    });

    it('should update timeRange filter', () => {
      const { getState } = getFreshStore();
      const store = useCommentAnalyticsStore.getState();
      const fromDate = new Date('2024-01-01');
      const toDate = new Date('2024-12-31');
      
      act(() => {
        store.setFilters({ 
          timeRange: { from: fromDate, to: toDate } 
        });
      });
      
      expect(getState().filters.timeRange.from).toBe(fromDate);
      expect(getState().filters.timeRange.to).toBe(toDate);
    });

    it('should update multiple filters at once', () => {
      const { getState } = getFreshStore();
      const store = useCommentAnalyticsStore.getState();
      
      act(() => {
        store.setFilters({ 
          minLikes: 10, 
          hasReplies: true, 
          keyword: 'great' 
        });
      });
      
      expect(getState().filters.minLikes).toBe(10);
      expect(getState().filters.hasReplies).toBe(true);
      expect(getState().filters.keyword).toBe('great');
      expect(getState().filters.timeRange.from).toBe(null);
    });

    it('should reset all filters to default', () => {
      const { getState } = getFreshStore();
      const store = useCommentAnalyticsStore.getState();
      
      // Set some filters
      act(() => {
        store.setFilters({ 
          minLikes: 15, 
          hasReplies: true, 
          keyword: 'test',
          timeRange: { from: new Date(), to: new Date() }
        });
      });
      
      // Reset filters
      act(() => {
        store.resetFilters();
      });
      
      // Should be back to defaults
      expect(getState().filters.minLikes).toBe(0);
      expect(getState().filters.hasReplies).toBe(false);
      expect(getState().filters.keyword).toBe('');
      expect(getState().filters.timeRange.from).toBe(null);
      expect(getState().filters.timeRange.to).toBe(null);
    });
  });

  describe('Export Format Management', () => {
    it('should update export format to JSON', () => {
      const { getState } = getFreshStore();
      const store = useCommentAnalyticsStore.getState();
      
      act(() => {
        store.setExportFormat('json');
      });
      
      expect(getState().exportFormat).toBe('json');
    });

    it('should update export format to CSV', () => {
      const { getState } = getFreshStore();
      const store = useCommentAnalyticsStore.getState();
      
      // First change to JSON
      act(() => {
        store.setExportFormat('json');
      });
      expect(getState().exportFormat).toBe('json');
      
      // Then change back to CSV
      act(() => {
        store.setExportFormat('csv');
      });
      expect(getState().exportFormat).toBe('csv');
    });
  });

  describe('Filter Independence', () => {
    it('should not affect other filters when updating one filter', () => {
      const { getState } = getFreshStore();
      const store = useCommentAnalyticsStore.getState();
      
      // Set initial state
      act(() => {
        store.setFilters({ 
          minLikes: 5, 
          hasReplies: true, 
          keyword: 'initial' 
        });
      });
      
      // Update only minLikes
      act(() => {
        store.setFilters({ minLikes: 10 });
      });
      
      // Other filters should remain unchanged
      expect(getState().filters.minLikes).toBe(10);
      expect(getState().filters.hasReplies).toBe(true);
      expect(getState().filters.keyword).toBe('initial');
    });

    it('should not affect export format when updating filters', () => {
      const { getState } = getFreshStore();
      const store = useCommentAnalyticsStore.getState();
      
      // Change export format
      act(() => {
        store.setExportFormat('json');
      });
      
      // Update filters
      act(() => {
        store.setFilters({ minLikes: 20 });
      });
      
      // Export format should remain unchanged
      expect(getState().exportFormat).toBe('json');
      expect(getState().filters.minLikes).toBe(20);
    });
  });
});