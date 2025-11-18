import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Redirect short code -> target URL
export async function GET(_req: Request, context: any) {
  // In Next 16, context.params is a Promise
  const { code } = await context.params;

  if (!code) {
    return new NextResponse('Not found', { status: 404 });
  }

  const link = await prisma.link.findUnique({
    where: { code },
  });

  if (!link || link.deletedAt) {
    return new NextResponse('Not found', { status: 404 });
  }

  await prisma.link.update({
    where: { code },
    data: {
      clicks: link.clicks + 1,
      lastClickedAt: new Date(),
    },
  });

  return NextResponse.redirect(link.targetUrl);
}
