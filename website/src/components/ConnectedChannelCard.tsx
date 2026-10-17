'use client';

import React from 'react';
import { ExternalLink, RefreshCw, Radio, CheckCircle2, AlertCircle, Gamepad2 } from 'lucide-react';

function YouTubeIcon({ className = "w-4 h-4 text-red-500" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  );
}

export interface ChannelInfo {
  channel_id: string;
  channel_title: string;
  custom_url: string | null;
  avatar_url?: string | null;
  channel_url: string;
}

export interface LiveStatusInfo {
  is_live: boolean;
  is_minecraft: boolean;
  status: 'LIVE_MINECRAFT' | 'LIVE_NOT_MINECRAFT' | 'OFFLINE' | 'UNKNOWN';
  video_id?: string | null;
  title?: string | null;
  stream_url?: string | null;
  checked_at?: string;
  error?: string | null;
}

interface ConnectedChannelCardProps {
  channel: ChannelInfo | null;
  liveStatus: LiveStatusInfo | null;
  playerName?: string;
  serverName?: string;
  isLoading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export default function ConnectedChannelCard({
  channel,
  liveStatus,
  playerName,
  serverName,
  isLoading = false,
  error = null,
  onRefresh,
  isRefreshing = false,
}: ConnectedChannelCardProps) {
  // State 2: Account connected, channel information loading
  if (isLoading) {
    return (
      <div
        className="w-full text-center animate-pulse"
        style={{
          background: "linear-gradient(145deg, rgba(22,22,22,.95), rgba(12,12,12,.95))",
          border: "1px solid var(--line)",
          borderRadius: "var(--radius)",
          padding: "clamp(24px, 4vw, 36px)",
        }}
      >
        <div className="w-20 h-20 bg-white/5 rounded-full mx-auto mb-4"></div>
        <div className="h-6 bg-white/5 rounded-lg w-48 mx-auto mb-3"></div>
        <div className="h-4 bg-white/5 rounded-lg w-32 mx-auto mb-6"></div>
        <div className="bg-black/40 border border-white/5 rounded-xl p-4 h-24 mb-4"></div>
        <p className="text-xs text-[var(--muted)]">Synchronizing connected channel &amp; live status...</p>
      </div>
    );
  }

  // State 5: Channel information unavailable due to an API error (when no channel data at all)
  if (error && !channel) {
    return (
      <div
        className="w-full text-center"
        style={{
          background: "linear-gradient(145deg, rgba(26,14,14,.95), rgba(14,10,10,.95))",
          border: "1px solid rgba(255, 52, 52, 0.35)",
          borderRadius: "var(--radius)",
          padding: "clamp(24px, 4vw, 36px)",
          boxShadow: "0 18px 50px rgba(0,0,0,0.5)",
        }}
      >
        <div className="w-16 h-16 rounded-full bg-red-950/50 border border-red-500/40 text-red-400 flex items-center justify-center text-2xl mx-auto mb-4">
          <AlertCircle size={32} />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Channel Information Unavailable</h2>
        <p className="text-sm text-[var(--muted)] mb-6 leading-relaxed max-w-md mx-auto">
          {error || 'Unable to retrieve your YouTube channel data. Please try again shortly.'}
        </p>
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="btn btn-primary"
            style={{ fontSize: "0.86rem", padding: "10px 20px" }}
          >
            <RefreshCw size={15} className={isRefreshing ? 'animate-spin' : ''} />
            <span>Retry Connection Check</span>
          </button>
        )}
      </div>
    );
  }

  // State 1: Account not connected
  if (!channel) {
    return (
      <div
        className="w-full text-center"
        style={{
          background: "linear-gradient(145deg, rgba(20,20,20,.95), rgba(10,10,10,.95))",
          border: "1px solid var(--line)",
          borderRadius: "var(--radius)",
          padding: "clamp(24px, 4vw, 36px)",
        }}
      >
        <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 text-[var(--muted)] flex items-center justify-center mx-auto mb-4">
          <YouTubeIcon className="w-8 h-8 text-[var(--muted)]" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">No YouTube Account Connected</h2>
        <p className="text-sm text-[var(--muted)] mb-6 leading-relaxed max-w-md mx-auto">
          Connect your YouTube channel using a linking code from your Minecraft server.
        </p>
      </div>
    );
  }

  const isLive = liveStatus?.is_live ?? false;
  const isMinecraft = liveStatus?.is_minecraft ?? false;
  const channelUrl = channel.channel_url || `https://www.youtube.com/channel/${channel.channel_id}`;
  const streamUrl = liveStatus?.stream_url || (liveStatus?.video_id ? `https://www.youtube.com/watch?v=${liveStatus.video_id}` : channelUrl);

  return (
    <div
      className="w-full relative overflow-hidden text-left"
      style={{
        background: "linear-gradient(145deg, rgba(20,20,20,.97), rgba(11,11,11,.97))",
        border: isLive ? "1px solid rgba(255, 52, 52, 0.45)" : "1px solid var(--line)",
        borderRadius: "var(--radius)",
        padding: "clamp(20px, 3.5vw, 32px)",
        boxShadow: isLive ? "0 20px 60px rgba(255, 52, 52, 0.12), 0 10px 40px rgba(0,0,0,.6)" : "0 20px 60px rgba(0,0,0,0.45)",
      }}
    >
      {/* Dynamic ambient glow based on live status */}
      {isLive ? (
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-red-600/15 rounded-full blur-3xl pointer-events-none animate-pulse" />
      ) : (
        <div className="absolute -top-24 -right-24 w-52 h-52 bg-[var(--yellow)]/5 rounded-full blur-3xl pointer-events-none" />
      )}

      {/* Header bar: Connection Status & Refresh Action */}
      <div
        className="flex items-center justify-between pb-4 mb-6"
        style={{ borderBottom: "1px solid var(--line)" }}
      >
        <div className="flex items-center gap-2">
          <span
            className="pill"
            style={{
              background: "rgba(34, 197, 94, 0.12)",
              borderColor: "rgba(34, 197, 94, 0.35)",
              color: "#4ade80",
              fontSize: "0.76rem",
              padding: "6px 12px",
            }}
          >
            <CheckCircle2 size={13} />
            <span>Connected &amp; Synchronized</span>
          </span>
        </div>

        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="btn btn-outline"
            style={{ padding: "6px 12px", fontSize: "0.75rem", gap: "6px" }}
            title="Check live status now"
          >
            <RefreshCw size={12} className={isRefreshing ? 'animate-spin text-[var(--yellow)]' : ''} />
            <span>{isRefreshing ? 'Checking...' : 'Refresh Status'}</span>
          </button>
        )}
      </div>

      {/* Channel Profile Box (Avatar, Name, Handle, Link) */}
      <div
        className="flex flex-col sm:flex-row items-center sm:items-start gap-4 mb-6 p-4 rounded-xl"
        style={{
          background: "rgba(8, 8, 8, 0.7)",
          border: "1px solid var(--line)",
        }}
      >
        {/* Channel Avatar with Live indicator border */}
        <div className="relative shrink-0">
          {channel.avatar_url ? (
            <img
              src={channel.avatar_url}
              alt={channel.channel_title}
              className={`w-20 h-20 rounded-full object-cover border-2 shadow-md ${
                isLive ? 'border-red-500 ring-4 ring-red-500/25' : 'border-[var(--line)]'
              }`}
            />
          ) : (
            <div
              className={`w-20 h-20 rounded-full bg-[#181818] border-2 flex items-center justify-center text-white text-2xl font-bold shadow-md ${
                isLive ? 'border-red-500 ring-4 ring-red-500/25 text-red-500' : 'border-[var(--line)]'
              }`}
            >
              {channel.channel_title.slice(0, 1).toUpperCase()}
            </div>
          )}

          {isLive && (
            <span
              className="absolute -bottom-1 -right-1 bg-red-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider shadow"
            >
              Live
            </span>
          )}
        </div>

        {/* Channel Details */}
        <div className="flex-1 text-center sm:text-left min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
            <h3 className="text-lg font-bold text-white truncate" title={channel.channel_title}>
              {channel.channel_title}
            </h3>
            {channel.custom_url && (
              <span className="text-xs font-mono text-[var(--yellow)] truncate font-semibold">
                {channel.custom_url.startsWith('@') ? channel.custom_url : `@${channel.custom_url}`}
              </span>
            )}
          </div>

          <p className="text-xs text-[var(--muted)] font-mono mt-0.5 truncate">
            ID: {channel.channel_id}
          </p>

          <div className="mt-3 flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <a
              href={channelUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="pill hover:border-[var(--line-yellow)] hover:text-white transition-colors"
              style={{ fontSize: "0.75rem", padding: "6px 11px" }}
            >
              <YouTubeIcon className="w-3.5 h-3.5 text-red-500" />
              <span>Visit YouTube Channel</span>
              <ExternalLink size={11} />
            </a>

            {playerName && (
              <span className="pill" style={{ fontSize: "0.75rem", padding: "6px 11px" }}>
                Player: <strong className="text-white ml-1 font-semibold">{playerName}</strong>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Live Status Presentation Card */}
      {/* State 4: Channel connected and live */}
      {isLive ? (
        <div
          className="rounded-xl p-5 mb-6"
          style={{
            background: "linear-gradient(145deg, rgba(38,12,12,.8), rgba(20,8,8,.8))",
            border: "1px solid rgba(255, 52, 52, 0.45)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="live-dot" />
              <span className="text-red-400 font-extrabold text-sm tracking-wide uppercase">
                Currently Live on YouTube
              </span>
            </div>

            {isMinecraft && (
              <span
                className="pill"
                style={{
                  fontSize: "0.72rem",
                  padding: "4px 9px",
                  borderColor: "rgba(255, 229, 0, 0.4)",
                  background: "rgba(255, 229, 0, 0.1)",
                  color: "var(--yellow)",
                }}
              >
                <Gamepad2 size={12} />
                <span>Minecraft Tag Active</span>
              </span>
            )}
          </div>

          {liveStatus?.title && (
            <h4 className="text-white font-semibold text-sm mb-3 line-clamp-2">
              &ldquo;{liveStatus.title}&rdquo;
            </h4>
          )}

          <div
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3"
            style={{ borderTop: "1px solid rgba(255, 52, 52, 0.2)" }}
          >
            <span className="text-xs text-[var(--muted)]">
              Minecraft nametag displaying{" "}
              <span className="text-red-400 font-bold bg-red-950/60 border border-red-500/30 px-1.5 py-0.5 rounded text-[11px]">
                LIVE
              </span>
            </span>

            <a
              href={streamUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-4 py-2 rounded-lg transition-colors shadow-lg shadow-red-900/30"
            >
              <Radio size={14} />
              <span>Watch Live Stream</span>
              <ExternalLink size={12} />
            </a>
          </div>
        </div>
      ) : (
        /* State 3: Channel connected and offline */
        <div
          className="rounded-xl p-5 mb-6"
          style={{
            background: "rgba(16, 16, 16, 0.75)",
            border: "1px solid var(--line)",
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#525252]"></span>
              <span className="text-[var(--muted)] font-semibold text-xs tracking-wider uppercase">
                Channel Offline
              </span>
            </div>
            {liveStatus?.checked_at && (
              <span className="text-[11px] text-[var(--muted)]">
                Checked {new Date(liveStatus.checked_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            )}
          </div>

          <p className="text-xs text-[var(--muted)] leading-relaxed m-0">
            No active YouTube live broadcast detected. When you go live on YouTube with category <strong className="text-white">Gaming (Minecraft)</strong>, MCast will automatically attach your <span className="text-red-400 font-bold bg-red-950/40 border border-red-500/30 px-1 py-0.5 rounded">LIVE</span> nametag on <strong className="text-white">{serverName || 'your Minecraft server'}</strong>.
          </p>

          {liveStatus?.error && (
            <div className="mt-3 p-2.5 rounded-lg bg-amber-950/20 border border-amber-500/30 text-[11px] text-amber-200">
              Notice: {liveStatus.error}
            </div>
          )}
        </div>
      )}

      {/* Sub-card: Server & Player Context */}
      <div
        className="rounded-xl p-3.5 text-xs text-[var(--muted)] space-y-1.5"
        style={{
          background: "rgba(8, 8, 8, 0.6)",
          border: "1px solid var(--line)",
        }}
      >
        <div className="flex justify-between items-center">
          <span>Target Minecraft Server:</span>
          <span className="text-white font-medium">{serverName || 'Minecraft Server'}</span>
        </div>
        {playerName && (
          <div className="flex justify-between items-center">
            <span>Linked In-Game Player:</span>
            <span className="text-white font-medium">{playerName}</span>
          </div>
        )}
      </div>
    </div>
  );
}

