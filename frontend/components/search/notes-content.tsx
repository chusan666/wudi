'use client'

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSearchStore } from '@/store/search'
import { searchApi } from '@/lib/api'
import { SearchForm } from '@/components/search/search-form'
import { NoteCard } from '@/components/search/note-card'
import { Pagination } from '@/components/search/pagination'
import { SearchResultsSkeleton } from '@/components/search/search-results-skeleton'
import { EmptyState } from '@/components/search/empty-state'
import { ErrorState } from '@/components/search/error-state'
import { useToast } from '@/components/ui/use-toast'
import { Note } from '@/types'

export function SearchNotesContent() {
  const { toast } = useToast()
  const {
    notesQuery,
    notesFilters,
    notesPage,
    setNotesQuery,
    setNotesFilters,
    setNotesPage,
  } = useSearchStore()

  const [hasSearched, setHasSearched] = useState(false)

  const {
    data: searchResults,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['search-notes', notesQuery, notesPage, notesFilters],
    queryFn: () =>
      searchApi.searchNotes(notesQuery, notesPage, 20, notesFilters),
    enabled: hasSearched && notesQuery.trim().length > 0,
  })

  const handleSearch = () => {
    if (!notesQuery.trim()) {
      toast({
        title: 'Please enter a search term',
        description: 'Search query cannot be empty',
      })
      return
    }
    setHasSearched(true)
    setNotesPage(1)
  }

  const handlePageChange = (page: number) => {
    setNotesPage(page)
  }

  const handleQueryChange = (query: string) => {
    setNotesQuery(query)
    if (!query.trim()) {
      setHasSearched(false)
    }
  }

  const handleRetry = () => {
    refetch()
  }

  // Auto-search on Enter key
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && notesQuery.trim()) {
        handleSearch()
      }
    }

    window.addEventListener('keypress', handleKeyPress)
    return () => window.removeEventListener('keypress', handleKeyPress)
  }, [notesQuery])

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Search Notes</h2>
        <p className="text-gray-600">
          Find posts, articles, and content from across social media platforms
        </p>
      </div>

      <SearchForm
        query={notesQuery}
        onQueryChange={handleQueryChange}
        onSearch={handleSearch}
        filters={notesFilters}
        onFiltersChange={setNotesFilters}
        placeholder="Search for notes, posts, articles..."
      />

      <div className="mt-6">
        {isLoading && <SearchResultsSkeleton />}

        {error && !isLoading && (
          <ErrorState error={error as Error} onRetry={handleRetry} />
        )}

        {!isLoading && !error && hasSearched && searchResults && (
          <div>
            {searchResults.data.length === 0 ? (
              <EmptyState type="notes" />
            ) : (
              <div>
                <div className="mb-4 text-sm text-gray-500">
                  Found {searchResults.pagination.total} results
                </div>
                <div className="space-y-4">
                  {searchResults.data.map((note: Note) => (
                    <NoteCard key={note.id} note={note} />
                  ))}
                </div>
                <Pagination
                  currentPage={searchResults.pagination.page}
                  totalPages={searchResults.pagination.totalPages}
                  onPageChange={handlePageChange}
                  isLoading={isLoading}
                />
              </div>
            )}
          </div>
        )}

        {!hasSearched && !isLoading && (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <svg
                className="h-12 w-12 text-blue-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Start searching for notes
            </h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Enter keywords to search for posts, articles, and content from social media platforms
            </p>
          </div>
        )}
      </div>
    </div>
  )
}