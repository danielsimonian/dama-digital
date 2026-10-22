# STATUS.md — DAMA Digital

**Last updated:** 2026-10-21

---

## Active Focus

Admin novo (`/painel`) e site público (Home + Tech/Sports/Studio) no Design System v2 — tudo em produção. Próximos: catálogo de preços, teste real do formulário.

---

## Last Session Summary (21/10/2026)

**`/painel` — admin novo (PRs #1, #3–#8), substitui o `/admin`:**
- Telas: Início (hoje, KPIs), Clientes (lista com ficha rápida + página dedicada `/painel/clientes/[id]` com totais, por divisão, financeiro, orçamentos, aulas, histórico, conteúdo e portal; `/painel/pessoas` redireciona), Agenda (semana, presença, reposição), Financeiro, Orçamentos (gerador v2), Catálogo, ⌘K
- Banco (`supabase/migrations/`): `catalogo_servicos`, `orcamento_versoes`, `lancamentos` (gatilho gera parcelas ao aprovar orçamento), `matriculas`, `pacotes_aulas`, `eventos_agenda` (`gerar_aulas` materializa aulas semanais; `aplicar_presenca` consome crédito)
- Regras das aulas: pacote antecipado de 4 aulas (R$ 400) ou avulsa (R$ 130); horário fixo semanal; uma sala; realizada e falta gastam crédito, justificada não (permite reposição)
- Histórico migrado: `servicos` (23) e `sessoes` (54) → `lancamentos`/`eventos_agenda` (coluna `legado`); tabelas antigas intactas. Orçamentos aprovados antes do painel não geraram lançamentos
- Portal do cliente no DS v2 (22/10/2026), via `portal_painel`: totais, sessões/aulas (pacote e presença), financeiro, conteúdo e orçamentos. `portal_dados` fica só por compatibilidade
- `/admin` antigo apagado; endereços antigos redirecionam para o `/painel` (`next.config.ts`). Os 2 orçamentos com pacotes (vencidos em 30/06) foram marcados como expirados

**Segurança (PR #2 e #7):**
- RLS: tabelas só para `public.equipe` (3 contas) via `is_equipe()`; portal e orçamento público só por funções SECURITY DEFINER
- Senha do portal com hash bcrypt (`clientes.senha_hash`; gatilho `clientes_protege_senha` converte o que for gravado em `senha_acesso` e apaga o texto). Ninguém vê a senha — a equipe gera outra na ficha da pessoa. Bloqueio após 10 erros em 15 min
- Dashboard: signup desligado; leaked password protection exige plano Pro (fica desligado)
- Usuário novo do admin precisa entrar em `public.equipe`

**Site público no DS v2 (PRs #9 e #10):**
- Home, `/tech`, `/sports`, `/sports/[slug]`, `/studio`, `/studio/artistas` usam `components/ds` (`SitePage`, `SiteSection`, `ContactSection` em `components/ds/page.tsx`)
- Conteúdo centralizado em `lib/site-data.ts` (projetos, torneios, catálogo de 40 lançamentos, serviços…)
- Briefing com envio real pelo `/api/send` e a divisão já escolhida em cada página
- `/labs` (índice) no DS; Poker Pay e Fidelidade mantêm a interface própria. Seções e header/footer antigos apagados
- E-mails do formulário no estilo do DS (`lib/email-templates.ts`)

---

## Previous Session (20/10/2026)

Commits em `main`: `ec3af0a` (design system do site) + `ec38115` (design system do admin). Ambos no ar.

**Prompt de design system:**
- `Design System/PROMPT DAMA.md` — prompt do Orbit adaptado para a DAMA (Prompt 1 = biblioteca; Prompt 2 = nova Home, ainda não executado). Pasta fora do git.
- Referências: Golden Suisse (Cosmos — preto, hairlines, círculos, diagramas de nós) e Polar "Agent-first Billing" (título em 2 linhas com 2ª em cinza, CTA `[ mono ]`, cards numerados 01–10 com cantos marcados, ilustração em traço).

**`/designsystem` — catálogo do site (28 seções):**
- Tokens escopados em `.ds` em `styles/dama-ds.css` (importado no `globals.css`; não altera os tokens do site atual). Tema escuro padrão + claro via `data-theme`; acento por divisão via `data-divisao`.
- Fontes Geist + Geist Mono carregadas só na rota (`app/designsystem/layout.tsx`, `noindex`).
- Componentes em `components/ds/`: `primitives`, `fields`, `interactive` (dropdown, accordion, tabs, paginação, modal, drawer, toast), `line-art` (10 ilustrações), `diagram` (diagrama das 3 divisões + processo), `cards`, `media` (galeria + lightbox, reel), `site` (header, hero, footer, WhatsApp), `contact-form` (briefing em 3 etapas).

**`/designsystem/admin` — admin novo (só visual, dados fictícios):**
- Componentes em `components/ds/admin/`: `shell` (sidebar, ⌘K, troca Daniel/Marcella), `display` (KPI, pacote de horas, frequência, linha do tempo, status), `table` (DataTable), `agenda` (semana + presença), `finance-chart` (recebido × a receber, 1 cor + textura), `quote-builder` (gerador v2 com catálogo, parcelas e container queries).
- Protótipo navegável com 6 telas + portal do aluno (mobile).
- Paleta das divisões reprovou no validador de daltonismo (verde × tijolo) → gráficos não separam divisão só por cor.

---

## Pendências

- **Resend:** `RESEND_API_KEY` já está na Vercel (conferido em 21/10/2026 sem enviar e-mail); falta só um envio de teste real pelo site para confirmar o domínio remetente
- **Catálogo de preços** do `/painel` vazio — o `/designsystem` mostra os cards de serviço como "valor de exemplo"
- **Orçamentos com pacotes:** o gerador v2 não monta pacotes (trazer se voltar a usar)
- Vídeos reais (`tech-placeholder.mp4`, `studio-placeholder.mp4` não são mais usados nas páginas novas)

---

## Previous Session (11/06/2026)

Dois commits em `main`: `57b245d` + `d56f798`

**DAMA Sports — páginas de torneio:**
- Criada `lib/sports-events.ts` — fonte única de verdade para todos os torneios (tipo, slugs, galeria, reels, sponsors, stats)
- Criada `app/sports/[slug]/page.tsx` — página individual de torneio com reel (autoplay muted loop), mosaico de fotos orientation-aware (portrait/landscape), stats, parceiros
- Mosaico mobile: 4 linhas (landscape = linha inteira, 2 portraits = lado a lado) via `grid-cols-2` sem `grid-rows-N` + aspect-ratio por célula
- Slug/pasta renomeados: `open-spfc` → `6o-open-spfc` em tudo (dados, imagens, vídeo)
- Logos de parceiros: 8 novos em `/images/clients/` (addera, anglo-morumbi, areiabar, coroteice, mindcourt, nandabani, rktco, sacaecorre)
- Campo `zoom?: boolean` em sponsors para logos quadrados que mostram fundo

**DAMA Sports — `/sports`:**
- Parceiros derivados automaticamente dos `sponsors` de todos os torneios + `extraClients` legados (deduplicados por logo path)
- Todos os 3 torneios atualizados para `realizado`; seção "Torneios realizados" com logo + LastEventCard

**Home:**
- Painel Sports atualizado: "✓ Último torneio — 6º Open SPFC"; Seletiva + Open Santos riscados como realizados

**Footer:** logo mobile reduzido para `w-36 md:w-full`

---

## Notes

- Fluxo: uma branch por entrega → PR para `main` → Daniel revisa no preview da Vercel e faz o merge. Link do preview: pegar no comentário do bot da Vercel na PR (nomes longos são truncados)
- Supabase free tier pausa após ~1 semana sem uso
- Vídeo `reel.mp4` (67MB) acima do limite de 50MB recomendado pelo GitHub — considerar Vercel Blob ou comprimir mais
