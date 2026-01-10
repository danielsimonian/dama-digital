import { Redis } from '@upstash/redis';
import { NextResponse } from 'next/server';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

// Gera código baseado em timestamp + slug
function gerarCodigo(slug, senha) {
  const agora = Date.now();
  const bloco = Math.floor(agora / (5 * 60 * 1000)); // Bloco de 5 minutos
  
  let hash = 0;
  const str = `${slug}-${senha}-${bloco}`;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash = hash & hash;
  }
  
  return Math.abs(hash % 900000 + 100000).toString();
}

// POST - Gerar código de compra
export async function POST(request) {
  try {
    const body = await request.json();
    const { slug, senha } = body;

    if (!slug || !senha) {
      return NextResponse.json({ erro: 'Dados incompletos' }, { status: 400 });
    }

    // Busca a loja
    const loja = await redis.get(`loja:${slug}`);
    if (!loja) {
      return NextResponse.json({ erro: 'Loja não encontrada' }, { status: 404 });
    }

    // Verifica senha
    if (loja.senha !== senha) {
      return NextResponse.json({ erro: 'Senha incorreta' }, { status: 401 });
    }

    // Gera o código
    const codigo = gerarCodigo(slug, senha);

    return NextResponse.json({ codigo });
  } catch (error) {
    console.error('Erro ao gerar código:', error);
    return NextResponse.json({ erro: 'Erro interno' }, { status: 500 });
  }
}