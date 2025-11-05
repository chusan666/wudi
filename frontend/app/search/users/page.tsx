'use client'

import { useState } from 'react'

export default function SearchUsersPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const handleSearch = async () => {
    if (!query.trim()) return
    
    setLoading(true)
    try {
      // Mock data for now
      setResults([
        {
          id: '1',
          username: 'creator1',
          displayName: 'Creative Creator',
          bio: 'Passionate content creator sharing lifestyle tips',
          verified: true,
          platform: 'xiaohongshu',
          stats: { followers: 12345, following: 678, posts: 90 },
          url: 'https://example.com/user/1'
        }
      ])
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Search Users</h1>
        
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <div className="flex gap-4">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for users..."
              className="flex-1 p-2 border rounded"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {results.map((user) => (
            <div key={user.id} className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-gray-500">👤</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-xl font-semibold">{user.displayName}</h3>
                    {user.verified && <span className="text-blue-500">✓</span>}
                  </div>
                  <p className="text-gray-500 mb-2">@{user.username}</p>
                  {user.bio && <p className="text-gray-600 mb-3">{user.bio}</p>}
                  <div className="flex gap-4 text-sm text-gray-500">
                    <span><strong>{user.stats.followers.toLocaleString()}</strong> followers</span>
                    <span><strong>{user.stats.following}</strong> following</span>
                    <span><strong>{user.stats.posts}</strong> posts</span>
                  </div>
                </div>
                <a
                  href={user.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                >
                  View
                </a>
              </div>
            </div>
          ))}
        </div>

        {results.length === 0 && !loading && (
          <div className="text-center py-12 text-gray-500">
            Enter a search term to find users
          </div>
        )}
      </div>
    </div>
  )
}