'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, Radio, Lightbulb } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ConnectedChannelCard, { ChannelInfo, LiveStatusInfo } from '@/components/ConnectedChannelCard';

function DashboardContent() {
  const searchParams = useSearchParams();
  const queryParam = searchParams?.get('query') || searchParams?.get('channel') || '';

  const [inputVal, setInputVal] = useState(queryParam);
  const [channel, setChannel] = useState<ChannelInfo | null>(null);
  const [liveStatus, setLiveStatus] = useState<LiveStatusInfo | null>(null);
  const [playerName, setPlayerName] = useState<string>('');
  const [serverName, setServerName] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState<boolean>(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.mcast.fun';

  const lookupStatus = useCallback(async (query: string, isManualRefresh = false) => {
    const trimmed = query.trim();
    if (!trimmed) return;

    if (isManualRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);
    setHasSearched(true);

    try {
      // If starts with UC, query channel endpoint; otherwise query session status
      const isChannelId = trimmed.startsWith('UC') && trimmed.length >= 20;
      const url = isChannelId
        ? `${apiUrl}/v1/channels/${encodeURIComponent(trimmed)}/status`
        : `${apiUrl}/v1/link-sessions/verify?code=${encodeURIComponent(trimmed)}`;

      const res = await fetch(url, { cache: 'no-store' });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Channel or session not found');
      }

      if (isChannelId) {
        setChannel({
          channel_id: data.channel_id,
          channel_title: data.channel_title,
          custom_url: data.custom_url,
          avatar_url: data.avatar_url,
          channel_url: data.channel_url,
        });
        setLiveStatus({
          is_live: data.is_live,
          is_minecraft: data.is_minecraft,
          status: data.status,
          video_id: data.video_id,
          title: data.title,
          stream_url: data.stream_url,
          checked_at: data.checked_at,
          error: data.error,
        });
        setPlayerName('');
        setServerName('');
      } else {
        if (data.status === 'completed' && data.channel) {
          setChannel(data.channel);
          setLiveStatus(data.live_status);
          setPlayerName(data.player_name || '');
          setServerName(data.server_name || '');
        } else if (data.status === 'pending') {
          setChannel(null);
          setLiveStatus(null);
          setPlayerName(data.player_name || '');
          setServerName(data.server_name || '');
          setError(`Session code '${data.code}' is pending authorization. Click the link sent in Minecraft to authorize your YouTube account.`);
        } else {
          setChannel(null);
          setLiveStatus(null);
          setError(data.error || 'This linking session is no longer active.');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Unable to load channel information');
      setChannel(null);
      setLiveStatus(null);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [apiUrl]);

  useEffect(() => {
    if (queryParam) {
      lookupStatus(queryParam);
    }
  }, [queryParam, lookupStatus]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputVal.trim()) {
      lookupStatus(inputVal.trim());
    }
  };

  return (
    <div className="w-full max-w-2xl flex flex-col items-center">
      {/* Search & Lookup Header */}
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
        <div className="inline-flex items-center gap-1.5 mb-3">
          <span
            className="pill"
            style={{
              borderColor: 'var(--line-yellow)',
              background: 'rgba(255, 229, 0, 0.08)',
              color: 'var(--yellow)',
              fontSize: '0.74rem',
            }}
          >
            <Radio size={12} className="animate-pulse" />
            <span>Real-Time Broadcast Synchronization</span>
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-2 tracking-tight">
          Live Status Dashboard
        </h1>
        <p className="text-[var(--muted)] text-sm leading-relaxed max-w-md mx-auto mb-6 m-0">
          Look up any linked streamer or YouTube channel to verify active broadcast synchronization and nametag status.
        </p>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 max-w-lg mx-auto">
          <div className="relative flex-1">
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Enter Channel ID (UC...) or Linking Code"
              className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-stone-500 outline-none transition-colors"
              style={{
                background: 'rgba(8, 8, 8, 0.85)',
                border: '1px solid var(--line)',
              }}
              onFocus={(e) => (e.target.style.borderColor = 'var(--line-yellow)')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--line)')}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !inputVal.trim()}
            className="btn btn-primary"
            style={{ padding: '12px 24px', fontSize: '0.88rem' }}
          >
            <Search size={16} />
            <span>Search</span>
          </button>
        </form>
      </div>

      {/* Results View */}
      {hasSearched && (
        <div className="w-full">
          <ConnectedChannelCard
            channel={channel}
            liveStatus={liveStatus}
            playerName={playerName}
            serverName={serverName}
            isLoading={isLoading}
            error={error}
            onRefresh={() => lookupStatus(inputVal, true)}
            isRefreshing={isRefreshing}
          />
        </div>
      )}

      {/* How it works note */}
      {!hasSearched && (
        <div
          className="w-full rounded-xl p-5 text-left text-xs space-y-2.5"
          style={{
            background: 'rgba(16, 16, 16, 0.75)',
            border: '1px solid var(--line)',
            color: 'var(--muted)',
          }}
        >
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <Lightbulb size={16} className="text-[var(--yellow)]" />
            <span>How channels are tracked:</span>
          </div>
          <p className="m-0 leading-relaxed">
            • <strong className="text-white">Offline channels</strong> remain listed and connected. They are never hidden when offline.
          </p>
          <p className="m-0 leading-relaxed">
            • <strong className="text-white">Going live:</strong> When a connected streamer starts a stream tagged <strong className="text-white">Gaming (Minecraft)</strong>, the status automatically switches to <span className="text-red-400 font-bold bg-red-950/40 border border-red-500/30 px-1 py-0.5 rounded">LIVE</span>.
          </p>
          <p className="m-0 leading-relaxed">
            • Run{' '}
            <code style={{ color: 'var(--yellow)', background: '#20200a', border: '1px solid #41400b', padding: '1px 6px', borderRadius: '4px' }}>
              /link youtube
            </code>{' '}
            in Minecraft to connect a new account.
          </p>
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
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
        badge="Live Status Dashboard"
        badgeType="warning"
        backHref="/"
        backLabel="← Homepage"
      />

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center px-4 py-16 sm:py-24">
        <Suspense
          fallback={
            <div className="text-[var(--muted)] text-sm animate-pulse">
              Loading dashboard...
            </div>
          }
        >
          <DashboardContent />
        </Suspense>
      </main>

      {/* Modernized Minimal MCast Footer */}
      <Footer variant="minimal" />
    </div>
  );
}

