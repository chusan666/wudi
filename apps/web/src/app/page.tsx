import type { ApiResponse } from '@monorepo/shared';

export default function Home() {
  const response: ApiResponse<string> = {
    success: true,
    data: 'Welcome to the monorepo!',
  };

  return (
    <main style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1>Next.js 15 App</h1>
      <p>Status: {response.success ? 'Ready' : 'Not Ready'}</p>
      <p>{response.data}</p>
      <div style={{ marginTop: '2rem' }}>
        <h2>Tech Stack</h2>
        <ul>
          <li>Next.js 15</li>
          <li>React 18</li>
          <li>TypeScript</li>
          <li>pnpm workspace</li>
        </ul>
      </div>
    </main>
  );
}
