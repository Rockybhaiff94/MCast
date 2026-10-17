'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { AlertCircle, Terminal, ArrowRight } from 'lucide-react';

function ErrorContent() {
  const searchParams = useSearchParams();
  const reason = searchParams?.get('reason') || 'unknown';
  const details = searchParams?.get('details');

  const reasonMap: Record<string, { title: string; desc: string }> = {
    consent_denied: {
      title: 'Google Consent Cancelled',
      desc: 'The Google OAuth authorization was declined. MCast requires read-only YouTube permission to detect when you are streaming.',
    },
    session_expired: {
      title: 'Linking Session Expired',
      desc: 'This link has expired for security reasons. Each linking session is valid for 5 minutes.',
    },
    invalid_session: {
      title: 'Invalid Linking Session',
      desc: 'The linking code does not exist or has already been used.',
    },
    invalid_state: {
      title: 'Security Verification Failed',
      desc: 'The OAuth state signature could not be verified. Please start a fresh linking session in Minecraft.',
    },
    exchange_failed: {
      title: 'Google Token Exchange Failed',
      desc: 'An error occurred while exchanging the authorization code with Google.',
    },
    missing_refresh_token: {
      title: 'Offline Access Consent Missing',
      desc: 'Google did not return an offline refresh token. Please re-authorize and ensure offline access is consented.',
    },
  };

  const info = reasonMap[reason] || {
    title: 'Linking Unsuccessful',
    desc: 'An unexpected issue occurred while connecting your YouTube account.',
  };

  return (
    <div
      className="w-full max-w-lg text-center relative overflow-hidden"
      style={{
        background: 'linear-gradient(145deg, rgba(24,14,14,.96), rgba(12,10,10,.96))',
        border: '1px solid rgba(255, 52, 52, 0.35)',
        borderRadius: 'var(--radius)',
        padding: 'clamp(24px, 4vw, 36px)',
        boxShadow: '0 24px 70px rgba(0,0,0,0.5)',
      }}
    >
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center text-2xl mx-auto mb-4"
        style={{
          background: 'rgba(255, 52, 52, 0.12)',
          border: '2px solid rgba(255, 52, 52, 0.45)',
          color: '#ff6b6b',
          boxShadow: '0 0 24px rgba(255, 52, 52, 0.2)',
        }}
      >
        <AlertCircle size={30} />
      </div>

      <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-2 tracking-tight">
        {info.title}
      </h1>
      <p className="text-sm text-[var(--muted)] mb-6 leading-relaxed m-0">
        {info.desc}
      </p>

      {details && (
        <div
          className="rounded-xl p-3 text-xs font-mono mb-6 text-left break-all"
          style={{
            background: 'rgba(10, 10, 10, 0.8)',
            border: '1px solid rgba(255, 52, 52, 0.25)',
            color: '#ff8a8a',
          }}
        >
          Error details: {details}
        </div>
      )}

      <div
        className="rounded-xl p-4 mb-6 text-xs text-left space-y-2"
        style={{
          background: 'rgba(16, 16, 16, 0.7)',
          border: '1px solid var(--line)',
          color: 'var(--muted)',
        }}
      >
        <div className="flex items-center gap-1.5 font-bold text-white text-xs">
          <Terminal size={14} className="text-[var(--yellow)]" />
          <span>How to resolve:</span>
        </div>
        <p className="m-0 leading-relaxed">1. Open Minecraft and reconnect to your server.</p>
        <p className="m-0 leading-relaxed">
          2. Execute{' '}
          <code style={{ color: 'var(--yellow)', background: '#20200a', border: '1px solid #41400b', padding: '1px 6px', borderRadius: '4px' }}>
            /link youtube
          </code>{' '}
          in chat.
        </p>
        <p className="m-0 leading-relaxed">3. Click the new link and ensure you grant the requested YouTube permissions.</p>
      </div>

      <Link
        href="/"
        className="btn btn-primary w-full"
        style={{ justifyContent: 'center', padding: '13px 20px', fontSize: '0.92rem' }}
      >
        <span>Back to MCast Homepage</span>
        <ArrowRight size={16} />
      </Link>
    </div>
  );
}

export default function LinkErrorPage() {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--white)] flex flex-col justify-between selection:bg-[var(--yellow)] selection:text-[#080808] relative overflow-hidden">
      {/* Atmospheric subtle background glow */}
      <div
        className="absolute inset-0 pointer-events-none -z-10"
        style={{
          backgroundImage:
            'radial-gradient(circle at 50% 10%, rgba(255,52,52,0.06), transparent 55%), radial-gradient(circle at 80% 80%, rgba(255,229,0,0.03), transparent 45%)',
        }}
      />

      {/* Modernized Minimal MCast Topbar */}
      <Header
        variant="minimal"
        badge="Connection Alert"
        badgeType="error"
        backHref="/"
        backLabel="← Homepage"
      />

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center px-4 py-16 sm:py-24">
        <Suspense
          fallback={
            <div className="text-[var(--muted)] text-sm animate-pulse">
              Loading details...
            </div>
          }
        >
          <ErrorContent />
        </Suspense>
      </main>

      {/* Modernized Minimal MCast Footer */}
      <Footer variant="minimal" />
    </div>
  );
}

