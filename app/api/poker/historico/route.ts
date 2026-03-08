import { redis } from '@/lib/redis';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export interface JogadorSessao {
  nome: string;
  fichasFinais: number;
  investido: number;
  ganho: number;
  balanco: number;
  posicao: number;  // 1-based, by fichasFinais desc
  pontos: number;   // 10 - posicao  (1st=9, 2nd=8, ..., 9th=1)
}

export interface SessaoHistorico {
  data: string;       // YYYY-MM-DD
  totalPot: number;
  jogadores: JogadorSessao[];
  savedAt: string;    // ISO timestamp
}

export interface RankingEntry {
  nome: string;
  pontos: number;
  lucroTotal: number;
  sessoes: number;
  melhorPosicao: number;
}

/* ─── helpers ──────────────────────────────────────────── */

function brToday(): string {
  const br = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
  return `${br.getFullYear()}-${String(br.getMonth() + 1).padStart(2, '0')}-${String(br.getDate()).padStart(2, '0')}`;
}

function filterDates(dates: string[], filtro: string): string[] {
  const today = brToday();
  const [y, m] = today.split('-').map(Number);

  if (filtro === '4semanas') {
    const d = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
    d.setDate(d.getDate() - 28);
    const cutoff = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    return dates.filter(dt => dt >= cutoff);
  }
  if (filtro === 'mes') {
    const prefix = `${y}-${String(m).padStart(2, '0')}`;
    return dates.filter(dt => dt.startsWith(prefix));
  }
  return dates; // todas
}

function buildRanking(sessoes: SessaoHistorico[]): RankingEntry[] {
  const map = new Map<string, { pontos: number; lucroTotal: number; sessoes: number; melhorPosicao: number }>();

  for (const s of sessoes) {
    for (const j of s.jogadores) {
      const e = map.get(j.nome) ?? { pontos: 0, lucroTotal: 0, sessoes: 0, melhorPosicao: 99 };
      e.pontos       += j.pontos;
      e.lucroTotal   += j.balanco;
      e.sessoes      += 1;
      e.melhorPosicao = Math.min(e.melhorPosicao, j.posicao);
      map.set(j.nome, e);
    }
  }

  return [...map.entries()]
    .map(([nome, e]) => ({
      nome,
      pontos:       e.pontos,
      lucroTotal:   e.lucroTotal,
      sessoes:      e.sessoes,
      melhorPosicao: e.melhorPosicao === 99 ? 1 : e.melhorPosicao,
    }))
    .sort((a, b) => b.pontos - a.pontos || b.lucroTotal - a.lucroTotal);
}

/* ─── GET — ranking + histórico de sessões ─────────────── */

export async function GET(req: NextRequest) {
  try {
    const filtro = req.nextUrl.searchParams.get('filtro') ?? '4semanas';

    const allDates = (await redis.get<string[]>('poker-sessoes')) ?? [];
    const filtered = filterDates([...allDates].sort(), filtro);

    const sessoes = (
      await Promise.all(filtered.map(d => redis.get<SessaoHistorico>(`poker-historico:${d}`)))
    ).filter((s): s is SessaoHistorico => s !== null);

    // Mais recente primeiro
    sessoes.sort((a, b) => b.data.localeCompare(a.data));

    return NextResponse.json({ ranking: buildRanking(sessoes), sessoes, filtro });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ erro: 'Erro interno' }, { status: 500 });
  }
}

/* ─── POST — salvar sessão ──────────────────────────────── */

export async function POST(req: NextRequest) {
  try {
    const body: { data: string; totalPot: number; jogadores: JogadorSessao[] } = await req.json();

    if (!body.data || !Array.isArray(body.jogadores) || body.jogadores.length === 0) {
      return NextResponse.json({ erro: 'Dados inválidos' }, { status: 400 });
    }

    const sessao: SessaoHistorico = {
      data: body.data,
      totalPot: body.totalPot,
      jogadores: body.jogadores,
      savedAt: new Date().toISOString(),
    };

    await redis.set(`poker-historico:${body.data}`, sessao);

    // Atualiza lista de datas (sem duplicatas)
    const existing = (await redis.get<string[]>('poker-sessoes')) ?? [];
    if (!existing.includes(body.data)) {
      await redis.set('poker-sessoes', [...existing, body.data]);
    }

    return NextResponse.json(sessao);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ erro: 'Erro interno' }, { status: 500 });
  }
}

/* ─── DELETE — remover sessão ───────────────────────────── */

export async function DELETE(req: NextRequest) {
  try {
    const data = req.nextUrl.searchParams.get('data');
    if (!data) return NextResponse.json({ erro: 'Data obrigatória' }, { status: 400 });

    await redis.del(`poker-historico:${data}`);

    const existing = (await redis.get<string[]>('poker-sessoes')) ?? [];
    await redis.set('poker-sessoes', existing.filter(d => d !== data));

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ erro: 'Erro interno' }, { status: 500 });
  }
}
