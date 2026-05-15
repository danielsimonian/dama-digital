# STATUS.md — DAMA Digital

**Last updated:** 2026-05-15

---

## Active Focus

Site público — home redesign concluído. Próxima fase: redesign do admin/portal.

---

## Last Session Summary (15/05/2026)

Um commit em `main`: `2d6ddfc` — redesign home + atualizações DAMA Sports

**Home:**
- Hero reescrito: headline ciclante "Seu [evento/sistema/música] merece mais.", vídeo com overlay, stats bar, 3 CTAs por divisão
- About redesenhado: layout editorial 2 colunas, retratos 3:4, stats globais (20+ anos · 3 divisões · 100+ projetos)
- Portfolio: círculos corrigidos (object-contain + overflow-hidden + aspect-square), IFBT adicionado
- Divisions: Seletiva Pan-Americano substituiu Open Tom Beach; badge "em breve" Studio removido; painel Studio com lista de 5 serviços

**DAMA Sports:**
- Seletiva Seleção Brasileira Pan-Americano IFBT (23-24/mai) substituiu Open Tom Beach; link LetzPlay atualizado
- Logo DAMA Sports no nav com inversão CSS (branco no hero via `brightness-0 invert`, preto ao rolar)
- Parceiro IFBT adicionado (home + sports)
- Círculos de logos corrigidos

---

## Notes

- No open PRs or branches; all work lands directly on `main`
- Site público completo: home ✅ sports ✅ tech ✅ studio ✅
- Pendências: vídeos reais (hero, tech, studio — sports já tem), configurar Resend no `/api/send`
- Admin/portal redesign é a próxima grande fase
