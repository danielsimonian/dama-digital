import { redis } from '@/lib/redis';
import { NextRequest, NextResponse } from 'next/server';
import { KEY, getAll } from '../route';

export const runtime = 'nodejs';

type Params = { params: Promise<{ id: string }> };

// PUT: atualiza nome e apelido
export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const { nome, apelido } = await req.json();
    const n = (nome ?? '').trim();
    if (!n) return NextResponse.json({ erro: 'Nome é obrigatório' }, { status: 400 });

    const all = await getAll();
    const idx = all.findIndex(j => j.id === id);
    if (idx === -1) return NextResponse.json({ erro: 'Jogador não encontrado' }, { status: 404 });

    // Validar nome único (excluindo o próprio)
    if (all.some((j, i) => i !== idx && j.nome.toLowerCase() === n.toLowerCase())) {
      return NextResponse.json({ erro: 'Já existe um jogador com esse nome' }, { status: 409 });
    }

    all[idx] = { ...all[idx], nome: n, apelido: (apelido ?? '').trim() || undefined };
    await redis.set(KEY, all);
    return NextResponse.json(all[idx]);
  } catch {
    return NextResponse.json({ erro: 'Erro interno' }, { status: 500 });
  }
}

// PATCH: arquivar / reativar
export async function PATCH(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const all = await getAll();
    const idx = all.findIndex(j => j.id === id);
    if (idx === -1) return NextResponse.json({ erro: 'Jogador não encontrado' }, { status: 404 });

    all[idx] = { ...all[idx], ativo: !all[idx].ativo };
    await redis.set(KEY, all);
    return NextResponse.json(all[idx]);
  } catch {
    return NextResponse.json({ erro: 'Erro interno' }, { status: 500 });
  }
}

// DELETE: remoção permanente
export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const all = await getAll();
    await redis.set(KEY, all.filter(j => j.id !== id));
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ erro: 'Erro interno' }, { status: 500 });
  }
}
