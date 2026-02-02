// ============================================
// ARQUIVO: app/admin/not-found.tsx
// ============================================

import Link from 'next/link';

export default function AdminNotFound() {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white p-4">
      <div className="text-center">
        <p className="text-6xl mb-4">🔍</p>
        <h1 className="text-2xl font-bold mb-2">Página não encontrada</h1>
        <p className="text-gray-400 mb-6">
          A página que você está procurando não existe ou foi movida.
        </p>
        <Link 
          href="/admin"
          className="inline-block px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-xl transition-colors"
        >
          Voltar ao Dashboard
        </Link>
      </div>
    </div>
  );
}