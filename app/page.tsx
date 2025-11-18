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
    <main className="min-h-screen bg-slate-950 text-slate-50 flex flex-col items-center">
      <div className="w-full max-w-3xl px-4 py-10">
        <h1 className="text-3xl font-bold mb-2">TinyLink</h1>
        <p className="text-slate-300 mb-6">
          Simple link shortener. Paste a long URL, get a short one.
        </p>

        {/* Create form */}
        <form
          onSubmit={handleCreate}
          className="bg-slate-900 border border-slate-800 rounded-xl p-4 mb-6 space-y-3"
        >
          <div>
            <label className="block text-sm mb-1">Long URL</label>
            <input
              className="w-full rounded-md bg-slate-950 border border-slate-700 px-3 py-2 text-sm"
              placeholder="https://example.com/very/long/url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-1">
              Custom code (optional, 6–8 letters/numbers)
            </label>
            <input
              className="w-full rounded-md bg-slate-950 border border-slate-700 px-3 py-2 text-sm"
              placeholder="myblog1"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </div>

          {error && (
            <p className="text-sm text-red-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center rounded-md bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-sm font-medium px-4 py-2 mt-2"
          >
            {loading ? 'Creating…' : 'Shorten'}
          </button>
        </form>

        {/* Search and list */}
        <div className="flex items-center justify-between mb-3 gap-2">
          <h2 className="text-xl font-semibold">Your links</h2>
          <input
            placeholder="Search..."
            className="text-xs px-2 py-1 rounded-md bg-slate-900 border border-slate-700"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {links.length === 0 ? (
          <p className="text-slate-400 text-sm">
            No links yet. Create one above.
          </p>
        ) : (
          <div className="space-y-2">
            {links.map((link) => (
              <div
                key={link.code}
                className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm">{link.code}</span>
                    <button
                      onClick={() => copyToClipboard(link.shortUrl)}
                      className="text-xs border border-slate-700 rounded px-2 py-1"
                    >
                      Copy
                    </button>
                  </div>
                  <a
                    href={link.url}
                    target="_blank"
                    className="text-xs text-slate-300 break-all underline"
                    rel="noreferrer"
                  >
                    {link.url}
                  </a>
                  <p className="text-xs text-slate-400">
                    Clicks: {link.clicks}{' '}
                    {link.lastClickedAt && (
                      <>· Last clicked: {new Date(link.lastClickedAt).toLocaleString()}</>
                    )}
                  </p>
                </div>

                <div className="flex gap-2">
                  <a
                    href={`/code/${link.code}`}
                    className="text-xs border border-slate-700 rounded px-2 py-1"
                  >
                    Stats
                  </a>
                  <button
                    onClick={() => handleDelete(link.code)}
                    className="text-xs border border-red-500 text-red-300 rounded px-2 py-1"
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
  );
}
