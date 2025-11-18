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

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 flex flex-col items-center">
      <div className="w-full max-w-2xl px-4 py-10">
        <button
          onClick={() => router.push('/')}
          className="mb-4 text-sm text-slate-300 underline"
        >
          ← Back to dashboard
        </button>

        {loading && <p>Loading…</p>}
        {error && !loading && <p className="text-red-400">{error}</p>}

        {data && !loading && (
          <div className="space-y-4">
            <h1 className="text-2xl font-bold">Stats for {data.code}</h1>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm">{data.shortUrl}</span>
              </div>

              <div>
                <p className="text-xs text-slate-400 mb-1">Target URL</p>
                <a
                  href={data.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-slate-200 underline break-all"
                >
                  {data.url}
                </a>
              </div>

              <p className="text-sm">
                Total clicks: <strong>{data.clicks}</strong>
              </p>
              <p className="text-sm text-slate-300">
                Created: {new Date(data.createdAt).toLocaleString()}
              </p>
              <p className="text-sm text-slate-300">
                Last clicked:{' '}
                {data.lastClickedAt
                  ? new Date(data.lastClickedAt).toLocaleString()
                  : 'Never'}
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
