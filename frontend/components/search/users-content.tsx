'use client'

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSearchStore } from '@/store/search'
import { searchApi } from '@/lib/api'
import { SearchForm } from '@/components/search/search-form'
import { UserCard } from '@/components/search/user-card'
import { Pagination } from '@/components/search/pagination'
import { SearchResultsSkeleton } from '@/components/search/search-results-skeleton'
import { EmptyState } from '@/components/search/empty-state'
import { ErrorState } from '@/components/search/error-state'
import { useToast } from '@/components/ui/use-toast'
import { User } from '@/types'

export function SearchUsersContent() {
  const { toast } = useToast()
  const {
    usersQuery,
    usersFilters,
    usersPage,
    setUsersQuery,
    setUsersFilters,
    setUsersPage,
  } = useSearchStore()

  const [hasSearched, setHasSearched] = useState(false)

  const {
    data: searchResults,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['search-users', usersQuery, usersPage, usersFilters],
    queryFn: () =>
      searchApi.searchUsers(usersQuery, usersPage, 20, usersFilters),
    enabled: hasSearched && usersQuery.trim().length > 0,
  })

  const handleSearch = () => {
    if (!usersQuery.trim()) {
      toast({
        title: 'Please enter a search term',
        description: 'Search query cannot be empty',
      })
      return
    }
    setHasSearched(true)
    setUsersPage(1)
  }

  const handlePageChange = (page: number) => {
    setUsersPage(page)
  }

  const handleQueryChange = (query: string) => {
    setUsersQuery(query)
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
      if (e.key === 'Enter' && usersQuery.trim()) {
        handleSearch()
      }
    }

    window.addEventListener('keypress', handleKeyPress)
    return () => window.removeEventListener('keypress', handleKeyPress)
  }, [usersQuery])

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Search Users</h2>
        <p className="text-gray-600">
          Discover creators, influencers, and users across social platforms
        </p>
      </div>

      <SearchForm
        query={usersQuery}
        onQueryChange={handleQueryChange}
        onSearch={handleSearch}
        filters={usersFilters}
        onFiltersChange={setUsersFilters}
        placeholder="Search for users, creators, influencers..."
      />

      <div className="mt-6">
        {isLoading && <SearchResultsSkeleton />}

        {error && !isLoading && (
          <ErrorState error={error as Error} onRetry={handleRetry} />
        )}

        {!isLoading && !error && hasSearched && searchResults && (
          <div>
            {searchResults.data.length === 0 ? (
              <EmptyState type="users" />
            ) : (
              <div>
                <div className="mb-4 text-sm text-gray-500">
                  Found {searchResults.pagination.total} users
                </div>
                <div className="space-y-4">
                  {searchResults.data.map((user: User) => (
                    <UserCard key={user.id} user={user} />
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
            <div className="mx-auto w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <svg
                className="h-12 w-12 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Start searching for users
            </h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Enter usernames or keywords to discover creators, influencers, and users across social platforms
            </p>
          </div>
        )}
      </div>
    </div>
  )
}