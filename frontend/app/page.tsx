import Link from 'next/link'
import { Search, Users, FileText } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Social Media Search
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Search and discover notes and users across multiple social media platforms
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Link 
            href="/search/notes"
            className="group bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-all duration-200 hover:scale-105"
          >
            <div className="flex items-center justify-between mb-4">
              <FileText className="h-12 w-12 text-blue-600" />
              <Search className="h-6 w-6 text-gray-400 group-hover:text-blue-600 transition-colors" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Search Notes
            </h2>
            <p className="text-gray-600">
              Find posts, articles, and content from across social media platforms
            </p>
          </Link>

          <Link 
            href="/search/users"
            className="group bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-all duration-200 hover:scale-105"
          >
            <div className="flex items-center justify-between mb-4">
              <Users className="h-12 w-12 text-green-600" />
              <Search className="h-6 w-6 text-gray-400 group-hover:text-green-600 transition-colors" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Search Users
            </h2>
            <p className="text-gray-600">
              Discover creators, influencers, and users across social platforms
            </p>
          </Link>
        </div>

        <div className="mt-16 text-center">
          <p className="text-gray-500">
            Powered by multi-platform social media integration
          </p>
        </div>
      </div>
    </div>
  )
}