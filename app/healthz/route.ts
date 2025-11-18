import { NextResponse } from 'next/server';

const START_TIME = Date.now();

export async function GET() {
  const uptimeSeconds = Math.floor((Date.now() - START_TIME) / 1000);

  return NextResponse.json({
    ok: true,
    version: '1.0',
    uptimeSeconds,
  });
}
