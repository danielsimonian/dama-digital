'use client';

import type { Divisao } from '@/lib/supabase';
import { ContactForm, PRAZOS, type Briefing } from './contact-form';

async function enviar(b: Briefing) {
  const prazo = PRAZOS.find((p) => p.value === b.prazo)?.label;
  try {
    const res = await fetch('/api/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: b.nome,
        email: b.email,
        phone: b.whatsapp,
        message: prazo ? `${b.mensagem}\n\nPrazo: ${prazo}` : b.mensagem,
        website: b.website,
        origem: b.divisao,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/** Briefing com envio real pelo /api/send. `divisao` já deixa a divisão escolhida. */
export function Contato({ divisao }: { divisao?: Divisao }) {
  return <ContactForm onSubmit={enviar} divisaoInicial={divisao} />;
}
