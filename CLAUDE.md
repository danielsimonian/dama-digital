# DAMA Digital — Claude Code Context

## Skills personalizadas

### Gerador de Orçamentos
Quando o usuário pedir para criar, sugerir ou montar um orçamento, siga as instruções definidas em:
`skills/orcamentos/SKILL.md`

Leia o arquivo da skill antes de responder qualquer pedido relacionado a orçamentos.

---

## Project Overview

**DAMA Digital** is a Brazilian creative agency platform built and operated by founders Daniel Simonian and Marcella Lima. The app consolidates three product areas:

1. **Agency Website** — public landing page for three divisions: DAMA Tech (purple/pink), DAMA Sports (orange/red), DAMA Studio (blue/cyan)
2. **Admin Dashboard** — internal CRM for managing clients, quotes (orçamentos), and services
3. **Client Portal** — password-gated per-client area with sessions, content, financials, and services tabs
4. **Labs** — experimental products: Poker Pay (cash game + tournament manager) and Fidelidade Digital (loyalty card system)

The app is deployed on Vercel. Backend is 100% serverless: Supabase (PostgreSQL + Auth) for structured data, Upstash Redis for real-time/ephemeral data (poker sessions, loyalty stores).

---

## Current Status

**Branch ativa:** `main` (produção)

**Branch `main` — redesign completo em produção (merge de 23/04/2026), atualizado em 15/05/2026:**
- `2d6ddfc` — redesign home + atualizações DAMA Sports (15/05/2026)
- `062678f` — merge redesign/publico → main (redesign completo do site público)
- `08df077` — limpeza do repo: remoção de poker-pay-app/, poker-control-*.md, .claude/worktrees/
- `72f3f60` — portfólio Studio completo + atualizações DAMA Tech (43 arquivos)

**Home (`/`) — estado atual (15/05/2026):**
- Hero: headline ciclante "Seu evento / Seu sistema / Sua música merece mais." com cor por divisão, vídeo placeholder, stats bar (20+ anos · 3 divisões · 100+ projetos), 3 CTAs por divisão
- Divisions: spotlight interativo com painéis temáticos por divisão; Seletiva Pan-Americano substituiu Open Tom Beach; badge "em breve" do Studio removido; painel Studio lista 5 serviços
- About: layout editorial 2 colunas — eyebrow+headline+texto+stats à esquerda, retratos 3:4 dos fundadores à direita
- Portfolio: logos em círculos corrigidos (object-contain + overflow-hidden + aspect-square); IFBT adicionado

**DAMA Sports (`/sports`) — estado atual (15/05/2026):**
- Torneios: Seletiva Seleção Brasileira Pan-Americano IFBT (23-24/mai, Santos) substituiu Open Tom Beach; Open SPFC (29-31/mai) mantido; link LetzPlay: letzplay.me/assespgonzaga/tourneys/57445
- Nav: logo DAMA Sports (`/images/dama-sports-logo.png`) — branco no hero (brightness-0 invert quando !scrolled), preto ao rolar
- Parceiros: IFBT adicionado (`/images/clients/ifbt.jpg`)
- Círculos de logos: mesma correção da home (object-contain + overflow-hidden)

**Studio (`/studio` + `/studio/artistas`) — estado atual (13/05/2026):**
- `/studio/artistas`: 15 artistas, 40+ releases com capas reais do Spotify, cards clicáveis → Spotify
- `/studio`: hero cicla 15 artistas com gênero, portfólio preview com 4 lançamentos 2026, stats atualizados (15 artistas · +40 lançamentos · 12+ anos), link "Ouvir no Spotify" no Último Lançamento
- Padrão de imagens: `public/images/studio/[artista]-[release].jpg`
- Spotify URLs em campo `spotify: string | null` — cards com link viram `<a>`, sem link ficam `<div>`

**DAMA Tech (`/tech`) — estado atual (13/05/2026):**
- Hero typewriter: 5 projetos → Maxwell Rodrigues + Escola Simonian de Música adicionados
- Projetos: Maxwell URL → maxwellrodrigues.com · Escola Simonian adicionada com logo verde
- Número decorativo "02" no hero removido

**Branch `redesign/publico`** — ainda existe, mas já foi mergeada. Próximo uso: redesign do admin/portal.

The system is **production-ready and actively used**. O redesign público está no ar no domínio oficial.

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
├── page.tsx                      # Public landing (Hero, Divisions, Portfolio, Contact)
├── (admin)/                      # Admin area — requires Supabase auth
│   ├── login/                    # Email/password login
│   ├── page.tsx                  # Dashboard: quote stats, recent activity
│   ├── orcamentos/               # Quote list + [id] editor
│   ├── clientes/                 # Client list + [id] detail
│   └── configuracoes/            # Settings
├── cliente/[slug]/               # Client portal — password-gated per slug
├── orcamento/[slug]/             # Public quote view/approval page
├── labs/
│   ├── poker-pay/                # Cash game lobby, sessions, players, groups, ranking, report
│   └── fidelidade/               # Loyalty store create + [slug] card view
├── sports/ tech/                 # Division landing pages
├── studio/
│   ├── page.tsx                  # Studio landing (Hero, Produção, Último Lançamento, Portfólio, Aulas, Distribuição, CTA)
│   └── artistas/page.tsx         # Portfólio completo — grid de 15 artistas, 40+ releases com capas Spotify
└── api/
    ├── send/                     # Contact form (Resend)
    ├── poker/                    # 7 endpoints: jogadores, session, grupos, inscricoes, historico
    └── fidelidade/               # 5 endpoints: loja, ponto, codigo, cliente, resgate
```

### Data layer

- **Supabase** handles: `profiles`, `clientes`, `orcamentos`, `orcamento_itens`, `servicos`, and client portal content tables
- **Redis** handles: poker player registry, poker sessions (7-day TTL), poker groups, loyalty shops
- No migration files in repo — migrations managed via Supabase dashboard

### Auth

- `lib/auth-context.tsx` — `AuthProvider` wraps the app, exposes `useAuth()` hook
- Admin routes check session; unauthenticated users redirect to `/admin/login`
- Client portal uses plaintext password stored in `clientes.senha_acesso` — **not hashed**

---

## Key Decisions Made

1. **Single Next.js app** covers marketing site, admin, client portal, and labs — no separate services
2. **Upstash Redis** for poker/loyalty: sessions are ephemeral and real-time; no need to persist in Postgres
3. **Division system** (`tech` | `sports` | `studio`) is a first-class concept embedded in quotes, colors, routing, and config (`DIVISAO_CONFIG` in `lib/supabase.ts`)
4. **Password-protected client portal** uses a slug URL + password stored in DB (not Supabase Auth per-client)
5. **Auto-save** in CashGame: 1-second debounce writes session state to Redis on every change
6. **Quote lifecycle**: `rascunho → enviado → visualizado → aprovado | recusado | expirado`
7. **Package quotes** (`tipo: 'pacotes'`): items can be tagged to a package, one package can be `pacote_destaque`
8. **Monthly pricing** on quote items: `valor_mensal` + `descricao_mensal` for recurring service offers
9. **Labs as isolated experiments**: `/labs/*` is self-contained with its own Redis-backed API layer

---

## Repository

- **Root:** `/Users/danielsimonian/Documents/Claude/Projects/dama-digital`
- **Git remote:** not confirmed, assume GitHub
- **Branch:** `main`
- **MCP:** Supabase MCP configurado em `.mcp.json` (gitignored) com personal access token — disponível neste projeto ao reiniciar o Claude Code

### Key files to know

| File | Purpose |
|------|---------|
| `lib/supabase.ts` | All DB types, Supabase client, helper functions, DIVISAO_CONFIG |
| `lib/auth-context.tsx` | Auth state provider + useAuth hook |
| `lib/redis.ts` | Upstash Redis client |
| `lib/constants.ts` | Services list, clients list, team, social links |
| `components/labs/CashGame.tsx` | Largest file (1,257 lines) — full poker cash game manager |
| `components/BriefingForm.tsx` | 544 lines — client briefing intake form |
| `app/cliente/[slug]/page.tsx` | Client portal with Sessões / Conteúdo / Financeiro / Serviços tabs |
| `app/admin/orcamentos/[id]/page.tsx` | Full quote editor with drag-to-reorder, PDF preview |

---

## Next Steps

Based on code state and recent commits, likely priorities:

1. **Redesign do admin/portal** — próxima fase: novo visual + migração para Supabase Auth por cliente
2. **RLS completo no Supabase** — `servicos` com RLS ativo (anon SELECT + authenticated ALL); outras tabelas precisam de auditoria
3. **Vídeos reais** — placeholders ainda em produção (hero, tech, studio — sports já tem vídeo real)
4. **Capas dos artistas** — `/studio` e `/studio/artistas` usam placeholder de iniciais; Daniel vai inserindo as imagens reais (salvar em `public/images/studio/`)
5. **Configurar Resend** — `/api/send` existe mas não está configurado para envio em produção (formulários Tech terminal + Sports FichaInscricao)
6. **Password hashing** for client portal access — currently plaintext in DB
7. **Quote PDF polish** — print CSS export could use layout refinement
8. **Home page** — ✅ redesign completo entregue em 15/05/2026

---

## Open Questions

- Are there SQL migration files stored externally (e.g., in Supabase dashboard or a separate repo)?
- Is there a staging/preview environment or is everything deployed directly to production on `main`?
- Are poker player records meant to eventually migrate from Redis to Supabase?
- What is the intended scope of the Fidelidade system — personal project or client-deliverable product?
- Should the client portal use Supabase Auth per client instead of the current slug+password scheme?

---

## Rules for Claude

- **Language**: Respond in the same language the user writes in. Most codebase strings are in Portuguese (pt-BR); variable names and types are English.
- **Scope**: Make only the change asked. Do not refactor surrounding code, add comments, or "clean up" unless asked.
- **Quote generation**: Always read `skills/orcamentos/SKILL.md` before producing quote content.
- **Supabase types**: All DB types are defined in `lib/supabase.ts`. Extend there when adding new fields — do not redeclare inline.
- **Division colors**: Use `DIVISAO_CONFIG` from `lib/supabase.ts` for division-specific gradients and labels — never hardcode them.
- **Redis vs Supabase**: Poker and loyalty data lives in Redis. Client/quote/service data lives in Supabase. Don't mix.
- **New pages**: Follow the existing App Router conventions — `page.tsx` inside a folder, `layout.tsx` only when needed.
- **No mocks**: Do not mock Supabase or Redis in any code. Use the real clients.
- **No extra dependencies**: Prefer using existing packages (Lucide for icons, jsPDF for PDFs, dnd-kit for drag). Ask before adding new deps.
- **Passwords**: Do not make the plaintext password situation worse. Flag it but don't silently add more plaintext password storage.
- **Prompts para execução**: Sempre que gerar um prompt para ser copiado e colado no Claude Code ou outro terminal, envolva o conteúdo inteiro em um bloco de código markdown (``` ... ```) para facilitar a cópia.
