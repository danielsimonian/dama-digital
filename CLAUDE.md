# DAMA Digital — Claude Code Context

## Skills personalizadas

### Gerador de Orçamentos
Quando o usuário pedir para criar, sugerir ou montar um orçamento, siga as instruções definidas em:
`skills/orcamentos/SKILL.md`

Leia o arquivo da skill antes de responder qualquer pedido relacionado a orçamentos.

---

## Project Overview

**DAMA Digital** is a Brazilian creative agency platform built and operated by founders Daniel Simonian and Marcella Lima. The app consolidates three product areas:

1. **Agency Website** — Home + three divisions: DAMA Tech (índigo), DAMA Sports (tijolo), DAMA Studio (musgo) — Design System v2
2. **Admin (`/painel`)** — internal CRM: pessoas, agenda/aulas, financeiro, orçamentos, catálogo (the old `/admin` redirects here)
3. **Client Portal** — password-gated per-client area with sessions, content and charges tabs
4. **Labs** — experimental products: Poker Pay (cash game + tournament manager) and Fidelidade Digital (loyalty card system)

The app is deployed on Vercel. Backend is 100% serverless: Supabase (PostgreSQL + Auth) for structured data, Upstash Redis for real-time/ephemeral data (poker sessions, loyalty stores).

---

## Current Status

**Branch ativa:** `main` (produção) — domínio oficial: https://www.damadigitalcriativa.com.br

**Atualizado em 21/10/2026** (detalhes em `STATUS.md`):
- **Admin novo `/painel`** no ar (PRs #1–#8): Início, Pessoas, Agenda, Financeiro, Orçamentos (gerador v2), Catálogo, ⌘K. `/admin` redireciona para o painel (`next.config.ts`); só `/admin/orcamentos/[id]` segue vivo para orçamentos com **pacotes**
- **Segurança** (PRs #2, #7): RLS só para `public.equipe`; portal e orçamento público via funções SECURITY DEFINER; senha do portal com hash bcrypt
- **Site público no Design System v2** (PRs #9, #10): Home, `/tech`, `/sports`, `/sports/[slug]`, `/studio`, `/studio/artistas`. Ainda no visual antigo: `/labs`
- **Design System v2** em `/designsystem` e `/designsystem/admin` (catálogo; `noindex`). Linguagem "manual de campo": base monocromática, hairlines, cantos marcados, anotações em Geist Mono, acento só por divisão
- Tokens escopados em `.ds` (`styles/dama-ds.css`); tema via `data-theme`, acento via `data-divisao`
- Prompt de origem em `Design System/PROMPT DAMA.md` (pasta fora do git)

**Fluxo de trabalho:** uma branch por entrega → PR para `main` → Daniel revisa no preview da Vercel e faz o merge. Push/PR só com o ok dele. O link do preview vem do comentário do bot da Vercel na PR (nomes longos são truncados — não montar a URL na mão).

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| UI | React 19, Tailwind CSS 4 |
| Animations | Framer Motion 12 |
| Icons | Lucide React |
| Drag & Drop | dnd-kit (core, sortable, utilities) |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (email/password) |
| Real-time cache | Upstash Redis (REST) |
| Email | Resend API |
| PDF | jsPDF + html2canvas |
| QR Codes | qrcode.react |
| Analytics | Vercel Analytics + Speed Insights |
| Deployment | Vercel |

---

## Architecture

### Routing structure

```
app/
├── page.tsx                      # Home (DS v2): hero, divisões, capacidades, números, processo, parceiros, fundadores, contato
├── _home/Divisoes.tsx            # Destaque por divisão na Home
├── painel/                       # Admin novo — requires Supabase auth + public.equipe
│   ├── entrar/                   # Login
│   ├── page.tsx                  # Início: KPIs, aulas de hoje, orçamentos abertos
│   ├── pessoas/                  # Cadastro único (papéis aluno/estúdio/tech/sports) + ficha (aulas, orçamentos, financeiro, conteúdo, portal)
│   ├── agenda/                   # Semana: aulas recorrentes, sessões, presença, reposição
│   ├── financeiro/               # Lançamentos: recebido × a receber, atrasados
│   ├── orcamentos/               # Lista + [id] editor v2 (QuoteBuilder)
│   └── catalogo/                 # Serviços e preços por divisão
├── admin/                        # Antigo — redireciona para /painel; só orcamentos/[id] (tipo pacotes) continua
├── cliente/[slug]/               # Client portal — password-gated per slug (RPCs portal_*)
├── orcamento/[slug]/             # Public quote view/approval page (RPCs orcamento_*)
├── labs/
│   ├── poker-pay/                # Cash game lobby, sessions, players, groups, ranking, report
│   └── fidelidade/               # Loyalty store create + [slug] card view
├── sports/
│   ├── page.tsx                  # DAMA Sports (DS v2): reel, torneios, histórico, serviços, parceiros, contato
│   └── [slug]/page.tsx           # Página de torneio: números, reel + fotos, patrocinadores
├── studio/
│   ├── page.tsx                  # DAMA Studio (DS v2): último lançamento, produção, artistas, aulas, distribuição
│   └── artistas/page.tsx         # Catálogo completo de lançamentos, filtro por ano
├── tech/page.tsx                 # DAMA Tech (DS v2): serviços, projetos, processo, Labs
├── designsystem/                 # Catálogo do DS v2 (site + admin)
└── api/
    ├── send/                     # Contact/briefing form (Resend)
    ├── poker/                    # 7 endpoints: jogadores, session, grupos, inscricoes, historico
    └── fidelidade/               # 5 endpoints: loja, ponto, codigo, cliente, resgate
```

### Data layer

- **Supabase** handles: `clientes` (pessoas), `orcamentos`, `orcamento_itens`, `orcamento_versoes`, `catalogo_servicos`, `lancamentos`, `matriculas`, `pacotes_aulas`, `eventos_agenda`, `aulas_modulos`/`aulas_conteudos`, `equipe`, `portal_sessoes`. Legacy `servicos`, `sessoes`, `pagamentos` kept untouched (migrated to `lancamentos`/`eventos_agenda`)
- **Redis** handles: poker player registry, poker sessions (7-day TTL), poker groups, loyalty shops
- **Migrations** are versioned in `supabase/migrations/` and applied via the Supabase MCP (`apply_migration`)
- **Site content** (projects, tournaments, releases, services) lives in `lib/site-data.ts` + `lib/sports-events.ts` + `lib/constants.ts`

### Auth

- `lib/auth-context.tsx` — `AuthProvider` wraps the app, exposes `useAuth()` hook
- `/painel` checks session; unauthenticated users redirect to `/painel/entrar`. RLS only lets accounts listed in `public.equipe` (via `is_equipe()`) read/write — a new admin user must be added there
- Sign-ups are disabled in the Supabase dashboard
- Client portal password is stored only as a bcrypt hash in `clientes.senha_hash` (trigger hashes anything written to `senha_acesso` and clears it); login via RPC `portal_entrar` (10 wrong attempts / 15 min lock)

---

## Key Decisions Made

1. **Single Next.js app** covers marketing site, admin, client portal, and labs — no separate services
2. **Upstash Redis** for poker/loyalty: sessions are ephemeral and real-time; no need to persist in Postgres
3. **Division system** (`tech` | `sports` | `studio`) is a first-class concept embedded in quotes, colors, routing, and config. New UI takes the accent from the DS (`data-divisao`); `DIVISAO_CONFIG` in `lib/supabase.ts` is still used by the old admin, the portal, the public quote page and the e-mails in `/api/send`
4. **Password-protected client portal** uses a slug URL + bcrypt-hashed password (not Supabase Auth per-client — only 3 of 14 clients have e-mail)
5. **Auto-save** in CashGame: 1-second debounce writes session state to Redis on every change
6. **Quote lifecycle**: `rascunho → enviado → visualizado → aprovado | recusado | expirado`
7. **Package quotes** (`tipo: 'pacotes'`): items can be tagged to a package, one package can be `pacote_destaque`
8. **Monthly pricing** on quote items: `valor_mensal` + `descricao_mensal` for recurring service offers
9. **Labs as isolated experiments**: `/labs/*` is self-contained with its own Redis-backed API layer

---

## Repository

- **Root:** `/Users/danielsimonian/Documents/Claude/Projects/dama-digital`
- **Git remote:** GitHub `danielsimonian/dama-digital` (Vercel cria preview por PR)
- **Branch:** `main`
- **MCP:** Supabase MCP configurado em `.mcp.json` (gitignored) com personal access token — disponível neste projeto ao reiniciar o Claude Code

### Key files to know

| File | Purpose |
|------|---------|
| `lib/supabase.ts` | All DB types, Supabase client, helper functions, DIVISAO_CONFIG |
| `lib/auth-context.tsx` | Auth state provider + useAuth hook |
| `lib/redis.ts` | Upstash Redis client |
| `lib/constants.ts` | Services list, clients list, team, social links |
| `lib/sports-events.ts` | Dados centralizados de todos os torneios Sports (slug, galeria, reels, sponsors, stats) |
| `styles/dama-ds.css` | Tokens do Design System v2 (escopo `.ds`, temas, acentos por divisão) |
| `components/ds/` | Componentes do Design System v2 (site); `components/ds/page.tsx` = `SitePage`/`SiteSection`/`ContactSection`; `components/ds/admin/` = componentes do admin |
| `lib/site-data.ts` | Conteúdo do site no formato dos componentes do DS (projetos, torneios, lançamentos, serviços) |
| `supabase/migrations/` | Migrações SQL versionadas (RLS, painel, portal) |
| `components/labs/CashGame.tsx` | Largest file (1,257 lines) — full poker cash game manager |
| `components/BriefingForm.tsx` | 544 lines — client briefing intake form |
| `app/cliente/[slug]/page.tsx` | Client portal with Sessões / Conteúdo / Financeiro / Serviços tabs |
| `app/painel/` | Admin novo (ver Routing structure) |

---

## Next Steps

Likely priorities:

1. **Labs no Design System** — `/labs`, Poker Pay e Fidelidade ainda no visual antigo
2. **Limpeza de código antigo** — `components/sections/*`, `components/layout/Header|Footer` (só o `/labs` usa), `/admin` (depois dos 2 orçamentos com pacotes; ou trazer o modo pacotes para o editor do painel)
3. **Testar o Resend** — `RESEND_API_KEY` já está na Vercel; falta um envio real pelo briefing para confirmar o remetente
4. **Preços ilustrativos** no `/designsystem` (trocar por reais ou remover)
5. **Vídeos reais** — Home e divisões novas já não usam os placeholders
6. **Quote PDF polish** — print CSS export could use layout refinement
7. **💡 Ideia futura — DAMA Sports Fotos (estilo Banlek)** — planejado em 30/09/2026, ainda não iniciado. Atleta tira selfie e vê todas as suas fotos do torneio; fotógrafos convidados pelo admin fazem login, cadastram torneio e sobem fotos.
   - Fotos grátis no MVP (venda via Pix = fase 2)
   - Stack 100% gratuita: `@vladmandic/human` (reconhecimento facial no navegador) + pgvector no Supabase (`halfvec(1024)`, RPC `buscar_fotos_por_rosto`) + Cloudflare R2 free (10 GB, egress grátis) com `aws4fetch` para URLs de upload assinadas — deps já aprovadas pelo Daniel
   - Rotas previstas: `/fotografo/*` (painel, role `fotografo`), convites no `/painel`, `/sports/fotos/[slug]` (atleta)
   - LGPD: consentimento explícito (biometria, art. 11); selfie nunca sai do navegador nem é salva
   - Setup manual pendente: conta Cloudflare + bucket R2 + CORS + envs (`R2_*`, `NEXT_PUBLIC_R2_PUBLIC_URL`, `SUPABASE_SERVICE_ROLE_KEY`)
   - Plano completo: `~/.claude/plans/quero-conversar-sobre-uma-cozy-torvalds.md`

---

## Open Questions

- Are poker player records meant to eventually migrate from Redis to Supabase?
- What is the intended scope of the Fidelidade system — personal project or client-deliverable product?

---

## Rules for Claude

- **Language**: Respond in the same language the user writes in. Most codebase strings are in Portuguese (pt-BR); variable names and types are English.
- **Scope**: Make only the change asked. Do not refactor surrounding code, add comments, or "clean up" unless asked.
- **Quote generation**: Always read `skills/orcamentos/SKILL.md` before producing quote content.
- **Supabase types**: All DB types are defined in `lib/supabase.ts`. Extend there when adding new fields — do not redeclare inline.
- **Division colors**: In new UI (site and `/painel`), use the DS accent via `data-divisao` + `ds-accent` tokens and `DIVISAO_LABEL` from `components/ds/primitives`. In the legacy screens and e-mails that still use it, use `DIVISAO_CONFIG` from `lib/supabase.ts`. Never hardcode division colors.
- **Redis vs Supabase**: Poker and loyalty data lives in Redis. Client/quote/service data lives in Supabase. Don't mix.
- **New pages**: Follow the existing App Router conventions — `page.tsx` inside a folder, `layout.tsx` only when needed.
- **No mocks**: Do not mock Supabase or Redis in any code. Use the real clients.
- **No extra dependencies**: Prefer using existing packages (Lucide for icons, jsPDF for PDFs, dnd-kit for drag). Ask before adding new deps.
- **Passwords**: Never store passwords in plaintext. Portal passwords go through `senha_acesso` only as write input (the trigger hashes and clears it); never read or display them.
- **Prompts para execução**: Sempre que gerar um prompt para ser copiado e colado no Claude Code ou outro terminal, envolva o conteúdo inteiro em um bloco de código markdown (``` ... ```) para facilitar a cópia.
