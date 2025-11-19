'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

type LinkStats = {
  code: string;
  url: string;
  shortUrl: string;
  clicks: number;
  lastClickedAt: string | null;
  createdAt: string;
};

export default function CodePage() {
  const params = useParams();
  const router = useRouter();
  const code = params.code as string;

  const [data, setData] = useState<LinkStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/links/${code}`);
        const body = await res.json();
        if (!res.ok) {
          setError(body.error || 'Not found');
        } else {
          setData(body);
        }
      } catch (e: any) {
        setError('Failed to load');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [code]);

  function copyToClipboard(text: string) {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
      })
      .catch(() => {
        alert('Could not copy');
      });
  }

  return (
    <>
      <main className="relative min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-50 flex flex-col items-center overflow-hidden">
        {/* Glowing background orbs */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 -left-20 h-64 w-64 rounded-full bg-emerald-500/20 blur-3xl" />
          <div className="absolute -bottom-40 -right-10 h-80 w-80 rounded-full bg-sky-500/15 blur-3xl" />
        </div>

        <div className="relative w-full max-w-2xl px-4 py-10 fade-in-up">
          {/* Top bar */}
          <div className="mb-6 flex items-center justify-between gap-3">
            <button
              onClick={() => router.push('/')}
              className="inline-flex items-center gap-2 rounded-full border border-slate-700/70 bg-slate-900/70 px-3 py-1.5 text-xs text-slate-200 hover:border-emerald-400/70 hover:bg-slate-900/90 hover:text-emerald-200 transition-all duration-200 hover:-translate-x-0.5 active:translate-x-[1px]"
            >
              <span className="text-base leading-none">←</span>
              <span className="uppercase tracking-[0.16em] text-[10px]">
                Back to dashboard
              </span>
            </button>

            <div className="flex items-center gap-2 text-[10px] text-slate-400">
              <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.9)]" />
              <span className="font-mono uppercase tracking-[0.18em]">
                Stats view
              </span>
            </div>
          </div>

          {/* Loading state */}
          {loading && (
            <div className="space-y-4">
              <div className="h-6 w-40 rounded-md bg-slate-800/60 animate-pulse" />
              <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-4 space-y-3 shadow-[0_14px_40px_rgba(15,23,42,0.9)]">
                <div className="h-4 w-52 rounded-md bg-slate-800/60 animate-pulse" />
                <div className="h-3 w-full rounded-md bg-slate-800/60 animate-pulse" />
                <div className="h-3 w-3/4 rounded-md bg-slate-800/60 animate-pulse" />
                <div className="h-10 w-full rounded-xl bg-slate-800/60 animate-pulse" />
                <div className="h-10 w-full rounded-xl bg-slate-800/60 animate-pulse" />
              </div>
            </div>
          )}

          {/* Error state */}
          {error && !loading && (
            <div className="bg-red-950/30 border border-red-500/50 text-red-200 rounded-2xl p-4 space-y-2 shadow-[0_14px_40px_rgba(127,29,29,0.6)] fade-in-up">
              <p className="text-sm font-semibold">Something went wrong</p>
              <p className="text-xs text-red-100/80">{error}</p>
              <button
                onClick={() => router.push('/')}
                className="mt-1 inline-flex items-center gap-1 rounded-full border border-red-500/60 px-3 py-1.5 text-[11px] text-red-100/90 hover:bg-red-500/15 transition-colors duration-200"
              >
                <span>←</span>
                Go back home
              </button>
            </div>
          )}

          {/* Loaded stats */}
          {data && !loading && (
            <div className="space-y-5 fade-in-up">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-emerald-400 to-sky-400 bg-clip-text text-transparent">
                    Stats for <span className="font-mono">{data.code}</span>
                  </h1>
                  <p className="mt-1 text-xs text-slate-400/90">
                    Detailed analytics for this short link.
                  </p>
                </div>

                <span className="hidden sm:inline-flex items-center rounded-full bg-slate-900/80 border border-slate-700/80 px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-slate-300/90">
                  Created{' '}
                  {new Date(data.createdAt).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>

              <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5 space-y-4 shadow-[0_16px_45px_rgba(15,23,42,0.95)] backdrop-blur-xl transition-all duration-300 hover:border-emerald-500/60 hover:shadow-[0_20px_60px_rgba(16,185,129,0.3)]">
                {/* Short URL + copy */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                      Short URL
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center rounded-full bg-slate-950/80 border border-slate-700/80 px-3 py-1.5 text-[11px] font-mono text-slate-100">
                      {data.shortUrl}
                    </span>
                    <button
                      onClick={() => copyToClipboard(data.shortUrl)}
                      className="inline-flex items-center gap-1 rounded-full border border-slate-700/80 bg-slate-900/80 px-3 py-1.5 text-[11px] text-slate-200 hover:border-emerald-400/70 hover:bg-emerald-500/10 hover:text-emerald-100 active:scale-95 transition-all duration-200"
                    >
                      {copied ? (
                        <>
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                          Copied
                        </>
                      ) : (
                        <>
                          <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Target URL */}
                <div className="space-y-1.5">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                    Target URL
                  </p>
                  <a
                    href={data.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-xs text-slate-100 underline underline-offset-[3px] decoration-slate-600/70 hover:decoration-emerald-400/80 hover:text-emerald-100 break-all transition-colors duration-200"
                  >
                    {data.url}
                    <span className="text-[10px] rounded-full border border-slate-600/80 px-2 py-0.5 bg-slate-950/80 text-slate-300 hover:border-emerald-400/70 hover:text-emerald-200 transition-colors duration-200">
                      Open
                    </span>
                  </a>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="rounded-xl bg-slate-950/70 border border-slate-800/80 px-3 py-3 flex flex-col gap-1.5 transition-all duration-200 hover:border-emerald-400/70 hover:-translate-y-0.5">
                    <p className="text-[11px] text-slate-400 uppercase tracking-[0.16em]">
                      Total clicks
                    </p>
                    <p className="text-xl font-semibold text-emerald-300">
                      {data.clicks}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      All-time click count for this link.
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-950/70 border border-slate-800/80 px-3 py-3 flex flex-col gap-1.5 transition-all duration-200 hover:border-sky-400/70 hover:-translate-y-0.5">
                    <p className="text-[11px] text-slate-400 uppercase tracking-[0.16em]">
                      Created at
                    </p>
                    <p className="text-xs text-slate-100">
                      {new Date(data.createdAt).toLocaleString()}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      When this short link was first generated.
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-950/70 border border-slate-800/80 px-3 py-3 flex flex-col gap-1.5 transition-all duration-200 hover:border-emerald-400/70 hover:-translate-y-0.5">
                    <p className="text-[11px] text-slate-400 uppercase tracking-[0.16em]">
                      Last clicked
                    </p>
                    <p className="text-xs text-slate-100">
                      {data.lastClickedAt
                        ? new Date(data.lastClickedAt).toLocaleString()
                        : 'Never'}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Latest time someone used this short URL.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Local animations / keyframes kept in this file only */}
      <style jsx>{`
        .fade-in-up {
          opacity: 0;
          transform: translateY(6px);
          animation: fadeInUp 0.45s ease-out forwards;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}
