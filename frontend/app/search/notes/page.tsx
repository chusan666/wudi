'use client'

import { useState } from 'react'

export default function SearchNotesPage() {
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
          title: 'Sample Note: Travel Tips',
          content: 'This is a sample note content for demonstration',
          author: { username: 'traveler', verified: true },
          platform: 'xiaohongshu',
          stats: { likes: 1234, comments: 56, shares: 78 },
          publishedAt: '2024-01-15',
          url: 'https://example.com/note/1'
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
        <h1 className="text-3xl font-bold mb-6">Search Notes</h1>
        
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <div className="flex gap-4">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for notes..."
              className="flex-1 p-2 border rounded"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {results.map((note) => (
            <div key={note.id} className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-2">{note.title}</h3>
              <p className="text-gray-600 mb-4">{note.content}</p>
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  By {note.author.username} • {note.publishedAt}
                </div>
                <div className="flex gap-4 text-sm text-gray-500">
                  <span>{note.stats.likes} likes</span>
                  <span>{note.stats.comments} comments</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {results.length === 0 && !loading && (
          <div className="text-center py-12 text-gray-500">
            Enter a search term to find notes
          </div>
        )}
      </div>
    </div>
  )
}