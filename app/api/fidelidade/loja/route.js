import { Redis } from '@upstash/redis';
import { NextResponse } from 'next/server';

// Inicializa o cliente Redis
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

// GET - Buscar loja pelo slug
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug');

  if (!slug) {
    return NextResponse.json({ erro: 'Slug não informado' }, { status: 400 });
  }

  try {
    const loja = await redis.get(`loja:${slug}`);

    if (!loja) {
      return NextResponse.json({ erro: 'Loja não encontrada' }, { status: 404 });
    }

    // Retorna sem a senha
    const { senha, ...lojaPublica } = loja;
    return NextResponse.json(lojaPublica);
  } catch (error) {
    console.error('Erro ao buscar loja:', error);
    return NextResponse.json({ erro: 'Erro interno' }, { status: 500 });
  }
}

// POST - Criar nova loja
export async function POST(request) {
  try {
    const body = await request.json();
    const { nome, slug, meta, senha, emoji } = body;

    // Validações
    if (!nome || !slug || !senha) {
      return NextResponse.json({ erro: 'Dados incompletos' }, { status: 400 });
    }

    if (senha.length < 4) {
      return NextResponse.json({ erro: 'Senha muito curta' }, { status: 400 });
    }

    // Verifica se slug já existe
    const lojaExistente = await redis.get(`loja:${slug}`);
    if (lojaExistente) {
      return NextResponse.json({ erro: 'Já existe uma loja com esse nome' }, { status: 409 });
    }

    // Cria a loja
    const loja = {
      nome,
      slug,
      meta: meta || 10,
      emoji: emoji || '⭐',
      senha, // Em produção, use hash!
      criadoEm: new Date().toISOString(),
    };

    await redis.set(`loja:${slug}`, loja);

    // Retorna sem a senha
    const { senha: _, ...lojaPublica } = loja;
    return NextResponse.json(lojaPublica, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar loja:', error);
    return NextResponse.json({ erro: 'Erro interno' }, { status: 500 });
  }
}