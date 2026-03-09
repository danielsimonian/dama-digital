import { redis } from '@/lib/redis';
import { NextRequest, NextResponse } from 'next/server';
import type { Grupo } from '../route';

export const runtime = 'nodejs';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { nome, icone, cor, descricao } = body;

    const grupos = (await redis.get<Grupo[]>('poker-grupos')) ?? [];
    const idx = grupos.findIndex(g => g.id === id);
    if (idx === -1) return NextResponse.json({ erro: 'Grupo não encontrado' }, { status: 404 });

    grupos[idx] = {
      ...grupos[idx],
      nome: nome?.trim() ?? grupos[idx].nome,
      icone: icone ?? grupos[idx].icone,
      cor: cor ?? grupos[idx].cor,
      descricao: descricao?.trim() || undefined,
    };

    await redis.set('poker-grupos', grupos);
    return NextResponse.json(grupos[idx]);
  } catch {
    return NextResponse.json({ erro: 'Erro interno' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    const grupos = (await redis.get<Grupo[]>('poker-grupos')) ?? [];
    const idx = grupos.findIndex(g => g.id === id);
    if (idx === -1) return NextResponse.json({ erro: 'Grupo não encontrado' }, { status: 404 });

    grupos[idx] = { ...grupos[idx], ativo: body.ativo ?? !grupos[idx].ativo };
    await redis.set('poker-grupos', grupos);
    return NextResponse.json(grupos[idx]);
  } catch {
    return NextResponse.json({ erro: 'Erro interno' }, { status: 500 });
  }
}
