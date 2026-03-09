import { redis } from '@/lib/redis';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export interface Grupo {
  id: string;
  nome: string;
  icone: string;
  cor: string;
  descricao?: string;
  ativo: boolean;
  criado_em: string;
}

export async function GET() {
  try {
    const grupos = (await redis.get<Grupo[]>('poker-grupos')) ?? [];
    return NextResponse.json(grupos);
  } catch {
    return NextResponse.json({ erro: 'Erro interno' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { nome, icone, cor, descricao } = body;

    if (!nome?.trim()) {
      return NextResponse.json({ erro: 'Nome obrigatório' }, { status: 400 });
    }

    const grupos = (await redis.get<Grupo[]>('poker-grupos')) ?? [];

    const br = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
    const hoje = `${br.getFullYear()}-${String(br.getMonth() + 1).padStart(2, '0')}-${String(br.getDate()).padStart(2, '0')}`;

    const grupo: Grupo = {
      id: `grupo-${crypto.randomUUID()}`,
      nome: nome.trim(),
      icone: icone ?? '🎲',
      cor: cor ?? 'purple',
      descricao: descricao?.trim() || undefined,
      ativo: true,
      criado_em: hoje,
    };

    await redis.set('poker-grupos', [...grupos, grupo]);
    return NextResponse.json(grupo, { status: 201 });
  } catch {
    return NextResponse.json({ erro: 'Erro interno' }, { status: 500 });
  }
}
