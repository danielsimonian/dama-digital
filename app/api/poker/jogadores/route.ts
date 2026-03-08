import { redis } from '@/lib/redis';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export const KEY = 'poker-jogadores';

export interface Jogador {
  id: string;
  nome: string;
  apelido?: string;
  ativo: boolean;
  criadoEm: string; // YYYY-MM-DD
}

export async function getAll(): Promise<Jogador[]> {
  return (await redis.get<Jogador[]>(KEY)) ?? [];
}

export async function GET() {
  try {
    return NextResponse.json(await getAll());
  } catch {
    return NextResponse.json({ erro: 'Erro interno' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { nome, apelido } = await req.json();
    const n = (nome ?? '').trim();
    if (!n) return NextResponse.json({ erro: 'Nome é obrigatório' }, { status: 400 });

    const all = await getAll();

    if (all.some(j => j.nome.toLowerCase() === n.toLowerCase())) {
      return NextResponse.json({ erro: 'Já existe um jogador com esse nome' }, { status: 409 });
    }

    const novo: Jogador = {
      id: crypto.randomUUID(),
      nome: n,
      apelido: (apelido ?? '').trim() || undefined,
      ativo: true,
      criadoEm: new Date().toISOString().split('T')[0],
    };

    await redis.set(KEY, [...all, novo]);
    return NextResponse.json(novo, { status: 201 });
  } catch {
    return NextResponse.json({ erro: 'Erro interno' }, { status: 500 });
  }
}
