import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Monorepo Web',
  description: 'Next.js 15 app in monorepo',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
