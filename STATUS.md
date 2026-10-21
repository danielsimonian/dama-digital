# STATUS.md — DAMA Digital

**Last updated:** 2026-10-20

---

## Active Focus

Design System v2 ("manual de campo") pronto em `/designsystem` (site) e `/designsystem/admin` (admin + protótipo). Próxima fase: construir o admin novo em `/painel` a partir desses componentes — **só quando o Daniel pedir**.

---

## Last Session Summary (20/10/2026)

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

## Plano do admin novo (`/painel`)

Respostas do Daniel: alunos = música da DAMA Studio · usuários = só Daniel e Marcella · pagamento marcado manualmente · construir em `/painel` ao lado do `/admin` e trocar quando pronto. O `/admin` atual é considerado desatualizado — não reaproveitar a estrutura de abas.

- **Telas:** Início · Pessoas (cadastro único com papéis aluno/estúdio/tech/sports) · Agenda (aulas + sessões, recorrência, presença) · Financeiro (lançamentos) · Orçamentos (gerador v2) · Catálogo · ⌘K.
- **Tabelas novas (Supabase):** `catalogo_servicos`, `planos`, `matriculas`, `eventos_agenda` (tipo aula/sessão, presença), `pacotes_horas`, `lancamentos` (origem: orçamento/mensalidade/sessão/pacote/avulso), `orcamento_versoes`.
- **Migração depois:** `sessoes`, `pagamentos`, `servicos` → `eventos_agenda`/`lancamentos` em etapa separada.
- **Portal:** Supabase Auth por cliente/aluno (acaba com `senha_acesso` em texto puro).
- **Ordem:** base + Pessoas + Catálogo → gerador v2 gerando lançamentos → agenda/aulas → financeiro + migração → portal.
- **Em aberto:** qual paleta de divisão vale no admin (DS vs `DIVISAO_CONFIG`); preços ilustrativos no `/designsystem`.

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

- No open PRs or branches; all work lands directly on `main`
- Site público completo: home ✅ sports ✅ tech ✅ studio ✅ sports/[slug] ✅
- Pendências: vídeos reais (hero, tech, studio — sports já tem), configurar Resend no `/api/send`
- Admin/portal redesign: visual proposto em `/designsystem/admin` (aguardando aprovação); construção em `/painel` é a próxima grande fase
- Vídeo `reel.mp4` (67MB) acima do limite de 50MB recomendado pelo GitHub — considerar Vercel Blob ou comprimir mais
