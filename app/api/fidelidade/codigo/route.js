import { Redis } from '@upstash/redis';
import { NextResponse } from 'next/server';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

// Gera código aleatório de 6 dígitos
function gerarCodigoAleatorio() {
  return Math.floor(100000 + Math.random() * 900000).toString();
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

    // Gera código aleatório único
    const codigo = gerarCodigoAleatorio();
    
    // Salva o código no Redis com expiração de 1 minuto (60 segundos)
    // O código é marcado como válido para a loja
    await redis.set(`codigo:${slug}:${codigo}`, { usado: false }, { ex: 60 });

    return NextResponse.json({ codigo });
  } catch (error) {
    console.error('Erro ao gerar código:', error);
    return NextResponse.json({ erro: 'Erro interno' }, { status: 500 });
  }
}