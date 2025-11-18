import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type LinkContext = {
  params: Promise<{ code: string }>;
};

// GET /api/links/:code -> stats for one link
export async function GET(_req: Request, context: LinkContext) {
  const { code } = await context.params;

  if (!code) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const link = await prisma.link.findUnique({
    where: { code },
  });

  if (!link || link.deletedAt) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';

  return NextResponse.json({
    code: link.code,
    url: link.targetUrl,
    shortUrl: `${baseUrl}/${link.code}`,
    clicks: link.clicks,
    lastClickedAt: link.lastClickedAt,
    createdAt: link.createdAt,
  });
}

// DELETE /api/links/:code -> soft delete
export async function DELETE(_req: Request, context: LinkContext) {
  const { code } = await context.params;

  if (!code) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const link = await prisma.link.findUnique({
    where: { code },
  });

  if (!link || link.deletedAt) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  await prisma.link.update({
    where: { code },
    data: { deletedAt: new Date() },
  });

  return new NextResponse(null, { status: 204 });
}
