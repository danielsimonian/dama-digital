import type { EventoAgenda } from '@/lib/supabase';
import type { Evento, Presenca } from '@/components/ds/admin/types';

// Datas no fuso do navegador (Daniel e Marcella usam o horário de Brasília)

export const DIA_LABEL = ['seg', 'ter', 'qua', 'qui', 'sex', 'sáb', 'dom'];
export const DIA_NOME = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

export function inicioSemana(d: Date) {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  x.setDate(x.getDate() - ((x.getDay() + 6) % 7));
  return x;
}

export function addDias(d: Date, n: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

export function isoData(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** 0 = segunda … 6 = domingo */
export function diaSemana(d: Date) {
  return (d.getDay() + 6) % 7;
}

export function horaDecimal(d: Date) {
  return d.getHours() + d.getMinutes() / 60;
}

export function horaTexto(d: Date) {
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

/** data "YYYY-MM-DD" + hora "HH:MM" locais → ISO */
export function localParaISO(data: string, hora: string) {
  return new Date(`${data}T${hora}:00`).toISOString();
}

export function presencaVisual(e: Pick<EventoAgenda, 'presenca' | 'reposicao_de'>): Presenca {
  return e.presenca === 'agendada' && e.reposicao_de ? 'reposicao' : e.presenca;
}

/** Evento do banco → bloco do WeekCalendar (só eventos da semana que começa em `semana`). */
export function paraBloco(e: EventoAgenda, semana: Date): Evento | null {
  const ini = new Date(e.inicio);
  const fim = new Date(e.fim);
  const dia = Math.floor((new Date(ini.getFullYear(), ini.getMonth(), ini.getDate()).getTime() - semana.getTime()) / 86_400_000);
  if (dia < 0 || dia > 6) return null;
  return {
    id: e.id,
    tipo: e.tipo === 'aula' ? 'aula' : 'sessao',
    pessoaId: e.cliente_id ?? `evento:${e.id}`,
    titulo: e.titulo,
    dia,
    inicio: horaDecimal(ini),
    fim: Math.max(horaDecimal(ini) + 0.25, horaDecimal(fim) || 24),
    responsavel: e.responsavel ?? 'daniel',
    presenca: presencaVisual(e),
    sala: 'Estúdio',
  };
}

/** Uma sala só: eventos que se sobrepõem ao intervalo (ignora cancelados e faltas avisadas). */
export function conflitos(eventos: EventoAgenda[], inicioISO: string, fimISO: string, ignorar?: string) {
  const a = new Date(inicioISO).getTime();
  const b = new Date(fimISO).getTime();
  return eventos.filter(
    (e) => e.id !== ignorar && !e.cancelado && e.presenca !== 'justificada' && new Date(e.inicio).getTime() < b && new Date(e.fim).getTime() > a,
  );
}
