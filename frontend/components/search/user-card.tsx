import { Users, ExternalLink, UserCheck, Heart } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { User } from '@/types'
import { formatNumber } from '@/lib/utils'

interface UserCardProps {
  user: User
}

export function UserCard({ user }: UserCardProps) {
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
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.displayName}
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                <Users className="h-8 w-8 text-gray-400" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {user.displayName}
              </h3>
              {user.verified && (
                <div className="flex items-center gap-1">
                  <UserCheck className="h-4 w-4 text-blue-500" />
                </div>
              )}
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${platformColors[user.platform]}`}>
                {platformNames[user.platform]}
              </span>
            </div>

            <p className="text-sm text-gray-500 mb-2">@{user.username}</p>

            {user.bio && (
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {user.bio}
              </p>
            )}

            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div>
                <span className="font-semibold text-gray-900">
                  {formatNumber(user.stats.followers)}
                </span>
                <span className="ml-1">followers</span>
              </div>
              <div>
                <span className="font-semibold text-gray-900">
                  {formatNumber(user.stats.following)}
                </span>
                <span className="ml-1">following</span>
              </div>
              <div>
                <span className="font-semibold text-gray-900">
                  {formatNumber(user.stats.posts)}
                </span>
                <span className="ml-1">posts</span>
              </div>
              {user.stats.likes && (
                <div>
                  <span className="font-semibold text-gray-900">
                    {formatNumber(user.stats.likes)}
                  </span>
                  <span className="ml-1">likes</span>
                </div>
              )}
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            asChild
          >
            <a
              href={user.url}
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