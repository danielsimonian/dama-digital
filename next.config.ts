import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // o /admin antigo foi substituído pelo /painel; os endereços antigos continuam levando para lá
  async redirects() {
    return [
      { source: "/admin", destination: "/painel", permanent: false },
      { source: "/admin/login", destination: "/painel/entrar", permanent: false },
      { source: "/admin/configuracoes", destination: "/painel", permanent: false },
      { source: "/admin/clientes", destination: "/painel/pessoas", permanent: false },
      { source: "/admin/clientes/:id", destination: "/painel/pessoas?id=:id", permanent: false },
      { source: "/admin/orcamentos", destination: "/painel/orcamentos", permanent: false },
      { source: "/admin/orcamentos/:id", destination: "/painel/orcamentos/:id", permanent: false },
    ];
  },
};

export default nextConfig;
