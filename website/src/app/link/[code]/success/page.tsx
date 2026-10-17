'use client';

import React, { useEffect, useState, useCallback, Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ConnectedChannelCard, { ChannelInfo, LiveStatusInfo } from '@/components/ConnectedChannelCard';
import { Check, Gamepad2, ArrowRight } from 'lucide-react';

function SuccessContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const code = (params?.code as string) || '';

  const initialChannelName = searchParams?.get('channel') || '';
  const initialPlayer = searchParams?.get('player') || '';
  const initialAvatar = searchParams?.get('avatar') || '';
  const initialCustomUrl = searchParams?.get('custom_url') || '';
  const initialChannelId = searchParams?.get('channel_id') || '';

  const [channel, setChannel] = useState<ChannelInfo | null>(() => {
    if (initialChannelId || initialChannelName) {
      return {
        channel_id: initialChannelId || 'connected',
        channel_title: initialChannelName || 'YouTube Channel',
        custom_url: initialCustomUrl || null,
        avatar_url: initialAvatar || null,
        channel_url: initialCustomUrl
          ? `https://www.youtube.com/${initialCustomUrl.startsWith('@') ? initialCustomUrl : '@' + initialCustomUrl}`
          : (initialChannelId ? `https://www.youtube.com/channel/${initialChannelId}` : 'https://www.youtube.com'),
      };
    }
    return null;
  });

  const [liveStatus, setLiveStatus] = useState<LiveStatusInfo | null>(null);
  const [playerName, setPlayerName] = useState<string>(initialPlayer);
  const [serverName, setServerName] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(!channel);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.mcast.fun';

  const fetchStatus = useCallback(async (isManualRefresh = false) => {
    if (!code) return;
    if (isManualRefresh) setIsRefreshing(true);

    try {
      const res = await fetch(`${apiUrl}/v1/link-sessions/verify?code=${encodeURIComponent(code)}`, {
        cache: 'no-store',
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch status');
      }

      if (data.player_name) setPlayerName(data.player_name);
      if (data.server_name) setServerName(data.server_name);

      if (data.channel) {
        setChannel(data.channel);
      }

      if (data.live_status) {
        setLiveStatus(data.live_status);
      }
      setError(null);
    } catch (err: any) {
      console.warn('[MCast Frontend] Error fetching channel live status:', err.message);
      if (!channel) {
        setError(err.message || 'Unable to connect to verification API');
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [code, apiUrl, channel]);

  useEffect(() => {
    fetchStatus();

    // Sensible 30-second polling interval to auto-refresh live status
    const timer = setInterval(() => {
      fetchStatus(false);
    }, 30_000);

    return () => clearInterval(timer);
  }, [fetchStatus]);

  return (
    <div className="w-full max-w-xl flex flex-col items-center">
      {/* Top Completion Banner */}
      <div
        className="w-full text-center mb-6 relative overflow-hidden"
        style={{
          background: 'linear-gradient(145deg, rgba(20,20,20,.96), rgba(10,10,10,.96))',
          border: '1px solid var(--line)',
          borderRadius: 'var(--radius)',
          padding: 'clamp(24px, 4vw, 36px)',
          boxShadow: '0 24px 70px rgba(0,0,0,0.5)',
        }}
      >
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center text-2xl mx-auto mb-4"
          style={{
            background: 'rgba(34, 197, 94, 0.12)',
            border: '2px solid rgba(34, 197, 94, 0.45)',
            color: '#4ade80',
            boxShadow: '0 0 24px rgba(34, 197, 94, 0.2)',
          }}
        >
          <Check size={28} />
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-2 tracking-tight">
          Account Linked Successfully!
        </h1>
        <p className="text-sm text-[var(--muted)] leading-relaxed max-w-md mx-auto m-0">
          Your YouTube account has been securely associated with your Minecraft streamer profile.
        </p>
      </div>

      {/* Connected Channel & Live Status Display Card */}
      <ConnectedChannelCard
        channel={channel}
        liveStatus={liveStatus}
        playerName={playerName}
        serverName={serverName}
        isLoading={isLoading}
        error={error}
        onRefresh={() => fetchStatus(true)}
        isRefreshing={isRefreshing}
      />

      {/* In-Game Instructions */}
      <div
        className="w-full rounded-xl p-5 mt-6 text-xs text-left space-y-3"
        style={{
          background: 'rgba(16, 16, 16, 0.75)',
          border: '1px solid var(--line)',
          color: 'var(--muted)',
        }}
      >
        <div className="flex items-center gap-2 text-white font-bold text-sm">
          <Gamepad2 size={16} className="text-[var(--yellow)]" />
          <span>What happens now?</span>
        </div>
        <p className="m-0 leading-relaxed">
          1. <strong className="text-white">Return to Minecraft:</strong> Your server will confirm the link in chat.
        </p>
        <p className="m-0 leading-relaxed">
          2. <strong className="text-white">Start Streaming:</strong> Go live on YouTube with category <strong className="text-white">Gaming (Minecraft)</strong>.
        </p>
        <p className="m-0 leading-relaxed">
          3. <strong className="text-white">Automatic LIVE Indicator:</strong> Your in-game nametag will automatically display{' '}
          <span className="text-red-400 font-bold bg-red-950/60 border border-red-500/30 px-1.5 py-0.5 rounded text-[11px]">
            LIVE
          </span>!
        </p>
      </div>

      <div className="w-full mt-6">
        <Link
          href="/"
          className="btn btn-primary w-full"
          style={{ justifyContent: 'center', padding: '13px 20px', fontSize: '0.92rem' }}
        >
          <span>Visit MCast Homepage</span>
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}

export default function LinkSuccessPage() {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--white)] flex flex-col justify-between selection:bg-[var(--yellow)] selection:text-[#080808] relative overflow-hidden">
      {/* Atmospheric subtle background glow */}
      <div
        className="absolute inset-0 pointer-events-none -z-10"
        style={{
          backgroundImage:
            'radial-gradient(circle at 50% 10%, rgba(34,197,94,0.06), transparent 55%), radial-gradient(circle at 80% 80%, rgba(255,229,0,0.03), transparent 45%)',
        }}
      />

      {/* Modernized Minimal MCast Topbar */}
      <Header
        variant="minimal"
        badge="Connected &amp; Verified"
        badgeType="success"
        backHref="/"
        backLabel="← Homepage"
      />

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center px-4 py-16 sm:py-24">
        <Suspense
          fallback={
            <div className="text-[var(--muted)] text-sm animate-pulse">
              Loading confirmation...
            </div>
          }
        >
          <SuccessContent />
        </Suspense>
      </main>

      {/* Modernized Minimal MCast Footer */}
      <Footer variant="minimal" />
    </div>
  );
}

