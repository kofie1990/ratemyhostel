'use client';

import { useState, useEffect, useCallback } from 'react';
import AdminLogin from '@/components/admin/AdminLogin';
import AdminDashboard from '@/components/admin/AdminDashboard';

const SESSION_KEY = 'rmh_admin_token';

export default function AdminPage() {
  const [token, setToken] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const stored = sessionStorage.getItem(SESSION_KEY);
    if (stored) setToken(stored);
    setChecking(false);
  }, []);

  const handleLogin = useCallback((t: string) => {
    sessionStorage.setItem(SESSION_KEY, t);
    setToken(t);
  }, []);

  const handleLogout = useCallback(() => {
    sessionStorage.removeItem(SESSION_KEY);
    setToken(null);
  }, []);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!token) return <AdminLogin onSuccess={handleLogin} />;
  return <AdminDashboard token={token} onLogout={handleLogout} />;
}
