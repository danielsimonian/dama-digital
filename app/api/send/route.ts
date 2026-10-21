import { Resend } from 'resend';
import { NextResponse } from 'next/server';
import { emailConfirmacao, emailInterno, ORIGEM_LABEL, type Origem } from '@/lib/email-templates';
import { socialLinks } from '@/lib/constants';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_CONTATO = process.env.RESEND_FROM_CONTATO
  ?? 'DAMA Digital <contato@damadigitalcriativa.com.br>';
const TO_INTERNO = (process.env.RESEND_TO_INTERNO ?? 'damadigitalcriativa@gmail.com')
  .split(',')
  .map((e) => e.trim())
  .filter(Boolean);

const LINKS = {
  site: 'https://www.damadigitalcriativa.com.br',
  whatsapp: socialLinks.whatsapp,
  instagram: socialLinks.instagram,
};

const LIMITES = { name: 120, email: 200, phone: 40, message: 5000 } as const;

function isOrigem(valor: unknown): valor is Origem {
  return typeof valor === 'string' && valor in ORIGEM_LABEL;
}

export async function POST(request: Request) {
  if (!process.env.RESEND_API_KEY) {
    console.error('[api/send] RESEND_API_KEY ausente');
    return NextResponse.json({ error: 'Servico de e-mail indisponivel.' }, { status: 503 });
  }

  let corpo: Record<string, unknown>;
  try {
    corpo = await request.json();
  } catch {
    return NextResponse.json({ error: 'Requisicao invalida.' }, { status: 400 });
  }

  // Honeypot: preenchido apenas por bot, respondemos 200 sem enviar nada.
  if (typeof corpo.website === 'string' && corpo.website.trim() !== '') {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  const texto = (valor: unknown, max: number) =>
    typeof valor === 'string' ? valor.trim().slice(0, max) : '';

  const name = texto(corpo.name, LIMITES.name);
  const email = texto(corpo.email, LIMITES.email);
  const phone = texto(corpo.phone, LIMITES.phone);
  const message = texto(corpo.message, LIMITES.message);
  const origem: Origem = isOrigem(corpo.origem) ? corpo.origem : 'home';

  if (!name || !message) {
    return NextResponse.json({ error: 'Nome e mensagem sao obrigatorios.' }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'E-mail invalido.' }, { status: 400 });
  }

  const dados = { name, email, phone, message, origem };

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_CONTATO,
      to: TO_INTERNO,
      replyTo: email,
      subject: `[${ORIGEM_LABEL[origem].toUpperCase()}] Novo contato de ${name}`,
      html: emailInterno(dados, LINKS),
    });

    if (error) {
      console.error('[api/send] falha no e-mail interno:', error);
      return NextResponse.json({ error: 'Nao foi possivel enviar sua mensagem.' }, { status: 502 });
    }

    // Confirmacao para o lead: falha aqui nao invalida o contato ja recebido.
    const confirmacao = await resend.emails.send({
      from: FROM_CONTATO,
      to: [email],
      replyTo: TO_INTERNO[0],
      subject: `Recebemos seu briefing — ${ORIGEM_LABEL[origem]}`,
      html: emailConfirmacao(dados, LINKS),
    });

    if (confirmacao.error) {
      console.error('[api/send] falha na confirmacao ao lead:', confirmacao.error);
    }

    return NextResponse.json({ ok: true, id: data?.id }, { status: 200 });
  } catch (error) {
    console.error('[api/send] erro inesperado:', error);
    return NextResponse.json({ error: 'Nao foi possivel enviar sua mensagem.' }, { status: 500 });
  }
}
