---
name: Redesign — Almanaque Brasileiro
description: Direção visual aprovada, design system implementado para a repaginação do site DAMA Digital
type: project
---

Redesign do site DAMA Digital em andamento, branch `redesign/publico`.
Proposta aprovada: **Almanaque Brasileiro** — estética editorial literária, light mode.

**Why:** Site anterior era dark mode com clichês de agência (gradiente roxo/rosa, grid de cards idênticos, ícone arredondado sobre cada heading, copy vago).

**How to apply:** Seguir rigorosamente o design system abaixo ao implementar qualquer componente.

## Design System (Passo 3 — concluído)

### Fontes (carregadas via next/font no layout.tsx)
- **Display:** Epilogue — variável, peso 100–900, normal + italic. CSS var: `--font-epilogue` → `var(--font-display)`. Escolhida pela textura óptica nas hastes em Black — presença editorial sem ser mecânica.
- **Corpo + UI:** Chivo — variável, peso 100–700, normal + italic. CSS var: `--font-chivo` → `var(--font-body)` e `var(--font-ui)`. Origem argentina (Hector Gretschel), letterforms com qualidade humanista. Corpo em 300–400, UI em 500–600.
- Classes utilitárias: `.font-display`, `.font-body`, `.font-ui`
- **Nota:** Troca de serifadas (Fraunces/Source Serif 4) para sans-serifs aprovada pelo Daniel em abril/2026. Combinação B escolhida entre duas propostas.

### Paleta OKLCH

| Contexto | Fundo | Acento | Descrição |
|---|---|---|---|
| HOME | `oklch(97% 0.006 58)` | `oklch(46% 0.04 58)` | Creme quente, sépia |
| Tech | `oklch(97% 0.004 265)` | `oklch(36% 0.19 262)` | Branco frio, índigo profundo |
| Sports | `oklch(97% 0.009 52)` | `oklch(50% 0.20 33)` | Creme quente, tijolo queimado |
| Studio | `oklch(96% 0.012 88)` | `oklch(40% 0.13 148)` | Marfim, verde musgo |

### Tokens semânticos (sobrescritos por tema)
- `--color-background`, `--color-foreground`, `--color-foreground-muted`
- `--color-accent`, `--color-accent-subtle`
- `--color-border`, `--color-border-strong`

### Temas de divisão
Aplicar como classe wrapper: `.theme-tech`, `.theme-sports`, `.theme-studio`
Todos os tokens semânticos são sobrescritos automaticamente.

### Escala tipográfica
Fluid com `clamp()` de `--text-sm` até `--text-display` (6–11rem).

### Frases âncora aprovadas
- HOME: *"Criatividade com mais de uma saída."*
- Tech: *"Software que cabe no seu dia a dia."*
- Sports: *"Do sorteio ao pódio, a gente cuida."*
- Studio: *"Sua música soa do jeito que merece."*

### Logos
- Fundo claro: `/images/logo-preto.png`
- Fundo escuro: `/images/logo.png`
- Header sempre usa `logo-preto.png` no redesign light.

### Anti-padrões confirmados (nunca usar)
- Gradiente roxo/azul, cyan em fundo escuro, neon accents
- Grid de cards idênticos (ícone + heading + texto)
- Dark mode como predominante
- Inter, Roboto, Arial, Open Sans, Space Grotesk
- Texto centralizado em massa, adjetivos vazios no copy
