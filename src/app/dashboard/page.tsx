// app/dashboard/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/auth';

export default function DashboardPage() {
  const router = useRouter();
  const user = auth.getUser();
  const token = auth.getToken();

  useEffect(() => {
    if (!auth.isLoggedIn()) {
      router.push('/login');
    }
  }, [router]);

  const handleLogout = () => {
    auth.logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-canvas-default p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-canvas-elevated/40 backdrop-blur-xl rounded-2xl p-8 border border-border-subtle">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-accent-DEFAULT to-done-DEFAULT bg-clip-text text-transparent">
              Dashboard
            </h1>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-danger-muted/10 border border-danger-muted rounded-xl text-danger-fg hover:bg-danger-muted/20 transition-colors"
            >
              Logout
            </button>
          </div>
          
          <div className="space-y-4">
            <p className="text-fg-default">Welcome, {user?.display_name || user?.username}!</p>
            <div className="bg-canvas-inset/30 rounded-xl p-4 border border-border-subtle">
              <p className="text-fg-muted text-sm">User Info:</p>
              <pre className="text-fg-default text-sm mt-2">
                {JSON.stringify(user, null, 2)}
              </pre>
            </div>
            <div className="bg-canvas-inset/30 rounded-xl p-4 border border-border-subtle">
              <p className="text-fg-muted text-sm">Token (first 50 chars):</p>
              <code className="text-fg-default text-sm mt-2 block break-all">
                {token?.substring(0, 50)}...
              </code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}