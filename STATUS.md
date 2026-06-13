# STATUS.md — DAMA Digital

**Last updated:** 2026-06-11

---

## Active Focus

Torneios DAMA Sports — páginas individuais e portfólio de eventos. Próxima fase: redesign do admin/portal.

---

## Last Session Summary (11/06/2026)

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
- Admin/portal redesign é a próxima grande fase
- Vídeo `reel.mp4` (67MB) acima do limite de 50MB recomendado pelo GitHub — considerar Vercel Blob ou comprimir mais
