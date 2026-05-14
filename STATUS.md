# STATUS.md — DAMA Digital

**Last updated:** 2026-05-13

---

## Active Focus

Site público DAMA Studio — portfólio de artistas completo com capas reais e links Spotify.

---

## Last Session Summary (13/05/2026)

Quatro commits em `main`:

1. **Limpeza do repo** (`08df077`) — removidos `poker-pay-app/`, `poker-control-*.md`, `.claude/worktrees/`; `.claude/launch.json` atualizado; `.gitignore` com `.claude/worktrees/`
2. **Portfólio Studio + DAMA Tech** (`72f3f60`, 43 arquivos) — portfólio `/studio/artistas` completo: 15 artistas, 40+ releases, capas reais do Spotify, cards clicáveis → Spotify; `/studio` hero e portfólio atualizados; `/tech` hero com Maxwell e Escola Simonian, novo card Escola Simonian
3. **Fix texto** (`036232c`) — "Ver todos os lançamentos" no portfólio preview da Studio

---

## Notes

- No open PRs or branches; all work lands directly on `main`
- `/studio/artistas`: capas faltando para Fernando Silveyra (não encontrado link Spotify via fetch) — já tem link mas a capa do Confiança foi atualizada via download direto
- Pendências do site público: vídeos reais (hero, tech, studio), configurar Resend no `/api/send`
- Admin/portal redesign continua sendo a próxima grande fase
