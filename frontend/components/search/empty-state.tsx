import { Search } from 'lucide-react'

export function EmptyState({ type }: { type: 'notes' | 'users' }) {
  const title = type === 'notes' ? 'No notes found' : 'No users found'
  const description = type === 'notes' 
    ? 'Try adjusting your search terms or filters to find what you\'re looking for.'
    : 'Try adjusting your search terms or filters to discover new users.'

  return (
    <div className="text-center py-12">
      <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <Search className="h-12 w-12 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 max-w-md mx-auto">{description}</p>
    </div>
  )
}