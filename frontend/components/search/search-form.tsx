'use client'

import { useState } from 'react'
import { Search, Filter } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { SearchFilters } from '@/types'

interface SearchFormProps {
  query: string
  onQueryChange: (query: string) => void
  onSearch: () => void
  filters: SearchFilters
  onFiltersChange: (filters: SearchFilters) => void
  placeholder: string
}

export function SearchForm({
  query,
  onQueryChange,
  onSearch,
  filters,
  onFiltersChange,
  placeholder,
}: SearchFormProps) {
  const [showFilters, setShowFilters] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch()
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder={placeholder}
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button type="submit" disabled={!query.trim()}>
            Search
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>

        {showFilters && (
          <div className="border-t pt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Platform</label>
                <select
                  value={filters.platform || ''}
                  onChange={(e) => 
                    onFiltersChange({
                      ...filters,
                      platform: e.target.value || undefined,
                    })
                  }
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">All Platforms</option>
                  <option value="xiaohongshu">小红书</option>
                  <option value="douyin">抖音</option>
                  <option value="bilibili">B站</option>
                  <option value="kuaishou">快手</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Sort By</label>
                <select
                  value={filters.sortBy || 'relevance'}
                  onChange={(e) => 
                    onFiltersChange({
                      ...filters,
                      sortBy: e.target.value as any,
                    })
                  }
                  className="w-full p-2 border rounded-md"
                >
                  <option value="relevance">Relevance</option>
                  <option value="date">Date</option>
                  <option value="popularity">Popularity</option>
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="verified"
                  checked={filters.verifiedOnly || false}
                  onChange={(e) =>
                    onFiltersChange({
                      ...filters,
                      verifiedOnly: e.target.checked,
                    })
                  }
                  className="mr-2"
                />
                <label htmlFor="verified" className="text-sm font-medium">
                  Verified only
                </label>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  )
}