// app/login/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import Image from 'next/image';

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (auth.isLoggedIn()) {
      router.push('/dashboard');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('Sending login request...');
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ identifier, password }),
      });

      console.log('Response status:', response.status);
      
      const data = await response.json();
      console.log('Response data:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      if (!data.token) {
        throw new Error('No token received from server');
      }

      auth.setAuth(data);
      router.push('/dashboard');
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-canvas-subtle px-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-accent-muted/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-done-muted/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <form onSubmit={handleSubmit} className="relative bg-canvas-elevated/40 backdrop-blur-xl rounded-2xl px-6 py-8 border border-border-subtle shadow-2xl"
        style={{marginTop: "-10%"}}>
          {error && (
            <div className="mb-6 p-4 bg-danger-muted/10 border border-danger-muted rounded-xl text-danger-fg text-sm">
              {error}
            </div>
          )}

          {/* Backpress */}
          <Link href="/" className='absolute top-4 left-4'>
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#B7B7B7"><path d="M400-80 0-480l400-400 71 71-329 329 329 329-71 71Z"/></svg>
          </Link>

          <div className="text-center mb-7">
            <div className="avatar avatar-lg">
                <Image
                  src="/logo/logo.png"
                  alt='Logo'
                  width={50}
                  height={50}
                ></Image>
            </div>
            <h1 className="text-4xl mt-4 font-bold tracking-tight">
              <span className="text-fg-default">
                Welcome Back
              </span>
            </h1>
            <p className="text-fg-muted mt-2 text-sm">Sign in to access your account</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-fg-muted mb-1.5">
                Email or Username
              </label>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="input"
                placeholder="Enter your email or username"
                required
                disabled={loading}
                style={{height: "45px"}}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-fg-muted mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                placeholder="Enter your password"
                required
                disabled={loading}
                style={{height: "45px"}}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn -btn-primary w-full"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </div>

          <p className="text-center text-fg-muted text-sm mt-6">
            Don't have an account?{' '}
            <Link href="/register" className="text-fg-muted hover:text-fg-default">
              Create one
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}