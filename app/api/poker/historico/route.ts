import { redis } from '@/lib/redis';
import { NextRequest, NextResponse } from 'next/server';
import { getAll as getJogadores } from '../jogadores/route';

export const runtime = 'nodejs';

export interface JogadorSessao {
  nome: string;
  jogadorId?: string; // referência ao jogador cadastrado (opcional, backward compat)
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
  grupoId?: string;   // referência ao grupo (opcional)
  grupoNome?: string; // nome do grupo no momento do salvamento
}

export interface RankingEntry {
  nome: string;
  jogadorId?: string;
  pontos: number;
  lucroTotal: number;
  sessoes: number;
  melhorPosicao: number;
}

export interface RankingResponse {
  ranking:      RankingEntry[]; // ordenado por pontos
  rankingLucro: RankingEntry[]; // ordenado por lucroTotal
  sessoes:      SessaoHistorico[];
  filtro:       string;
  grupoId:      string | null;
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

interface RankingAcc {
  nome: string;
  jogadorId?: string;
  pontos: number;
  lucroTotal: number;
  sessoes: number;
  melhorPosicao: number;
}

function buildRanking(sessoes: SessaoHistorico[], nomeParaId: Map<string, string>): RankingEntry[] {
  // Agrupa por jogadorId quando disponível, senão por nome.
  // nomeParaId permite unificar sessões antigas (só nome) com o ID cadastrado.
  const map = new Map<string, RankingAcc>();

  for (const s of sessoes) {
    for (const j of s.jogadores) {
      // Resolve a chave de agrupamento
      const resolvedId = j.jogadorId ?? nomeParaId.get(j.nome.toLowerCase());
      const key = resolvedId ?? j.nome;

      const e: RankingAcc = map.get(key) ?? {
        nome: j.nome,
        jogadorId: resolvedId,
        pontos: 0,
        lucroTotal: 0,
        sessoes: 0,
        melhorPosicao: 99,
      };
      e.pontos        += j.pontos;
      e.lucroTotal    += (j.balanco ?? 0);
      e.sessoes       += 1;
      e.melhorPosicao  = Math.min(e.melhorPosicao, j.posicao);
      // Sempre usa o nome mais recente da sessão
      e.nome = j.nome;
      if (resolvedId) e.jogadorId = resolvedId;
      map.set(key, e);
    }
  }

  return [...map.values()]
    .map(e => ({
      nome:          e.nome,
      jogadorId:     e.jogadorId,
      pontos:        e.pontos,
      lucroTotal:    e.lucroTotal,
      sessoes:       e.sessoes,
      melhorPosicao: e.melhorPosicao === 99 ? 1 : e.melhorPosicao,
    }))
    .sort((a, b) => b.pontos - a.pontos || (b.lucroTotal ?? 0) - (a.lucroTotal ?? 0));
}

/* ─── GET — ranking + histórico de sessões ─────────────── */

export async function GET(req: NextRequest) {
  try {
    const filtro  = req.nextUrl.searchParams.get('filtro') ?? '4semanas';
    const grupoId = req.nextUrl.searchParams.get('grupo') ?? null;

    const allDates = (await redis.get<string[]>('poker-sessoes')) ?? [];
    const filtered = filterDates([...allDates].sort(), filtro);

    const sessoes = (
      await Promise.all(filtered.map(d => redis.get<SessaoHistorico>(`poker-historico:${d}`)))
    ).filter((s): s is SessaoHistorico => s !== null);

    // Filtra por grupo quando especificado
    const sessoesFiltradas = grupoId
      ? sessoes.filter(s => s.grupoId === grupoId)
      : sessoes;

    // Mais recente primeiro
    sessoesFiltradas.sort((a, b) => b.data.localeCompare(a.data));

    // Mapa nome→jogadorId para unificar sessões legadas (sem jogadorId) com cadastro
    const jogadores = await getJogadores();
    const nomeParaId = new Map(jogadores.map(j => [j.nome.toLowerCase(), j.id]));

    const ranking = buildRanking(sessoesFiltradas, nomeParaId);

    // Ordenação por lucro feita no servidor — evita ambiguidades client-side
    const rankingLucro = [...ranking].sort((a, b) => {
      const la = a.lucroTotal ?? 0;
      const lb = b.lucroTotal ?? 0;
      if (lb > la) return 1;
      if (lb < la) return -1;
      return (b.pontos ?? 0) - (a.pontos ?? 0);
    });

    return NextResponse.json({ ranking, rankingLucro, sessoes: sessoesFiltradas, filtro, grupoId });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ erro: 'Erro interno' }, { status: 500 });
  }
}

/* ─── POST — salvar sessão ──────────────────────────────── */

export async function POST(req: NextRequest) {
  try {
    const body: { data: string; totalPot: number; jogadores: JogadorSessao[]; grupoId?: string; grupoNome?: string } = await req.json();

    if (!body.data || !Array.isArray(body.jogadores) || body.jogadores.length === 0) {
      return NextResponse.json({ erro: 'Dados inválidos' }, { status: 400 });
    }

    const sessao: SessaoHistorico = {
      data: body.data,
      totalPot: body.totalPot,
      jogadores: body.jogadores,
      savedAt: new Date().toISOString(),
      grupoId: body.grupoId,
      grupoNome: body.grupoNome,
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
