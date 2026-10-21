export function whatsappUrl(telefone: string, texto?: string) {
  const digitos = telefone.replace(/\D/g, '');
  if (digitos.length < 10) return null;
  const url = `https://wa.me/${digitos.length <= 11 ? '55' : ''}${digitos}`;
  return texto ? `${url}?text=${encodeURIComponent(texto)}` : url;
}

export function dataCurta(data: string) {
  // datas sem hora (YYYY-MM-DD) são locais, não UTC
  const d = /^\d{4}-\d{2}-\d{2}$/.test(data) ? new Date(`${data}T12:00:00`) : new Date(data);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

export function hojeISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
