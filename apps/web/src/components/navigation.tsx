'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, FileText, User, TrendingUp, MessageSquare, Menu, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUIStore } from '@/store/ui-store';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/search' as const, label: 'Search', icon: Search },
  { href: '/notes' as const, label: 'Notes', icon: FileText },
  { href: '/users' as const, label: 'Users', icon: User },
  { href: '/kol-analytics' as const, label: 'KOL Analytics', icon: TrendingUp },
  { href: '/comments' as const, label: 'Comments', icon: MessageSquare },
] as const;

export function Navigation() {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar, theme, setTheme } = useUIStore();

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b bg-background">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <span className="text-xl">📊</span>
              <span>Data Platform</span>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              {theme === 'dark' ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </header>

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-30 mt-16 w-64 transform border-r bg-background transition-transform lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <nav className="flex flex-col gap-2 p-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? 'secondary' : 'ghost'}
                  className="w-full justify-start gap-2"
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </nav>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={toggleSidebar}
        />
      )}
    </>
  );
}
