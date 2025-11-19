'use client';

import { useEffect, useState } from 'react';

type LinkItem = {
  code: string;
  url: string;
  shortUrl: string;
  clicks: number;
  lastClickedAt: string | null;
  createdAt: string;
};

export default function HomePage() {
  const [url, setUrl] = useState('');
  const [code, setCode] = useState('');
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  async function loadLinks(q: string = '') {
    try {
      const res = await fetch('/api/links' + (q ? `?q=${encodeURIComponent(q)}` : ''));
      if (!res.ok) throw new Error('Failed to load links');
      const data = await res.json();
      setLinks(data);
    } catch (e: any) {
      console.error(e);
      setError('Failed to load links');
    }
  }

  useEffect(() => {
    loadLinks();
  }, []);

  // Debounced search
  useEffect(() => {
    const id = setTimeout(() => {
      loadLinks(search);
    }, 300);
    return () => clearTimeout(id);
  }, [search]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url,
          code: code || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to create link');
      } else {
        setUrl('');
        setCode('');
        await loadLinks(search);
      }
    } catch (e: any) {
      console.error(e);
      setError('Failed to create link');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(code: string) {
    if (!confirm(`Delete link ${code}?`)) return;

    try {
      const res = await fetch(`/api/links/${code}`, {
        method: 'DELETE',
      });
      if (!res.ok && res.status !== 204) {
        throw new Error('Failed to delete');
      }
      await loadLinks(search);
    } catch (e: any) {
      console.error(e);
      setError('Failed to delete link');
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).catch(() => {
      alert('Could not copy');
    });
  }

  return (
    <>
      <main className="relative min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-50 flex flex-col items-center overflow-hidden">
        {/* Glowing background orbs */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 -left-32 h-72 w-72 rounded-full bg-emerald-500/20 blur-3xl" />
          <div className="absolute -bottom-40 -right-10 h-80 w-80 rounded-full bg-sky-500/10 blur-3xl" />
        </div>

        <div className="relative w-full max-w-3xl px-4 py-10 fade-in-up">
          <header className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-emerald-400 via-sky-400 to-emerald-300 bg-clip-text text-transparent">
                TinyLink
              </h1>
              <p className="text-sm text-slate-300/90 mt-1">
                Minimal, fast URL shortener with simple analytics.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_12px_rgba(52,211,153,0.8)]" />
              <span className="font-mono uppercase tracking-wide">
                Live · {links.length} link{links.length === 1 ? '' : 's'}
              </span>
            </div>
          </header>

          {/* Create form */}
          <form
            onSubmit={handleCreate}
            className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 mb-7 space-y-4 shadow-[0_18px_45px_rgba(15,23,42,0.95)] backdrop-blur-xl transition-all duration-300 hover:border-emerald-500/50 hover:shadow-[0_18px_60px_rgba(16,185,129,0.25)]"
          >
            <div className="flex items-center justify-between gap-2 mb-1">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                Create new link
              </p>
              <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-[10px] font-medium text-emerald-300 border border-emerald-500/30">
                URL Shortener · v1
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs text-slate-300/90">Long URL</label>
              <input
                className="w-full rounded-lg bg-slate-950/80 border border-slate-700/80 px-3 py-2.5 text-sm placeholder:text-slate-500 shadow-inner outline-none transition-all duration-200 focus:border-emerald-400/70 focus:ring-2 focus:ring-emerald-500/40 focus:ring-offset-2 focus:ring-offset-slate-950"
                placeholder="https://example.com/very/long/url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs text-slate-300/90">
                Custom code{' '}
                <span className="text-slate-500">(optional, 6–8 letters/numbers)</span>
              </label>
              <input
                className="w-full rounded-lg bg-slate-950/80 border border-slate-700/80 px-3 py-2.5 text-sm placeholder:text-slate-600 shadow-inner outline-none transition-all duration-200 focus:border-sky-400/70 focus:ring-2 focus:ring-sky-500/40 focus:ring-offset-2 focus:ring-offset-slate-950"
                placeholder="myblog1"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
            </div>

            {error && (
              <p className="text-xs text-red-400 bg-red-900/20 border border-red-500/40 rounded-md px-3 py-2 flex items-center gap-2">
                <span className="inline-flex h-1.5 w-1.5 rounded-full bg-red-400" />
                {error}
              </p>
            )}

            <div className="flex items-center justify-between gap-3 pt-1">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-[0_12px_30px_rgba(16,185,129,0.45)] transition-all duration-200 hover:bg-emerald-400 hover:shadow-[0_18px_45px_rgba(16,185,129,0.65)] hover:-translate-y-0.5 active:translate-y-[1px] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full border-2 border-slate-900 border-t-transparent animate-spin" />
                    Creating…
                  </span>
                ) : (
                  'Shorten link'
                )}
              </button>

              <p className="text-[10px] text-slate-400 text-right max-w-[60%]">
                Tip: Leave{' '}
                <span className="font-mono text-emerald-300/90">Custom code</span> empty to use a
                random code.
              </p>
            </div>
          </form>

          {/* Search and list */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
            <h2 className="text-sm font-semibold tracking-[0.18em] uppercase text-slate-400">
              Your links
            </h2>

            <div className="relative w-full sm:w-52">
              <div className="pointer-events-none absolute inset-y-0 left-2 flex items-center">
                <span className="h-2 w-2 rounded-full bg-slate-500/70" />
              </div>
              <input
                placeholder="Search by code or URL..."
                className="w-full rounded-full bg-slate-900/70 border border-slate-700/80 pl-7 pr-3 py-1.5 text-[11px] placeholder:text-slate-500 outline-none transition-all duration-200 focus:border-emerald-400/70 focus:ring-2 focus:ring-emerald-500/40"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-emerald-300/80">
                  {links.length} result{links.length === 1 ? '' : 's'}
                </span>
              )}
            </div>
          </div>

          {links.length === 0 ? (
            <p className="text-slate-400 text-xs bg-slate-900/60 border border-dashed border-slate-700/80 rounded-xl px-4 py-3">
              No links yet. Paste a long URL above to generate your first short link.
            </p>
          ) : (
            <div className="space-y-2.5">
              {links.map((link) => (
                <div
                  key={link.code}
                  className="group bg-slate-900/70 border border-slate-800/80 rounded-2xl p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between shadow-[0_10px_30px_rgba(15,23,42,0.65)] transition-all duration-200 hover:border-emerald-400/50 hover:shadow-[0_20px_45px_rgba(16,185,129,0.25)] hover:-translate-y-0.5 fade-in-up"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-950/80 border border-slate-700/80 px-2.5 py-1 text-[11px] font-mono tracking-tight text-slate-100 transition-colors duration-200 group-hover:border-emerald-400/70 group-hover:text-emerald-300">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400/80 shadow-[0_0_10px_rgba(16,185,129,0.85)]" />
                        {link.code}
                      </span>
                      <button
                        onClick={() => copyToClipboard(link.shortUrl)}
                        className="text-[11px] border border-slate-700/80 rounded-full px-2.5 py-1 text-slate-200/90 bg-slate-900/70 transition-all duration-200 hover:border-emerald-400/70 hover:bg-emerald-500/10 hover:text-emerald-200 active:scale-95"
                      >
                        Copy
                      </button>
                    </div>

                    <a
                      href={link.url}
                      target="_blank"
                      className="text-[11px] text-slate-300/90 break-all underline underline-offset-[3px] decoration-slate-600/70 hover:decoration-emerald-400/80 hover:text-emerald-100 transition-colors duration-200"
                      rel="noreferrer"
                    >
                      {link.url}
                    </a>

                    <p className="text-[10px] text-slate-400 flex flex-wrap items-center gap-1">
                      <span className="inline-flex items-center gap-1">
                        <span className="h-1 w-1 rounded-full bg-slate-500/70" />
                        Clicks:{' '}
                        <span className="font-medium text-emerald-300/90">{link.clicks}</span>
                      </span>
                      {link.lastClickedAt && (
                        <>
                          <span className="mx-1 text-slate-600">·</span>
                          <span className="inline-flex items-center gap-1">
                            <span className="h-1 w-1 rounded-full bg-slate-500/70" />
                            Last clicked:{' '}
                            <span className="text-slate-300/90">
                              {new Date(link.lastClickedAt).toLocaleString()}
                            </span>
                          </span>
                        </>
                      )}
                    </p>
                  </div>

                  <div className="flex gap-2 justify-end">
                    <a
                      href={`/code/${link.code}`}
                      className="text-[11px] border border-slate-700/80 rounded-full px-3 py-1.5 text-slate-200/90 bg-slate-950/80 transition-all duration-200 hover:border-sky-400/80 hover:bg-sky-500/10 hover:text-sky-100 active:scale-95"
                    >
                      View stats
                    </a>
                    <button
                      onClick={() => handleDelete(link.code)}
                      className="text-[11px] border border-red-500/60 text-red-300 rounded-full px-3 py-1.5 bg-red-950/30 transition-all duration-200 hover:bg-red-600/15 hover:border-red-400/80 hover:text-red-100 active:scale-95"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Local animations / keyframes kept in this file only */}
      <style jsx>{`
        .fade-in-up {
          opacity: 0;
          transform: translateY(6px);
          animation: fadeInUp 0.4s ease-out forwards;
        }

        .fade-in-up:nth-of-type(2) {
          animation-delay: 0.03s;
        }
        .fade-in-up:nth-of-type(3) {
          animation-delay: 0.06s;
        }
        .fade-in-up:nth-of-type(4) {
          animation-delay: 0.09s;
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
