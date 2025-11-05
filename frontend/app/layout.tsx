import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Social Media Parser',
  description: 'Parse and explore social media content from various platforms',
  keywords: 'social media, parser, xiaohongshu, douyin, bilibili, kuaishou',
  openGraph: {
    title: 'Social Media Parser',
    description: 'Parse and explore social media content from various platforms',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}