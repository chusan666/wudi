import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { QueryProvider } from '@/providers/query-provider';
import { ThemeProvider } from '@/providers/theme-provider';
import { Navigation } from '@/components/navigation';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Data Platform',
  description: 'Next.js 15 App with React 19, TypeScript, TailwindCSS, shadcn/ui, TanStack Query, and Zustand',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <QueryProvider>
          <ThemeProvider>
            <Navigation />
            <main className="lg:pl-64">
              <div className="container py-6">{children}</div>
            </main>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
