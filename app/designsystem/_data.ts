import { sportsEvents } from '@/lib/sports-events';
import { clients, team } from '@/lib/constants';
import type { Capability, Project, Tournament, Artist, Release, Service, Member, Partner } from '@/components/ds/cards';
import type { GalleryItem } from '@/components/ds/media';
import type { ProcessStep } from '@/components/ds/diagram';

export const capabilities: Capability[] = [
  { title: 'Sites', art: 'sites', divisao: 'tech' },
  { title: 'Sistemas sob medida', art: 'sistemas', divisao: 'tech' },
  { title: 'Transmissão ao vivo', art: 'transmissao', divisao: 'sports' },
  { title: 'Cobertura de torneios', art: 'torneios', divisao: 'sports' },
  { title: 'Fotografia', art: 'fotografia', divisao: 'sports' },
  { title: 'Produção musical', art: 'musica', divisao: 'studio' },
  { title: 'Mixagem e master', art: 'mixagem', divisao: 'studio' },
  { title: 'Distribuição', art: 'distribuicao', divisao: 'studio' },
  { title: 'Aulas', art: 'aulas', divisao: 'studio' },
  { title: 'Branding', art: 'branding', divisao: 'tech' },
];

export const projects: Project[] = [
  {
    name: 'Ranking BT',
    tag: 'plataforma · beach tennis',
    domain: 'rankingbt.com.br',
    logo: '/images/projects/rankingbt-logo.png',
    desc: 'Sistema completo de ranking para torneios de beach tennis — gestão de jogadores, partidas e pontuação em tempo real.',
    href: 'https://www.rankingbt.com.br/',
  },
  {
    name: 'Clinup',
    tag: 'saúde · gestão',
    domain: 'clinup',
    logo: '/images/projects/clinup-logo.svg',
    desc: 'Plataforma de gestão para clínicas de saúde — agendamento, prontuário e financeiro integrados.',
    href: 'https://clinup.damadigitalcriativa.com.br',
  },
  {
    name: 'PlayStock',
    tag: 'saas · varejo · estoque',
    domain: 'playstock.app',
    logo: '/images/projects/playstock-logo.svg',
    desc: 'Estoque centralizado em tempo real para redes de varejo, com transferências entre lojas e relatórios por unidade.',
    href: 'https://playstock.app',
  },
  {
    name: 'Maxwell Rodrigues',
    tag: 'site pessoal · apresentador',
    domain: 'maxwellrodrigues.com',
    logo: '/images/projects/maxwell-logo.png',
    desc: 'Site do apresentador do PORTO 360 (TV Globo) — identidade visual, palestras e contato.',
    href: 'https://maxwellrodrigues.com',
  },
];

const DATE_SHORT: Record<string, string> = {
  '6o-open-spfc': '29–31 MAI 2026',
  'seletiva-pan-americano': '23–24 MAI 2026',
  'open-santos-assesp': '11–12 ABR 2026',
};

const COVER: Record<string, string | null> = {
  '6o-open-spfc': '/images/events/6o-open-spfc/foto2.jpg',
  'seletiva-pan-americano': null,
  'open-santos-assesp': '/images/events/open-santos-assesp/banner.jpg',
};

export const tournaments: Tournament[] = sportsEvents.map((e) => ({
  name: e.name,
  modalidade: e.subtitle,
  dateShort: DATE_SHORT[e.slug] ?? String(e.year),
  location: e.location,
  cover: COVER[e.slug] ?? e.banner,
  logo: e.logo,
  status: 'realizado',
  stats: e.stats,
  href: `/sports/${e.slug}`,
}));

const spfc = sportsEvents.find((e) => e.slug === '6o-open-spfc');

export const gallery: GalleryItem[] = (spfc?.gallery ?? []).map((g, i) => ({
  src: g.src,
  alt: `6º Open SPFC · CT São Paulo FC · foto ${i + 1}`,
  portrait: g.portrait,
}));

export const artists: Artist[] = [
  { name: 'SAID', genre: 'Pop', releases: 8, image: '/images/studio/said-find-love.jpg', latest: 'Find Love' },
  { name: 'André Simonian', genre: 'Pop / MPB', releases: 6, image: '/images/studio/andre-simonian-manifesto.jpg', latest: 'Manifesto' },
  { name: 'Karina Cyrillo', genre: 'Pop', releases: 5, image: '/images/studio/karina-cyrillo-te-quis.jpg', latest: 'Te Quis' },
  { name: 'Kayoko Yamabe', genre: 'Música Clássica', releases: 1, image: null, latest: 'Lembrança do Brasil' },
];

export const releases: Release[] = [
  { artist: 'Fernando Silveyra', title: 'Confiança', year: 2026, type: 'CD', cover: '/images/studio/fernando-silveyra-confianca.jpg', spotify: 'https://open.spotify.com/album/67dv685dARviuHRS8K5jVF' },
  { artist: 'Fábio Zulli', title: 'Nico Manezinho', year: 2026, type: 'Single', cover: '/images/studio/fabio-zulli-nico-manezinho.jpg', spotify: 'https://open.spotify.com/album/7Ly3VKT8LgL0TULQpIfvO5' },
  { artist: 'Antonio Eduardo', title: 'MRB — Revisitando Guerra Peixe', year: 2026, type: 'CD', cover: '/images/studio/antonio-eduardo-revisitando-guerra-peixe.jpg', spotify: 'https://open.spotify.com/album/73qBHEp5bTTe6f3QvKvFVe' },
  { artist: 'Kayoko Yamabe', title: 'Lembrança do Brasil', year: 2012, type: 'CD', cover: null, spotify: null },
];

export const services: Service[] = [
  {
    divisao: 'tech',
    name: 'Site institucional',
    desc: 'Site rápido, editável e pronto para aparecer no Google.',
    from: 'R$ 3.900',
    unit: 'projeto',
    items: ['Design sob medida', 'Até 6 páginas', 'Formulário + WhatsApp', 'Publicação na Vercel'],
  },
  {
    divisao: 'sports',
    name: 'Cobertura de torneio',
    desc: 'Foto, vídeo e reels do primeiro saque à premiação.',
    from: 'R$ 4.700',
    unit: 'evento',
    items: ['2 fotógrafos', 'Reel no mesmo dia', 'Galeria para atletas', 'Transmissão opcional'],
    highlight: true,
  },
  {
    divisao: 'studio',
    name: 'Single completo',
    desc: 'Da pré-produção à faixa pronta nas plataformas.',
    from: 'R$ 2.480',
    unit: 'faixa',
    items: ['Produção e arranjo', 'Mixagem e master', 'Distribuição digital', 'Capa para Spotify'],
  },
];

export const members: Member[] = team.map((m) => ({
  name: m.name,
  role: m.role,
  bio: m.description,
  photo: m.name.startsWith('Marcella') ? '/images/marcella.png' : '/images/daniel.png',
  coord: m.name.startsWith('Marcella') ? 'FILMMAKER · DIREÇÃO' : 'ÁUDIO · CÓDIGO',
}));

export const partners: Partner[] = clients.map((c) => ({ name: c.name, logo: c.logo }));

export const process: ProcessStep[] = [
  { title: 'Briefing', desc: 'Entendemos objetivo, público e prazo numa conversa rápida.', note: '~ 1 dia' },
  { title: 'Proposta', desc: 'Escopo, cronograma e orçamento detalhado por etapa.', note: '~ 2 dias' },
  { title: 'Produção', desc: 'Execução com checkpoints semanais e prévias.', note: '2–8 semanas' },
  { title: 'Entrega', desc: 'Publicação, arquivos finais e suporte pós-entrega.', note: '+ 30 dias de suporte' },
];
