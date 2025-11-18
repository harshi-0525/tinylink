import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function isValidUrl(url: string) {
  try {
    const u = new URL(url);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

function isValidCode(code: string) {
  return /^[A-Za-z0-9]{6,8}$/.test(code);
}

function generateCode(length = 6) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

// GET /api/links?q=...
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q') ?? '';

    const where: any = { deletedAt: null };

    if (q.trim().length > 0) {
      where.OR = [
        { code: { contains: q, mode: 'insensitive' } },
        { targetUrl: { contains: q, mode: 'insensitive' } },
      ];
    }

    const links = await prisma.link.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';

    const data = links.map((link) => ({
      code: link.code,
      url: link.targetUrl,
      shortUrl: `${baseUrl}/${link.code}`,
      clicks: link.clicks,
      lastClickedAt: link.lastClickedAt,
      createdAt: link.createdAt,
    }));

    return NextResponse.json(data);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to load links' }, { status: 500 });
  }
}

// POST /api/links
export async function POST(req: Request) {
  try {
    const body = await req.json();
    let { url, code } = body as { url?: string; code?: string };

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    url = url.trim();

    if (!isValidUrl(url)) {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
    }

    if (code != null) {
      code = String(code).trim();
      if (!isValidCode(code)) {
        return NextResponse.json(
          { error: 'Code must be 6–8 letters or numbers' },
          { status: 400 }
        );
      }
    } else {
      // generate random code
      let unique = false;
      let attempts = 0;
      while (!unique && attempts < 5) {
        const candidate = generateCode(6);
        const existing = await prisma.link.findUnique({ where: { code: candidate } });
        if (!existing) {
          code = candidate;
          unique = true;
        }
        attempts++;
      }
      if (!code) {
        return NextResponse.json({ error: 'Failed to generate code' }, { status: 500 });
      }
    }

    const created = await prisma.link.create({
      data: {
        code: code!,
        targetUrl: url,
      },
    });

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';

    return NextResponse.json(
      {
        code: created.code,
        url: created.targetUrl,
        shortUrl: `${baseUrl}/${created.code}`,
        clicks: created.clicks,
        lastClickedAt: created.lastClickedAt,
        createdAt: created.createdAt,
      },
      { status: 201 }
    );
  } catch (e: any) {
    console.error(e);

    if (e.code === 'P2002') {
      return NextResponse.json({ error: 'Code already exists' }, { status: 409 });
    }

    return NextResponse.json({ error: 'Failed to create link' }, { status: 500 });
  }
}
