import { redis } from '@/lib/redis';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

const PREFIX = 'poker-session';
const TTL = 60 * 60 * 24 * 7; // 7 dias — renova TTL a cada save

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const data = await redis.get(`${PREFIX}:${id.toUpperCase()}`);
    if (!data) return NextResponse.json({ erro: 'Sessão não encontrada' }, { status: 404 });
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ erro: 'Erro interno' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const key = `${PREFIX}:${id.toUpperCase()}`;
    const existing = await redis.get<Record<string, unknown>>(key);
    if (!existing) return NextResponse.json({ erro: 'Sessão não encontrada' }, { status: 404 });

    const body = await req.json();
    const updated = { ...existing, ...body, id: id.toUpperCase() };
    await redis.set(key, updated, { ex: TTL });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ erro: 'Erro interno' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    await redis.del(`${PREFIX}:${id.toUpperCase()}`);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ erro: 'Erro interno' }, { status: 500 });
  }
}
