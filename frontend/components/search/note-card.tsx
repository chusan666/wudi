import { FileText, ExternalLink, Heart, MessageCircle, Share2, Eye } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Note } from '@/types'
import { formatDate, formatNumber } from '@/lib/utils'

interface NoteCardProps {
  note: Note
}

export function NoteCard({ note }: NoteCardProps) {
  const platformColors = {
    xiaohongshu: 'bg-red-100 text-red-800',
    douyin: 'bg-black text-white',
    bilibili: 'bg-pink-100 text-pink-800',
    kuaishou: 'bg-orange-100 text-orange-800',
  }

  const platformNames = {
    xiaohongshu: '小红书',
    douyin: '抖音',
    bilibili: 'B站',
    kuaishou: '快手',
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${platformColors[note.platform]}`}>
                {platformNames[note.platform]}
              </span>
              {note.author.verified && (
                <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
              )}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
              {note.title}
            </h3>
            <p className="text-gray-600 text-sm mb-3 line-clamp-3">
              {note.content}
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span className="font-medium">{note.author.username}</span>
              <span>•</span>
              <span>{formatDate(note.publishedAt)}</span>
            </div>
          </div>
          {note.thumbnail && (
            <img
              src={note.thumbnail}
              alt={note.title}
              className="w-24 h-24 object-cover rounded-lg ml-4"
            />
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Heart className="h-4 w-4" />
              <span>{formatNumber(note.stats.likes)}</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageCircle className="h-4 w-4" />
              <span>{formatNumber(note.stats.comments)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Share2 className="h-4 w-4" />
              <span>{formatNumber(note.stats.shares)}</span>
            </div>
            {note.stats.views && (
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                <span>{formatNumber(note.stats.views)}</span>
              </div>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            asChild
          >
            <a
              href={note.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1"
            >
              <ExternalLink className="h-3 w-3" />
              View
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}