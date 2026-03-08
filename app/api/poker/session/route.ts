import { redis } from '@/lib/redis';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

const PREFIX = 'poker-session';
const TTL = 60 * 60 * 24 * 7; // 7 dias

function generateId(): string {
  // Sem caracteres ambíguos: sem O, 0, 1, I
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

export async function POST() {
  try {
    let id = generateId();
    let attempts = 0;
    while ((await redis.exists(`${PREFIX}:${id}`)) && attempts < 10) {
      id = generateId();
      attempts++;
    }

    const session = {
      id,
      createdAt: new Date().toISOString(),
      config: { buyIn: 100, chipValue: 1, chipsPerBuyIn: 100, maxRebuys: 3 },
      players: [],
      dealerChips: 0,
      status: 'active',
    };

    await redis.set(`${PREFIX}:${id}`, session, { ex: TTL });
    return NextResponse.json({ id });
  } catch {
    return NextResponse.json({ erro: 'Erro ao criar sessão' }, { status: 500 });
  }
}
