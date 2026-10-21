'use client';

import { ContactForm, PRAZOS, type Briefing } from '@/components/ds/contact-form';

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

export function Contato() {
  return <ContactForm onSubmit={enviar} />;
}
