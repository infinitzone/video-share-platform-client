// app/register/page.tsx
'use client';
import Image from 'next/image';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    display_name: '',
  });
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
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      auth.setAuth(data);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-canvas-subtle px-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-done-muted/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent-muted/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <form onSubmit={handleSubmit} className="bg-canvas-elevated/40 backdrop-blur-xl rounded-2xl px-6 py-8 border border-border-subtle shadow-2xl">
          {error && (
            <div className="mb-6 p-4 bg-danger-muted/10 border border-danger-muted rounded-xl text-danger-fg text-sm">
              {error}
            </div>
          )}

          {/* Backpress */}
          <Link href="/login" className='absolute top-4 left-4'>
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
                Create Account
              </span>
            </h1>
            <p className="text-fg-muted mt-2 text-sm">Sign in to access your account</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-fg-muted mb-1.5">
                Display Name
              </label>
              <input
                type="text"
                value={formData.display_name}
                onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                className="input"
                placeholder="Enter your display name"
                required
                disabled={loading}
                style={{height: "45px"}}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-fg-muted mb-1.5">
                Username
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="input"
                placeholder="Choose a username"
                required
                disabled={loading}
                style={{height: "45px"}}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-fg-muted mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="input"
                placeholder="Enter your email"
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
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="input"
                placeholder="Create a password"
                required
                disabled={loading}
                style={{height: "45px"}}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Creating account...
                </span>
              ) : (
                'Create Account'
              )}
            </button>
          </div>

          <p className="text-center text-fg-muted text-sm mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-fg-muted hover:text-fg-default font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}