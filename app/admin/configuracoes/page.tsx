// ============================================
// ARQUIVO: app/admin/configuracoes/page.tsx
// ============================================

'use client';

import { Construction } from 'lucide-react';

export default function ConfiguracoesPage() {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center">
      <div className="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center mb-6">
        <Construction className="w-8 h-8 text-purple-400" />
      </div>
      <h1 className="text-2xl font-bold mb-2">Configurações</h1>
      <p className="text-gray-400 max-w-md">
        Em breve você poderá personalizar as configurações do sistema por aqui.
      </p>
    </div>
  );
}