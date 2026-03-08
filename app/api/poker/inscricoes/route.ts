import { redis } from '@/lib/redis';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

const MAX = 9;
const PREFIX = 'poker-inscricoes';

export interface Inscrito {
  id: string;
  nome: string;
  criadoEm: string;
}

export interface Sessao {
  status: 'aberta' | 'fechada';
  inscritos: Inscrito[];
  data: string;
}

function todayKey(): string {
  const br = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
  const yyyy = br.getFullYear();
  const mm = String(br.getMonth() + 1).padStart(2, '0');
  const dd = String(br.getDate()).padStart(2, '0');
  return `${PREFIX}:${yyyy}-${mm}-${dd}`;
}

async function getSessao(): Promise<Sessao> {
  const key = todayKey();
  const data = await redis.get<Sessao>(key);
  const dateStr = key.replace(`${PREFIX}:`, '');
  return data ?? { status: 'fechada', inscritos: [], data: dateStr };
}

async function saveSessao(sessao: Sessao): Promise<void> {
  await redis.set(`${PREFIX}:${sessao.data}`, sessao, { ex: 172800 }); // 48h TTL
}

export async function GET() {
  try {
    return NextResponse.json(await getSessao());
  } catch {
    return NextResponse.json({ erro: 'Erro interno' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const nome = (body?.nome ?? '').trim();
    if (!nome) return NextResponse.json({ erro: 'Nome inválido' }, { status: 400 });

    const sessao = await getSessao();
    if (sessao.status === 'fechada')
      return NextResponse.json({ erro: 'Inscrições encerradas' }, { status: 403 });
    if (sessao.inscritos.length >= MAX)
      return NextResponse.json({ erro: 'Vagas esgotadas' }, { status: 403 });

    const novo: Inscrito = {
      id: crypto.randomUUID(),
      nome,
      criadoEm: new Date().toISOString(),
    };
    sessao.inscritos = [...sessao.inscritos, novo];
    if (sessao.inscritos.length >= MAX) sessao.status = 'fechada';

    await saveSessao(sessao);
    return NextResponse.json(sessao);
  } catch {
    return NextResponse.json({ erro: 'Erro interno' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ erro: 'ID inválido' }, { status: 400 });

    const sessao = await getSessao();
    const antes = sessao.inscritos.length;
    sessao.inscritos = sessao.inscritos.filter(i => i.id !== id);
    if (sessao.inscritos.length === antes)
      return NextResponse.json({ erro: 'Inscrito não encontrado' }, { status: 404 });

    await saveSessao(sessao);
    return NextResponse.json(sessao);
  } catch {
    return NextResponse.json({ erro: 'Erro interno' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { status } = await req.json();
    if (status !== 'aberta' && status !== 'fechada')
      return NextResponse.json({ erro: 'Status inválido' }, { status: 400 });

    const sessao = await getSessao();
    sessao.status = status;
    await saveSessao(sessao);
    return NextResponse.json(sessao);
  } catch {
    return NextResponse.json({ erro: 'Erro interno' }, { status: 500 });
  }
}
