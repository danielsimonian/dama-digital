// E-mails do formulário de contato no estilo do Design System v2:
// base clara, linhas finas, rótulos em mono e a cor da divisão só nos detalhes.
// Cliente de e-mail não carrega Geist — usamos as fontes do sistema.

export type Origem = 'home' | 'tech' | 'sports' | 'studio';

export type DadosContato = { name: string; email: string; phone: string; message: string; origem: Origem };

export type LinksContato = { site: string; whatsapp: string; instagram: string };

export const ORIGEM_LABEL: Record<Origem, string> = {
  home: 'DAMA Digital',
  tech: 'DAMA Tech',
  sports: 'DAMA Sports',
  studio: 'DAMA Studio',
};

// Tokens do tema claro do DS (styles/dama-ds.css) convertidos para hex
const COR = {
  bg: '#F8F6F4',
  surface: '#F1F0EE',
  line: '#D5D4D1',
  fg: '#151412',
  muted: '#494745',
  subtle: '#646361',
  branco: '#FFFFFF',
};

const ACENTO: Record<Origem, string> = {
  home: COR.fg,
  tech: '#2D54D3',
  sports: '#BC3E0D',
  studio: '#10703A',
};

const SANS = "'Helvetica Neue',Helvetica,Arial,sans-serif";
const MONO = "ui-monospace,SFMono-Regular,Menlo,Consolas,'Courier New',monospace";

export function escapeHtml(valor: string) {
  return valor
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const multilinha = (texto: string) => escapeHtml(texto).replace(/\n/g, '<br />');

const rotulo = (texto: string, cor = COR.subtle) =>
  `<span style="font:400 11px/1.4 ${MONO};letter-spacing:0.08em;text-transform:uppercase;color:${cor};">${texto}</span>`;

/** Moldura comum: faixa escura com o logo, conteúdo e rodapé com coordenadas. */
function moldura({ origem, marca, corpo, links }: { origem: Origem; marca: string; corpo: string; links: LinksContato }) {
  const acento = ACENTO[origem];
  return `<!doctype html>
<html lang="pt-BR">
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /><meta name="color-scheme" content="light" /></head>
<body style="margin:0;padding:0;background:${COR.bg};">
  <div style="background:${COR.bg};padding:32px 16px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;border-collapse:collapse;background:${COR.branco};border:1px solid ${COR.line};">
      <tr>
        <td style="background:${COR.fg};padding:18px 28px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
            <tr>
              <td><img src="${links.site}/images/logo.png" width="64" height="45" alt="DAMA" style="display:block;border:0;width:64px;height:auto;" /></td>
              <td align="right" style="font:400 11px/1.4 ${MONO};letter-spacing:0.08em;text-transform:uppercase;color:#BDBBB8;">${marca}</td>
            </tr>
          </table>
        </td>
      </tr>
      <tr><td style="height:2px;line-height:2px;font-size:0;background:${acento};">&nbsp;</td></tr>
      <tr><td style="padding:32px 28px 28px;">${corpo}</td></tr>
      <tr>
        <td style="border-top:1px solid ${COR.line};padding:16px 28px;font:400 11px/1.7 ${MONO};letter-spacing:0.06em;text-transform:uppercase;color:${COR.subtle};">
          <a href="${links.site}" style="color:${COR.subtle};text-decoration:none;">damadigitalcriativa.com.br</a>
          &nbsp;·&nbsp; <a href="${links.instagram}" style="color:${COR.subtle};text-decoration:none;">Instagram</a><br />
          Santos · SP · 23.96°S 46.33°W
        </td>
      </tr>
    </table>
  </div>
</body>
</html>`;
}

/** Aviso para a equipe: os dados do contato, prontos para responder. */
export function emailInterno(dados: DadosContato, links: LinksContato) {
  const acento = ACENTO[dados.origem];
  const linha = (nome: string, valor: string) => `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid ${COR.line};width:104px;vertical-align:top;">${rotulo(nome)}</td>
      <td style="padding:12px 0;border-bottom:1px solid ${COR.line};font:400 15px/1.5 ${SANS};color:${COR.fg};">${valor}</td>
    </tr>`;

  const corpo = `
    <p style="margin:0 0 8px;">${rotulo(`<span style="color:${acento};">●</span>&nbsp; ${escapeHtml(ORIGEM_LABEL[dados.origem])} · pelo site`, COR.muted)}</p>
    <h1 style="margin:0 0 4px;font:500 26px/1.2 ${SANS};letter-spacing:-0.02em;color:${COR.fg};">Novo briefing</h1>
    <p style="margin:0 0 24px;font:500 26px/1.2 ${SANS};letter-spacing:-0.02em;color:${COR.subtle};">de ${escapeHtml(dados.name)}</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;border-top:1px solid ${COR.line};">
      ${linha('Nome', escapeHtml(dados.name))}
      ${linha('E-mail', `<a href="mailto:${escapeHtml(dados.email)}" style="color:${COR.fg};">${escapeHtml(dados.email)}</a>`)}
      ${linha('WhatsApp', escapeHtml(dados.phone) || '&mdash;')}
    </table>
    <p style="margin:24px 0 8px;">${rotulo('Sobre o projeto')}</p>
    <div style="padding:16px 18px;background:${COR.surface};border-left:2px solid ${acento};font:400 15px/1.65 ${SANS};color:${COR.fg};">${multilinha(dados.message)}</div>
    <p style="margin:24px 0 0;font:400 13px/1.6 ${SANS};color:${COR.muted};">Responda este e-mail para falar direto com ${escapeHtml(dados.name.split(/\s+/)[0])}.</p>`;

  return moldura({ origem: dados.origem, marca: 'Novo contato', corpo, links });
}

/** Confirmação para quem preencheu o formulário. */
export function emailConfirmacao(dados: Pick<DadosContato, 'name' | 'message' | 'origem'>, links: LinksContato) {
  const acento = ACENTO[dados.origem];
  const primeiroNome = escapeHtml(dados.name.trim().split(/\s+/)[0]);
  const etapas = ['Briefing', 'Proposta', 'Produção', 'Entrega'];

  const corpo = `
    <p style="margin:0 0 8px;">${rotulo(`<span style="color:${acento};">●</span>&nbsp; ${escapeHtml(ORIGEM_LABEL[dados.origem])}`, COR.muted)}</p>
    <h1 style="margin:0 0 4px;font:500 26px/1.2 ${SANS};letter-spacing:-0.02em;color:${COR.fg};">Recebemos seu briefing, ${primeiroNome}.</h1>
    <p style="margin:0 0 20px;font:500 26px/1.2 ${SANS};letter-spacing:-0.02em;color:${COR.subtle};">A gente responde em até 1 dia útil.</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:0 0 24px;">
      <tr>
        ${etapas
          .map(
            (e, i) => `<td width="25%" style="padding:10px 0 0;border-top:${i === 0 ? `2px solid ${acento}` : `1px solid ${COR.line}`};vertical-align:top;">
          ${rotulo(`${String(i + 1).padStart(2, '0')}<br />${e}`, i === 0 ? COR.fg : COR.subtle)}
        </td>`,
          )
          .join('')}
      </tr>
    </table>
    <p style="margin:0 0 8px;">${rotulo('Sua mensagem')}</p>
    <div style="padding:16px 18px;background:${COR.surface};border-left:2px solid ${acento};font:400 14px/1.65 ${SANS};color:${COR.muted};">${multilinha(dados.message)}</div>
    <p style="margin:28px 0 12px;font:400 15px/1.6 ${SANS};color:${COR.muted};">Se for urgente, chama a gente no WhatsApp:</p>
    <a href="${links.whatsapp}" style="display:inline-block;padding:12px 20px;background:${COR.fg};color:${COR.branco};font:500 14px/1 ${SANS};text-decoration:none;">Abrir o WhatsApp</a>`;

  return moldura({ origem: dados.origem, marca: 'Briefing recebido', corpo, links });
}
