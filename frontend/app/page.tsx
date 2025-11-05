import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Social Media Parser
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Explore and analyze content from popular social media platforms including 
            小红书, 抖音, B站, and 快手.
          </p>
          
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-semibold mb-4">Parse Content</h2>
              <p className="text-gray-600 mb-6">
                Extract detailed information from social media posts and videos
              </p>
              <Link href="/parse">
                <Button className="w-full">Start Parsing</Button>
              </Link>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-semibold mb-4">Explore Details</h2>
              <p className="text-gray-600 mb-6">
                View detailed information about notes and user profiles
              </p>
              <div className="space-y-2">
                <Link href="/notes/example">
                  <Button variant="outline" className="w-full">
                    Sample Note
                  </Button>
                </Link>
                <Link href="/users/example">
                  <Button variant="outline" className="w-full">
                    Sample User
                  </Button>
                </Link>
              </div>
            </div>
          </div>
          
          <div className="mt-12 text-center">
            <h3 className="text-lg font-semibold mb-4">Supported Platforms</h3>
            <div className="flex flex-wrap justify-center gap-4">
              {['小红书', '抖音', 'B站', '快手'].map((platform) => (
                <span
                  key={platform}
                  className="px-4 py-2 bg-white rounded-full shadow text-sm font-medium"
                >
                  {platform}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}