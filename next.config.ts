import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // o /admin antigo foi substituído pelo /painel; só o editor de orçamentos com pacotes continua em /admin/orcamentos/[id]
  async redirects() {
    return [
      { source: "/admin", destination: "/painel", permanent: false },
      { source: "/admin/login", destination: "/painel/entrar", permanent: false },
      { source: "/admin/configuracoes", destination: "/painel", permanent: false },
      { source: "/admin/clientes", destination: "/painel/pessoas", permanent: false },
      { source: "/admin/clientes/:id", destination: "/painel/pessoas?id=:id", permanent: false },
      { source: "/admin/orcamentos", destination: "/painel/orcamentos", permanent: false },
    ];
  },
};

export default nextConfig;
