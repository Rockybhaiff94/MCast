'use client';

import React, { useEffect, useState, useCallback, Suspense, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ConnectedChannelCard, { ChannelInfo, LiveStatusInfo } from '@/components/ConnectedChannelCard';
import { Shield, Clock, Check, Copy, AlertTriangle } from 'lucide-react';

interface SessionData {
  valid: boolean;
  code?: string;
  server_name?: string;
  player_uuid?: string;
  player_name?: string;
  status?: string;
  connected?: boolean;
  expires_at?: number;
  seconds_remaining?: number;
  channel?: ChannelInfo;
  live_status?: LiveStatusInfo;
  error?: string;
}

function PlayerLinkContent() {
  const params = useParams();
  const code = params?.code as string;

  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(300);
  const [copiedCode, setCopiedCode] = useState(false);
  const copyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.mcast.fun';

  const verifyCode = useCallback(async (isManualRefresh = false) => {
    if (!code) return;
    if (isManualRefresh) setIsRefreshing(true);

    try {
      const res = await fetch(`${apiUrl}/v1/link-sessions/verify?code=${encodeURIComponent(code)}`, {
        cache: 'no-store',
      });
      const data = await res.json();
      setSession(data);
      if (data.seconds_remaining) {
        setTimeLeft(data.seconds_remaining);
      }
    } catch {
      setSession({
        valid: false,
        error: 'Unable to reach the MCast verification service. Please try again shortly.',
      });
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [code, apiUrl]);

  useEffect(() => {
    verifyCode();
  }, [verifyCode]);

  // Countdown timer for pending sessions
  useEffect(() => {
    if (!session?.valid || session.status === 'completed' || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [session, timeLeft]);

  // If already connected, auto-refresh live status every 30s
  useEffect(() => {
    if (session?.status !== 'completed') return;

    const interval = setInterval(() => {
      verifyCode(false);
    }, 30_000);

    return () => clearInterval(interval);
  }, [session?.status, verifyCode]);

  const handleCopyCode = async (textToCopy: string) => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(textToCopy);
      }
      setCopiedCode(true);
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
      copyTimeoutRef.current = setTimeout(() => setCopiedCode(false), 2000);
    } catch {}
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  if (loading) {
    return (
      <div
        className="w-full max-w-lg text-center py-12"
        style={{
          background: 'linear-gradient(145deg, rgba(20,20,20,.95), rgba(10,10,10,.95))',
          border: '1px solid var(--line)',
          borderRadius: 'var(--radius)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          padding: 'clamp(24px, 4vw, 40px)',
        }}
      >
        <div
          className="w-12 h-12 rounded-full animate-spin mx-auto mb-4"
          style={{
            border: '3px solid rgba(255,255,255,0.08)',
            borderTopColor: 'var(--yellow)',
          }}
        />
        <p className="text-[var(--muted)] text-sm m-0">Verifying linking session...</p>
      </div>
    );
  }

  // If session is already completed, render Connected Channel Dashboard
  if (session?.status === 'completed' && session.channel) {
    return (
      <div className="w-full max-w-xl flex flex-col items-center">
        <div
          className="w-full text-center mb-6 relative overflow-hidden"
          style={{
            background: 'linear-gradient(145deg, rgba(20,20,20,.95), rgba(10,10,10,.95))',
            border: '1px solid var(--line)',
            borderRadius: 'var(--radius)',
            padding: 'clamp(24px, 4vw, 36px)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.45)',
          }}
        >
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-xl mx-auto mb-3"
            style={{
              background: 'rgba(34, 197, 94, 0.12)',
              border: '1px solid rgba(34, 197, 94, 0.35)',
              color: '#4ade80',
            }}
          >
            <Check size={24} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-1 tracking-tight">
            YouTube Channel Connected
          </h1>
          <p className="text-sm text-[var(--muted)] m-0">
            This session has already been authorized. Live status is synchronizing below.
          </p>
        </div>

        <ConnectedChannelCard
          channel={session.channel}
          liveStatus={session.live_status || null}
          playerName={session.player_name}
          serverName={session.server_name}
          onRefresh={() => verifyCode(true)}
          isRefreshing={isRefreshing}
        />
      </div>
    );
  }

  // If session expired or invalid
  if (!session?.valid || (session.status !== 'completed' && timeLeft <= 0)) {
    return (
      <div
        className="w-full max-w-lg text-center relative overflow-hidden"
        style={{
          background: 'linear-gradient(145deg, rgba(24,14,14,.95), rgba(12,10,10,.95))',
          border: '1px solid rgba(255, 52, 52, 0.35)',
          borderRadius: 'var(--radius)',
          padding: 'clamp(24px, 4vw, 36px)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        }}
      >
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center text-2xl mx-auto mb-4"
          style={{
            background: 'rgba(255, 52, 52, 0.12)',
            border: '1px solid rgba(255, 52, 52, 0.35)',
            color: '#ff6b6b',
          }}
        >
          <AlertTriangle size={28} />
        </div>
        <h1 className="text-xl sm:text-2xl font-bold mb-2 text-white">
          Linking Session Expired or Invalid
        </h1>
        <p className="text-sm text-[var(--muted)] mb-6 leading-relaxed">
          {session?.error || 'This one-time linking link has expired or has already been used.'}
        </p>

        <div
          className="rounded-xl p-4 text-xs text-[var(--muted)] mb-6 text-left space-y-2"
          style={{
            background: 'rgba(8, 8, 8, 0.7)',
            border: '1px solid var(--line)',
          }}
        >
          <p className="font-semibold text-white m-0">How to get a fresh link:</p>
          <p className="m-0">1. Open Minecraft and connect to your server.</p>
          <p className="m-0">
            2. Type{' '}
            <code style={{ color: 'var(--yellow)', background: '#20200a', border: '1px solid #41400b', padding: '2px 6px', borderRadius: '4px' }}>
              /link youtube
            </code>{' '}
            in chat.
          </p>
          <p className="m-0">3. Click the new link generated in in-game chat.</p>
        </div>

        <Link
          href="/"
          className="btn btn-outline w-full"
          style={{ justifyContent: 'center' }}
        >
          Return to MCast Homepage
        </Link>
      </div>
    );
  }

  // Active Pending Session: Show "Connect with Google & YouTube"
  return (
    <div
      className="w-full max-w-lg relative overflow-hidden"
      style={{
        background: 'linear-gradient(145deg, rgba(20,20,20,.96), rgba(10,10,10,.96))',
        border: '1px solid var(--line)',
        borderRadius: 'var(--radius)',
        padding: 'clamp(24px, 4vw, 36px)',
        boxShadow: '0 24px 70px rgba(0,0,0,0.5)',
      }}
    >
      {/* Ambient subtle glow */}
      <div
        className="absolute -top-24 -right-24 w-52 h-52 bg-[var(--yellow)]/5 rounded-full blur-3xl pointer-events-none"
      />

      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 mb-3">
          <span
            className="pill"
            style={{
              borderColor: 'var(--line-yellow)',
              background: 'rgba(255, 229, 0, 0.08)',
              color: 'var(--yellow)',
              fontSize: '0.74rem',
            }}
          >
            <Clock size={12} />
            <span>Single-Use Link</span>
            <span>•</span>
            <span className="font-mono font-bold">Expires in {formattedTime}</span>
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight m-0">
          Connect YouTube Channel
        </h1>
        <p className="text-sm text-[var(--muted)] mt-2 mb-0 leading-relaxed">
          Authorize your YouTube account to synchronize your live status in Minecraft.
        </p>
      </div>

      {/* Player and Server Summary */}
      <div
        className="rounded-xl p-4 mb-6 space-y-3"
        style={{
          background: 'rgba(8, 8, 8, 0.75)',
          border: '1px solid var(--line)',
        }}
      >
        <div className="flex justify-between items-center text-sm">
          <span className="text-[var(--muted)]">Minecraft Player:</span>
          <span className="font-semibold text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 shadow-sm" />
            {session.player_name}
          </span>
        </div>
        <div className="h-px bg-white/5" />
        <div className="flex justify-between items-center text-sm">
          <span className="text-[var(--muted)]">Minecraft Server:</span>
          <span className="font-medium text-white">{session.server_name}</span>
        </div>
        <div className="h-px bg-white/5" />
        <div className="flex justify-between items-center text-xs">
          <span className="text-[var(--muted)]">Verification Code:</span>
          <div className="flex items-center gap-2">
            <span
              className="font-mono px-2 py-0.5 rounded font-bold"
              style={{
                color: 'var(--yellow)',
                background: '#19190d',
                border: '1px solid rgba(255, 229, 0, 0.3)',
              }}
            >
              {session.code}
            </span>
            {session.code && (
              <button
                onClick={() => handleCopyCode(session.code!)}
                className="copy-btn"
                style={{ padding: '4px 8px', fontSize: '0.68rem' }}
                title="Copy verification code"
                type="button"
              >
                {copiedCode ? <Check size={11} /> : <Copy size={11} />}
                <span>{copiedCode ? 'Copied!' : 'Copy'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Security & Permissions Callout */}
      <div
        className="rounded-xl p-4 mb-6 text-xs space-y-2"
        style={{
          background: 'rgba(16, 16, 16, 0.7)',
          border: '1px solid var(--line)',
          color: 'var(--muted)',
        }}
      >
        <div className="flex items-center gap-1.5 font-bold text-white text-[13px]">
          <Shield size={14} className="text-[var(--yellow)]" />
          <span>Permissions &amp; Privacy Guarantee</span>
        </div>
        <p className="m-0 leading-relaxed">
          MCast requests <strong className="text-white">read-only</strong> YouTube access (
          <code style={{ color: 'var(--yellow)', background: '#20200a', padding: '1px 5px', borderRadius: '3px' }}>
            youtube.readonly
          </code>
          ) solely to detect when you are actively broadcasting Minecraft.
        </p>
        <div className="pt-1 space-y-1 text-[11px] border-t border-white/5">
          <p className="m-0 flex items-start gap-1.5">
            <span className="text-[var(--yellow)] font-bold">•</span>
            <span>We <strong className="text-white">never</strong> post, comment, or manage your videos or channel.</span>
          </p>
          <p className="m-0 flex items-start gap-1.5">
            <span className="text-[var(--yellow)] font-bold">•</span>
            <span>We <strong className="text-white">never</strong> access Google passwords, emails, or personal data.</span>
          </p>
          <p className="m-0 flex items-start gap-1.5">
            <span className="text-[var(--yellow)] font-bold">•</span>
            <span>Tokens are encrypted with AES-256-GCM and never shared with Minecraft server owners.</span>
          </p>
        </div>
      </div>

      {/* Google OAuth Action Button */}
      <a
        href={`${apiUrl}/v1/oauth/authorize?code=${encodeURIComponent(session.code || '')}`}
        className="btn btn-primary w-full shadow-lg"
        style={{
          justifyContent: 'center',
          padding: '14px 20px',
          fontSize: '0.94rem',
        }}
      >
        {/* Official Google G Logo */}
        <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
        <span className="text-black font-extrabold">Connect with Google &amp; YouTube</span>
      </a>

      <p className="text-[11px] text-center text-[var(--muted)] mt-4 mb-0 leading-relaxed">
        By continuing, you agree to the{' '}
        <Link href="/terms-of-service" target="_blank" className="text-white hover:text-[var(--yellow)] underline">
          MCast Terms of Service
        </Link>
        ,{' '}
        <Link href="/privacy-policy" target="_blank" className="text-white hover:text-[var(--yellow)] underline">
          Privacy Policy
        </Link>
        , and{' '}
        <a
          href="https://www.youtube.com/t/terms"
          target="_blank"
          rel="noopener noreferrer"
          className="text-white hover:text-[var(--yellow)] underline"
        >
          YouTube Terms of Service
        </a>.
      </p>
    </div>
  );
}

export default function PlayerLinkPage() {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--white)] flex flex-col justify-between selection:bg-[var(--yellow)] selection:text-[#080808] relative overflow-hidden">
      {/* Atmospheric subtle background glow */}
      <div
        className="absolute inset-0 pointer-events-none -z-10"
        style={{
          backgroundImage:
            'radial-gradient(circle at 50% 10%, rgba(255,229,0,0.06), transparent 55%), radial-gradient(circle at 80% 80%, rgba(255,52,52,0.03), transparent 45%)',
        }}
      />

      {/* Modernized Minimal MCast Topbar */}
      <Header
        variant="minimal"
        badge="OAuth Authorization"
        badgeType="warning"
        backHref="/"
        backLabel="← Homepage"
      />

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center px-4 py-16 sm:py-24">
        <Suspense
          fallback={
            <div className="text-[var(--muted)] text-sm animate-pulse">
              Loading session details...
            </div>
          }
        >
          <PlayerLinkContent />
        </Suspense>
      </main>

      {/* Modernized Minimal MCast Footer */}
      <Footer variant="minimal" />
    </div>
  );
}
