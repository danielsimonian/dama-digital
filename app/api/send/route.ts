import { Resend } from 'resend';
import { NextResponse } from 'next/server';
import { DIVISAO_CONFIG, type Divisao } from '@/lib/supabase';
import { socialLinks } from '@/lib/constants';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_CONTATO = process.env.RESEND_FROM_CONTATO
  ?? 'DAMA Digital <contato@damadigitalcriativa.com.br>';
const TO_INTERNO = (process.env.RESEND_TO_INTERNO ?? 'damadigitalcriativa@gmail.com')
  .split(',')
  .map((e) => e.trim())
  .filter(Boolean);

type Origem = Divisao | 'home';

const ORIGEM_LABEL: Record<Origem, string> = {
  home: 'DAMA Digital',
  tech: DIVISAO_CONFIG.tech.nome,
  sports: DIVISAO_CONFIG.sports.nome,
  studio: DIVISAO_CONFIG.studio.nome,
};

const ORIGEM_CORES: Record<Origem, { inicio: string; fim: string }> = {
  home: { inicio: '#FFFFFF', fim: '#8A8A8A' },
  tech: { inicio: DIVISAO_CONFIG.tech.hexInicio, fim: DIVISAO_CONFIG.tech.hexFim },
  sports: { inicio: DIVISAO_CONFIG.sports.hexInicio, fim: DIVISAO_CONFIG.sports.hexFim },
  studio: { inicio: DIVISAO_CONFIG.studio.hexInicio, fim: DIVISAO_CONFIG.studio.hexFim },
};

const LIMITES = { name: 120, email: 200, phone: 40, message: 5000 } as const;

function escapeHtml(valor: string) {
  return valor
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function isOrigem(valor: unknown): valor is Origem {
  return typeof valor === 'string' && valor in ORIGEM_LABEL;
}

function emailInterno(dados: {
  name: string; email: string; phone: string; message: string; origem: Origem;
}) {
  const { inicio, fim } = ORIGEM_CORES[dados.origem];
  const linha = (rotulo: string, valor: string) => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #EAEAEA;font:600 12px/1.4 Helvetica,Arial,sans-serif;letter-spacing:0.08em;text-transform:uppercase;color:#8A8A8A;width:110px;vertical-align:top;">${rotulo}</td>
      <td style="padding:10px 0;border-bottom:1px solid #EAEAEA;font:400 15px/1.6 Helvetica,Arial,sans-serif;color:#1A1A1A;">${valor}</td>
    </tr>`;

  return `
  <div style="background:#F5F5F5;padding:32px 16px;">
    <div style="max-width:560px;margin:0 auto;background:#FFFFFF;border-radius:8px;overflow:hidden;">
      <div style="height:4px;background:linear-gradient(90deg,${inicio},${fim});"></div>
      <div style="padding:32px;">
        <p style="margin:0 0 4px;font:700 11px/1.4 Helvetica,Arial,sans-serif;letter-spacing:0.16em;text-transform:uppercase;color:${inicio};">${escapeHtml(ORIGEM_LABEL[dados.origem])}</p>
        <h1 style="margin:0 0 24px;font:700 22px/1.3 Helvetica,Arial,sans-serif;color:#1A1A1A;">Novo contato pelo site</h1>
        <table style="width:100%;border-collapse:collapse;">
          ${linha('Nome', escapeHtml(dados.name))}
          ${linha('E-mail', `<a href="mailto:${escapeHtml(dados.email)}" style="color:#1A1A1A;">${escapeHtml(dados.email)}</a>`)}
          ${linha('Telefone', escapeHtml(dados.phone) || '&mdash;')}
          ${linha('Mensagem', escapeHtml(dados.message).replace(/\n/g, '<br />'))}
        </table>
        <p style="margin:24px 0 0;font:400 13px/1.6 Helvetica,Arial,sans-serif;color:#8A8A8A;">
          Responda este e-mail para falar direto com ${escapeHtml(dados.name)}.
        </p>
      </div>
    </div>
  </div>`;
}

function emailConfirmacao(dados: { name: string; message: string; origem: Origem }) {
  const { inicio, fim } = ORIGEM_CORES[dados.origem];
  const primeiroNome = dados.name.trim().split(/\s+/)[0];

  return `
  <div style="background:#F5F5F5;padding:32px 16px;">
    <div style="max-width:560px;margin:0 auto;background:#FFFFFF;border-radius:8px;overflow:hidden;">
      <div style="height:4px;background:linear-gradient(90deg,${inicio},${fim});"></div>
      <div style="padding:40px 32px;">
        <p style="margin:0 0 4px;font:700 11px/1.4 Helvetica,Arial,sans-serif;letter-spacing:0.16em;text-transform:uppercase;color:${inicio};">${escapeHtml(ORIGEM_LABEL[dados.origem])}</p>
        <h1 style="margin:0 0 20px;font:700 24px/1.3 Helvetica,Arial,sans-serif;color:#1A1A1A;">Recebemos sua mensagem, ${escapeHtml(primeiroNome)}.</h1>
        <p style="margin:0 0 20px;font:400 15px/1.7 Helvetica,Arial,sans-serif;color:#4A4A4A;">
          Obrigado pelo contato. Nossa equipe vai analisar o seu pedido e responder em at&eacute; 1 dia &uacute;til.
        </p>
        <div style="margin:0 0 24px;padding:16px 20px;background:#FAFAFA;border-left:3px solid ${inicio};">
          <p style="margin:0 0 6px;font:600 11px/1.4 Helvetica,Arial,sans-serif;letter-spacing:0.08em;text-transform:uppercase;color:#8A8A8A;">Sua mensagem</p>
          <p style="margin:0;font:400 14px/1.7 Helvetica,Arial,sans-serif;color:#4A4A4A;">${escapeHtml(dados.message).replace(/\n/g, '<br />')}</p>
        </div>
        <p style="margin:0 0 28px;font:400 15px/1.7 Helvetica,Arial,sans-serif;color:#4A4A4A;">
          Se for urgente, chame a gente no
          <a href="${socialLinks.whatsapp}" style="color:${inicio};font-weight:600;">WhatsApp</a>.
        </p>
        <p style="margin:0;padding-top:24px;border-top:1px solid #EAEAEA;font:400 13px/1.6 Helvetica,Arial,sans-serif;color:#8A8A8A;">
          DAMA Digital &middot; Tech &middot; Sports &middot; Studio<br />
          <a href="${socialLinks.instagram}" style="color:#8A8A8A;">Instagram</a>
        </p>
      </div>
    </div>
  </div>`;
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
      html: emailInterno(dados),
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
      subject: `Recebemos seu contato — ${ORIGEM_LABEL[origem]}`,
      html: emailConfirmacao(dados),
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
