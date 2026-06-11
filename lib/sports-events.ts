// Dados centralizados dos torneios DAMA Sports
// Ordem: mais recente primeiro (reverso cronológico)
// Para adicionar fotos: coloque em public/images/events/[slug]/ e adicione o caminho em gallery[]
// Para adicionar reels: cole a URL do YouTube/Instagram em reels[]

export type SportsEventStatus = 'realizado' | 'em-breve' | 'inscricoes-abertas'

export type SportsEvent = {
  id: string
  slug: string
  name: string
  subtitle: string
  year: number
  date: string
  location: string
  banner: string | null
  logo: string | null
  description: string
  stats: { label: string; value: string }[]
  gallery: string[]
  reels: { title: string; url: string }[]
  sponsors: { name: string; logo: string }[]
  status: SportsEventStatus
  link?: { url: string; label: string }
  tag: string
}

export const sportsEvents: SportsEvent[] = [
  // ── Mais recente primeiro ─────────────────────────────────────
  {
    id: 'open-spfc',
    slug: 'open-spfc',
    name: 'Open SPFC',
    subtitle: 'Beach Tennis',
    year: 2026,
    date: '29, 30 e 31 de maio de 2026',
    location: 'CT do São Paulo FC · São Paulo, SP',
    banner: null,
    logo: '/images/clients/spfc.png',
    description: 'O maior torneio de beach tennis já realizado no CT do São Paulo Futebol Clube. Estrutura completa, parceria com um dos maiores clubes do Brasil.',
    stats: [
      { label: 'atletas', value: '400+' },
      { label: 'inscrições', value: '500+' },
      { label: 'categorias', value: '19' },
      { label: 'quadras', value: '7' },
    ],
    gallery: [
      '/images/events/open-spfc/foto1.jpg',
      '/images/events/open-spfc/foto2.jpg',
      '/images/events/open-spfc/foto3.jpg',
      '/images/events/open-spfc/foto4.jpeg',
      '/images/events/open-spfc/foto5.jpeg',
      '/images/events/open-spfc/foto6.jpeg',
    ],
    reels: [
      { title: 'Open SPFC 2026', url: '/videos/events/open-spfc/reel.mp4' },
    ],
    sponsors: [
      { name: 'SPFC', logo: '/images/clients/spfc.png' },
    ],
    status: 'realizado',
    tag: 'REALIZADO',
    link: { url: 'https://letzplay.me/damasports/tourneys/56324', label: 'Ver no LetzPlay' },
  },
  {
    id: 'seletiva-pan-americano',
    slug: 'seletiva-pan-americano',
    name: 'Seletiva Seleção Brasileira',
    subtitle: 'Pan-Americano IFBT',
    year: 2026,
    date: '23 e 24 de maio de 2026',
    location: 'Assesp Gonzaga BT · Santos, SP',
    banner: null,
    logo: '/images/clients/ifbt.jpg',
    description: 'Seletiva oficial para a Seleção Brasileira de Beach Tennis rumo ao Pan-Americano IFBT. Organização DAMA Sports em parceria com a Assesp Gonzaga BT, em Santos.',
    stats: [
      { label: 'atletas', value: '100+' },
      { label: 'inscrições', value: '120+' },
      { label: 'categorias', value: '8' },
      { label: 'quadras', value: '4' },
    ],
    gallery: [
      // '/images/events/seletiva-pan-americano/foto1.jpg',
    ],
    reels: [
      // { title: 'Highlights da Seletiva', url: 'https://www.youtube.com/watch?v=XXXXX' },
    ],
    sponsors: [
      { name: 'ASSESP Gonzaga', logo: '/images/clients/assesp.jpeg' },
      { name: 'IFBT', logo: '/images/clients/ifbt.jpg' },
    ],
    status: 'realizado',
    tag: 'REALIZADO',
    link: { url: 'https://letzplay.me/assespgonzaga/tourneys/57445', label: 'Ver no LetzPlay' },
  },
  {
    id: 'open-santos-assesp',
    slug: 'open-santos-assesp',
    name: 'Open Santos ASSESP',
    subtitle: 'Beach Tennis',
    year: 2026,
    date: '11 e 12 de abril de 2026',
    location: 'Point do Gonzaga · Santos, SP',
    banner: '/images/events/open-santos-assesp/banner.jpg',
    logo: '/images/clients/assesp.jpeg',
    description: 'Maior torneio de beach tennis da Baixada Santista. Dois dias de competição, cobertura audiovisual completa, arbitragem profissional e estrutura montada do zero pela DAMA Sports.',
    stats: [
      { label: 'atletas', value: '250+' },
      { label: 'inscrições', value: '300+' },
      { label: 'categorias', value: '14' },
      { label: 'quadras', value: '13' },
    ],
    gallery: [
      // '/images/events/open-santos-assesp/foto1.jpg',
    ],
    reels: [
      // { title: 'Highlights do evento', url: 'https://www.youtube.com/watch?v=XXXXX' },
    ],
    sponsors: [
      { name: 'ASSESP', logo: '/images/clients/assesp.jpeg' },
    ],
    status: 'realizado',
    tag: 'REALIZADO',
    link: { url: 'https://www.rankingbt.com.br/torneios/open-santos-assesp-de-beach-tennis-2026-04-11', label: 'Ver no RankingBT' },
  },
]

// Histórico de torneios anteriores (sem página própria)
export const historico = [
  { name: 'Open Santos ASSESP 2025', date: 'Abril de 2025', location: 'Santos, SP', categorias: 12 },
  { name: 'Open Tom Beach 2025',     date: 'Agosto de 2025', location: 'Guarujá, SP', categorias: 8 },
  { name: 'Open Santos ASSESP 2024', date: 'Abril de 2024', location: 'Santos, SP', categorias: 10 },
  { name: 'Open Tom Beach 2024',     date: 'Agosto de 2024', location: 'Guarujá, SP', categorias: 8 },
  { name: 'Open Santos ASSESP 2023', date: 'Abril de 2023', location: 'Santos, SP', categorias: 8 },
]

export function getEventBySlug(slug: string): SportsEvent | undefined {
  return sportsEvents.find(e => e.slug === slug)
}

export function getPastEvents(): SportsEvent[] {
  return sportsEvents.filter(e => e.status === 'realizado')
}

export function getUpcomingEvents(): SportsEvent[] {
  return sportsEvents.filter(e => e.status === 'em-breve' || e.status === 'inscricoes-abertas')
}
