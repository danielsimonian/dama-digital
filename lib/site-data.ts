// Conteúdo real do site (home e /designsystem) no formato dos componentes do Design System
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
  {
    name: 'Escola Simonian de Música',
    tag: 'site institucional · música',
    domain: 'escolasimonian.com.br',
    logo: '/images/projects/simonian-logo.png',
    desc: 'Site institucional da Escola Simonian de Música — cursos, professores, agenda e matrícula online.',
    href: 'https://escolasimonian.com.br',
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
  // o banner é arte de divulgação (com cupom vencido): mostra o logo até ter fotos
  'open-santos-assesp': null,
};

export const tournaments: Tournament[] = sportsEvents.map((e) => ({
  name: e.name,
  modalidade: e.subtitle,
  dateShort: DATE_SHORT[e.slug] ?? String(e.year),
  location: e.location,
  cover: e.slug in COVER ? COVER[e.slug] : e.banner,
  logo: e.logo,
  status: e.status === 'em-breve' ? 'proximo' : e.status === 'inscricoes-abertas' ? 'inscricoes' : 'realizado',
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

// Sports: patrocinadores de todos os torneios + clientes de eventos antigos, sem repetir logo
const sportsExtras: Partner[] = [
  { name: 'Rony Motors', logo: '/images/clients/rony.png' },
  { name: 'Tom Beach', logo: '/images/clients/tombeach.png' },
  { name: 'Open SP', logo: '/images/clients/opensp.webp' },
  { name: 'Hydra', logo: '/images/clients/hydra.png' },
  { name: 'Genial', logo: '/images/clients/genial.png' },
];

export const sportsPartners: Partner[] = Array.from(
  new Map(
    [...sportsEvents.flatMap((e) => e.sponsors.map((s) => ({ name: s.name, logo: s.logo }))), ...sportsExtras].map((p) => [p.logo, p]),
  ).values(),
);

export const sportsServices = [
  { name: 'Gestão do torneio', desc: 'Chaveamento, inscrições via LetzPlay e RankingBT, categorias e resultados do início ao fim.' },
  { name: 'Arbitragem', desc: 'Árbitros certificados para torneios de qualquer porte, com fair play em todas as quadras.' },
  { name: 'Locação de som', desc: 'Áudio profissional com operador incluso — da abertura à premiação.' },
  { name: 'Cobertura audiovisual', desc: 'Fotografia, filmagem e imagens aéreas com drone. Reel pronto no mesmo dia.' },
  { name: 'Troféus e medalhas', desc: 'Produção personalizada com a identidade visual do evento.' },
  { name: 'Estrutura completa', desc: 'Quadras, treliças, pódio, staff e tudo que o evento precisa para acontecer.' },
];

// Studio: todos os lançamentos produzidos no estúdio (mais recente primeiro)
const SP = 'https://open.spotify.com/album/';

export const studioReleases: Release[] = [
  { artist: 'Fernando Silveyra', title: 'Confiança', year: 2026, type: 'Álbum', cover: '/images/studio/fernando-silveyra-confianca.jpg', spotify: `${SP}67dv685dARviuHRS8K5jVF` },
  { artist: 'Fábio Zulli', title: 'Nico Manezinho', year: 2026, type: 'Single', cover: '/images/studio/fabio-zulli-nico-manezinho.jpg', spotify: `${SP}7Ly3VKT8LgL0TULQpIfvO5` },
  { artist: 'SAID', title: 'Find Love', year: 2026, type: 'Single', cover: '/images/studio/said-find-love.jpg', spotify: `${SP}2Fmk8IR5DvSVZhWEXdKrnU` },
  { artist: 'Antonio Eduardo', title: 'MRB — Revisitando Guerra Peixe', year: 2026, type: 'Álbum', cover: '/images/studio/antonio-eduardo-revisitando-guerra-peixe.jpg', spotify: `${SP}73qBHEp5bTTe6f3QvKvFVe` },
  { artist: 'Antonio Eduardo', title: 'MRB — Miniaturas Secretas de Harry Crowl', year: 2026, type: 'EP', cover: '/images/studio/antonio-eduardo-miniaturas-secretas.jpg', spotify: `${SP}64zyVmjoOZq6tZbbWUh3Kj` },
  { artist: 'Antonio Eduardo', title: 'MRB — Compositores Baianos', year: 2026, type: 'Single', cover: '/images/studio/antonio-eduardo-compositores-baianos.jpg', spotify: `${SP}7577b5w14KGTojPpKKuJW8` },
  { artist: 'André Simonian', title: 'Manifesto', year: 2025, type: 'Single', cover: '/images/studio/andre-simonian-manifesto.jpg', spotify: `${SP}1MzPmMFTOFKqG0Hk13zpJ0` },
  { artist: 'André Simonian', title: 'Nosso Grande Alento', year: 2025, type: 'Single', cover: '/images/studio/andre-simonian-nosso-grande-alento.jpg', spotify: `${SP}5k98tQ1r7mN09SCkj7w8Rz` },
  { artist: 'SAID', title: 'Tik Tok', year: 2025, type: 'Single', cover: '/images/studio/said-tik-tok.jpg', spotify: `${SP}0PsMhzZxCD95ucZ1LVIi5m` },
  { artist: 'SAID', title: 'Vontade Louca', year: 2025, type: 'Single', cover: '/images/studio/said-vontade-louca.jpg', spotify: `${SP}6ak4VamDvkhS1ABem0Guxj` },
  { artist: 'José Simonian', title: 'Houve as Nossas Canções', year: 2024, type: 'Álbum', cover: '/images/studio/jose-simonian-houve-as-nossas-cancoes.jpg', spotify: `${SP}02d1YLgTKflDku4qvTZ9px` },
  { artist: 'André Simonian', title: 'Notícias do Brasil', year: 2024, type: 'Single', cover: '/images/studio/andre-simonian-noticias-do-brasil.jpg', spotify: `${SP}6VOpqlnhDgiQVG96v724nA` },
  { artist: 'SAID', title: 'My Head', year: 2024, type: 'Single', cover: '/images/studio/said-my-head.jpg', spotify: `${SP}2ZiCJ3KFbqNHeK9JzWKXIQ` },
  { artist: 'SAID', title: 'Impact', year: 2024, type: 'EP', cover: '/images/studio/said-impact.jpg', spotify: `${SP}2FiObNM2Ofmi8iJAMb0vQy` },
  { artist: 'SAID', title: 'I Miss You', year: 2023, type: 'Single', cover: '/images/studio/said-i-miss-you.jpg', spotify: `${SP}59E6uGIkrEsmcHJBgrNEZD` },
  { artist: 'Fábio Zulli', title: 'Cantando Poeminhas', year: 2023, type: 'Álbum', cover: '/images/studio/fabio-zulli-cantando-poeminhas.jpg', spotify: `${SP}4cTFV6okjccoHws49DWqjm` },
  { artist: 'Raffa Pereira', title: 'Canto pra Guerreira', year: 2022, type: 'Single', cover: '/images/studio/raffa-pereira-canto-pra-guerreira.jpg', spotify: `${SP}29jva9tHQt3oEN16jj1S7c` },
  { artist: 'André Simonian', title: 'Davi', year: 2022, type: 'Single', cover: '/images/studio/andre-simonian-davi.jpg', spotify: `${SP}70zO6tf122ISeDYj5qTuXy` },
  { artist: 'André Simonian', title: 'Lança, Vol. 01', year: 2022, type: 'EP', cover: '/images/studio/andre-simonian-lanca-vol-01.jpg', spotify: `${SP}4ow20X22JNmtQ79eguZEBi` },
  { artist: 'André Simonian', title: 'Porta Aberta', year: 2022, type: 'Single', cover: '/images/studio/andre-simonian-porta-aberta.jpg', spotify: `${SP}4NhrlydeGdVofo2oZImRAl` },
  { artist: 'SAID', title: 'Le Petit', year: 2022, type: 'Single', cover: '/images/studio/said-le-petit.jpg', spotify: `${SP}05rHHXhl6P9L3TyCbzEfsK` },
  { artist: 'SAID', title: 'Pode Falar', year: 2022, type: 'Single', cover: '/images/studio/said-pode-falar.jpg', spotify: `${SP}7ugyDTQKie5NdqmrVfhjK6` },
  { artist: 'Karina Cyrillo', title: 'Te Quis', year: 2022, type: 'Single', cover: '/images/studio/karina-cyrillo-te-quis.jpg', spotify: `${SP}3WzDvd9SCgBkM07JAqTp3Z` },
  { artist: 'Caio Jack', title: 'Alto Mar', year: 2022, type: 'Single', cover: '/images/studio/caio-jack-alto-mar.jpg', spotify: `${SP}5dO6YvY2Jn4zOVgp69kKoI` },
  { artist: 'Caio Jack', title: 'Dia de Sol', year: 2022, type: 'Single', cover: '/images/studio/caio-jack-dia-de-sol.jpg', spotify: `${SP}5ydCucHC5INf5CDd3rGFTc` },
  { artist: 'Karina Cyrillo', title: 'Ella', year: 2021, type: 'Single', cover: '/images/studio/karina-cyrillo-ella.jpg', spotify: `${SP}1zPhcya15SVrFsHtu1bPa0` },
  { artist: 'Karina Cyrillo', title: 'Passarinho', year: 2021, type: 'Single', cover: '/images/studio/karina-cyrillo-passarinho.jpg', spotify: `${SP}6KUFOCJy12OvFKYIFnfE3k` },
  { artist: 'Raffa Pereira', title: 'Ai Amor', year: 2021, type: 'Single', cover: '/images/studio/raffa-pereira-ai-amor.jpg', spotify: `${SP}4j8hnS5S74opp7vfPtHlNA` },
  { artist: 'Raffa Pereira', title: 'Liberdade Dança', year: 2021, type: 'Single', cover: '/images/studio/raffa-pereira-liberdade-danca.jpg', spotify: `${SP}4UDoKOwmykXxaWZ0a1t9Bk` },
  { artist: 'Lopes.Inc', title: 'Amor de Carnaval', year: 2021, type: 'Single', cover: '/images/studio/lopes-inc-amor-de-carnaval.jpg', spotify: `${SP}4X0DyS8vgnj4UNfpgSguoR` },
  { artist: 'Caio Simonian', title: 'Voz, violão e vassoura', year: 2021, type: 'Álbum', cover: '/images/studio/caio-simonian-voz-violao-e-vassoura.jpg', spotify: `${SP}36wB8Ss6R8cOjKvIEvgYv6` },
  { artist: 'Karina Cyrillo', title: 'Cicatrizes', year: 2020, type: 'Single', cover: '/images/studio/karina-cyrillo-cicatrizes.jpg', spotify: `${SP}4kWeggaKmaDk3EgYICk1iL` },
  { artist: 'Karina Cyrillo', title: 'Acústicas', year: 2020, type: 'EP', cover: '/images/studio/karina-cyrillo-acusticas.jpg', spotify: `${SP}5Wj422coBpJpNVZzjatY4l` },
  { artist: 'Intemporal', title: 'Anseio', year: 2020, type: 'Single', cover: '/images/studio/intemporal-anseio.jpg', spotify: `${SP}4bEMPiBcCmD6GlrI5NmZhc` },
  { artist: 'Intemporal', title: 'Espelho', year: 2020, type: 'Single', cover: '/images/studio/intemporal-espelho.jpg', spotify: `${SP}6wiL2pjHPkdaJzn2r8jSxL` },
  { artist: 'Intemporal', title: 'Não Dá Mais', year: 2020, type: 'Single', cover: '/images/studio/intemporal-nao-da-mais.jpg', spotify: `${SP}45VqKZ1MQ6uFQ0dBLw0ryA` },
  { artist: 'Daniel Simonian & Marcella Lima', title: 'Temporal (Acústico)', year: 2020, type: 'Single', cover: '/images/studio/daniel-marcella-temporal-acustico.jpg', spotify: `${SP}4y0hnnmdJbGh8JKqjCzt3B` },
  { artist: 'Marcos Alves', title: 'Amanhecerá', year: 2016, type: 'Álbum', cover: '/images/studio/marcos-alves-amanhacera.jpg', spotify: `${SP}0LxOuQHgwSduQyHYj1AAdS` },
  { artist: 'Fernando Silveyra', title: 'Labaredas', year: 2015, type: 'Álbum', cover: '/images/studio/fernando-silveyra-labaredas.jpg', spotify: `${SP}7G5RewztShPZLZnH1mifjR` },
  { artist: 'Kayoko Yamabe', title: 'Lembrança do Brasil', year: 2012, type: 'Álbum', cover: null, spotify: null },
];

export const studioArtists: { name: string; genre: string }[] = [
  { name: 'Fernando Silveyra', genre: 'MPB' },
  { name: 'SAID', genre: 'Pop' },
  { name: 'Antonio Eduardo', genre: 'Música Clássica Brasileira' },
  { name: 'André Simonian', genre: 'Pop / MPB' },
  { name: 'José Simonian', genre: 'MPB / Clássico' },
  { name: 'Fábio Zulli', genre: 'Música Infantil' },
  { name: 'Raffa Pereira', genre: 'MPB & Jazz' },
  { name: 'Karina Cyrillo', genre: 'Pop' },
  { name: 'Caio Jack', genre: 'Pop' },
  { name: 'Lopes.Inc', genre: 'Pop' },
  { name: 'Caio Simonian', genre: 'Jazz / MPB' },
  { name: 'Intemporal', genre: 'Rock' },
  { name: 'Daniel Simonian & Marcella Lima', genre: 'MPB' },
  { name: 'Marcos Alves', genre: 'MPB' },
  { name: 'Kayoko Yamabe', genre: 'Música Clássica' },
];

export const studioIncludes = [
  'Gravação em estúdio tratado acusticamente',
  'Edição e comping de takes',
  'Arranjo e direção musical',
  'Mixagem',
  'Masterização em padrão de mercado',
  'Distribuição digital (150+ plataformas)',
  'Registro de ISRC',
];

export const studioAulas = [
  { name: 'Violão', desc: 'Do básico ao avançado — acordes, técnica, harmonia e repertório.' },
  { name: 'Guitarra', desc: 'Rock, blues, jazz e além — técnica, improviso e sonoridade.' },
  { name: 'Produção musical', desc: 'DAW, arranjo, gravação e lançamento — do zero ao release.' },
];

export const studioDistribuicao = [
  { value: 'ISRC', label: 'por faixa', note: 'Código internacional que identifica cada gravação.' },
  { value: '150+', label: 'plataformas', note: 'Spotify, Apple Music, Deezer, YouTube Music e mais.' },
  { value: 'UPC', label: 'por álbum', note: 'Código de barras para distribuição física e digital.' },
];

export const studioCaminhos = [
  { name: 'Gravar', desc: 'Tem um projeto musical e quer produzir com qualidade.', cta: 'Falar sobre gravação' },
  { name: 'Aprender', desc: 'Quer começar do zero ou evoluir no instrumento ou na produção.', cta: 'Agendar aula experimental' },
  { name: 'Lançar', desc: 'Já tem a música gravada e quer distribuir e registrar.', cta: 'Falar sobre distribuição' },
];

// Tech
export const techServices = [
  { name: 'Websites', desc: 'Sites institucionais, landing pages e e-commerces que convertem.' },
  { name: 'Sistemas web', desc: 'Plataformas sob medida: CRMs, dashboards, portais e intranets.' },
  { name: 'Aplicativos', desc: 'Apps mobile e web — do MVP ao produto que escala.' },
  { name: 'Automações', desc: 'Fluxos automáticos que eliminam trabalho repetitivo.' },
  { name: 'Integrações', desc: 'APIs, webhooks e conexão entre ferramentas que não conversam.' },
  { name: 'Consultoria', desc: 'Revisão de arquitetura, stack e estratégia de produto.' },
];

export const techLabs = [
  { name: 'Poker Pay', desc: 'Gerenciador de cash game e torneios de poker — fichas, entradas, reentradas e pagamentos em tempo real.', href: '/labs/poker-pay' },
  { name: 'Fidelidade Digital', desc: 'Cartão fidelidade digital para qualquer negócio. Sem papel, sem app — funciona no navegador do cliente.', href: '/labs/fidelidade' },
];
