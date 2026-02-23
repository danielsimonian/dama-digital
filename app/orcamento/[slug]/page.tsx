// ============================================
// ARQUIVO: app/orcamento/[slug]/page.tsx
// VERSÃO COM PRINT CSS
// ============================================

'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Download, Check, MessageCircle, ChevronDown, ChevronUp, Loader2, Lock, Heart, Sparkles, Sun, Moon } from 'lucide-react';import { supabase, formatarMoeda, formatarData, DIVISAO_CONFIG } from '@/lib/supabase';

export default function OrcamentoPublicoPage() {
  const params = useParams();
  const slug = params?.slug as string;
  
  const [orcamento, setOrcamento] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [aprovando, setAprovando] = useState(false);
  const [justApproved, setJustApproved] = useState(false);
  const [temaClaro, setTemaClaro] = useState(false);
  const viewRegistered = useRef(false);

  const whatsappNumber = '5513997434878';

  // Função para pegar config de cores baseado na categoria do item
  function getItemConfig(categoria: string) {
    if (categoria?.toLowerCase().includes('tech')) {
      return DIVISAO_CONFIG.tech;
    } else if (categoria?.toLowerCase().includes('sports')) {
      return DIVISAO_CONFIG.sports;
    } else if (categoria?.toLowerCase().includes('studio')) {
      return DIVISAO_CONFIG.studio;
    }
    // Fallback para a divisão do orçamento
    return DIVISAO_CONFIG[orcamento?.divisao as keyof typeof DIVISAO_CONFIG] || DIVISAO_CONFIG.tech;
  }

  useEffect(() => {
    if (slug) {
      fetchOrcamento();
    }
  }, [slug]);

  async function fetchOrcamento() {
    try {
      const { data: orc, error: orcError } = await supabase
        .from('orcamentos')
        .select(`
          *,
          cliente:clientes(*)
        `)
        .eq('slug', slug)
        .single();

      if (orcError) {
        console.error('Erro ao buscar orçamento:', orcError);
        setError('not_found');
        setLoading(false);
        return;
      }

      if (orc.status === 'rascunho') {
        console.log('Orçamento é rascunho, bloqueando acesso');
        setError('rascunho');
        setLoading(false);
        return;
      }

      const { data: itens } = await supabase
        .from('orcamento_itens')
        .select('*')
        .eq('orcamento_id', orc.id)
        .order('ordem');

      setOrcamento({ ...orc, itens: itens || [] });

      if (orc.status === 'enviado' && !viewRegistered.current) {
        viewRegistered.current = true;
        registrarVisualizacao(orc.id);
      }

      setLoading(false);
    } catch (err) {
      console.error('Erro ao buscar orçamento:', err);
      setError('not_found');
      setLoading(false);
    }
  }

  async function registrarVisualizacao(orcamentoId: string) {
    try {
      const { error } = await supabase
        .from('orcamentos')
        .update({ 
          status: 'visualizado',
          visualizado_em: new Date().toISOString()
        })
        .eq('id', orcamentoId);

      if (error) {
        console.error('Erro ao registrar visualização:', error);
      } else {
        console.log('Visualização registrada com sucesso');
        setOrcamento((prev: any) => prev ? { ...prev, status: 'visualizado' } : prev);
      }
    } catch (err) {
      console.error('Erro ao registrar visualização:', err);
    }
  }

  async function aprovarOrcamento() {
    setAprovando(true);
    try {
      const { error } = await supabase
        .from('orcamentos')
        .update({ 
          status: 'aprovado',
          aprovado_em: new Date().toISOString()
        })
        .eq('id', orcamento.id);

      if (error) {
        console.error('Erro ao aprovar:', error);
        alert('Erro ao aprovar orçamento. Tente novamente.');
        setAprovando(false);
        return;
      }

      console.log('Orçamento aprovado com sucesso');
      setOrcamento({ ...orcamento, status: 'aprovado' });
      setShowConfirmModal(false);
      setJustApproved(true);
    } catch (err) {
      console.error('Erro ao aprovar:', err);
      alert('Erro ao aprovar orçamento. Tente novamente.');
    } finally {
      setAprovando(false);
    }
  }

  function toggleItem(itemId: string) {
    setExpandedItems(prev => {
      if (prev.includes(itemId)) {
        return prev.filter(id => id !== itemId);
      } else {
        return [...prev, itemId];
      }
    });
  }

 // Função para imprimir/salvar PDF
function gerarPDF() {
  const temaAnterior = temaClaro;
  
  // Força tema claro para impressão
  setTemaClaro(true);
  
  // Expande todos os itens antes de imprimir
  if (orcamento?.itens) {
    const todosIds = orcamento.itens
      .filter((item: any) => item.detalhes?.length > 0)
      .map((item: any) => item.id);
    setExpandedItems(todosIds);
  }
  
  // Aguarda renderização e imprime
  setTimeout(() => {
    window.print();
    // Volta para o tema anterior após imprimir
    setTimeout(() => {
      setTemaClaro(temaAnterior);
    }, 500);
  }, 300);
}

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400">Carregando orçamento...</p>
        </div>
      </div>
    );
  }

  // Erro: Rascunho
  if (error === 'rascunho') {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white p-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock size={32} className="text-yellow-400" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Orçamento ainda não disponível</h1>
          <p className="text-gray-400 mb-6">Este orçamento ainda está sendo preparado. Em breve você receberá o link atualizado.</p>
          <Link 
            href="/"
            className="inline-block px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-xl transition-colors"
          >
            Ir para o site
          </Link>
        </div>
      </div>
    );
  }

  // Erro: Não encontrado
  if (error || !orcamento) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white p-4">
        <div className="text-center">
          <p className="text-6xl mb-4">😕</p>
          <h1 className="text-2xl font-bold mb-2">Orçamento não encontrado</h1>
          <p className="text-gray-400 mb-6">O link pode estar incorreto ou o orçamento foi removido.</p>
          <Link 
            href="/"
            className="inline-block px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-xl transition-colors"
          >
            Ir para o site
          </Link>
        </div>
      </div>
    );
  }

  const subtotal = orcamento.itens.reduce((acc: number, item: any) => 
    acc + (Number(item.valor) * Number(item.quantidade)), 0
  );
  const total = subtotal - Number(orcamento.desconto || 0);
  const isAprovado = orcamento.status === 'aprovado';
  const divisaoConfig = DIVISAO_CONFIG[orcamento.divisao as keyof typeof DIVISAO_CONFIG] || DIVISAO_CONFIG.tech;

  return (
    <>
      {/* CSS para impressão */}
 <style jsx global>{`
  @media print {
    @page {
      size: A4;
      margin: 10mm;
    }
    
    * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }
    
    html, body {
      background: white !important;
      background-color: white !important;
    }
    
    .print-container {
      background: white !important;
      color: #111 !important;
    }
    
    .no-print {
      display: none !important;
    }
    
    .print-only {
      display: block !important;
    }
    
    .print-break-avoid {
      break-inside: avoid !important;
      page-break-inside: avoid !important;
    }
    
    .print-break-before {
      break-before: page !important;
      page-break-before: always !important;
    }
    
    /* Força todos os detalhes a ficarem visíveis */
    .details-content {
      display: block !important;
      max-height: none !important;
      overflow: visible !important;
    }
    
    /* Esconde botões de expandir */
    .expand-button {
      display: none !important;
    }
  }
  
  @media screen {
    .print-only {
      display: none !important;
    }
  }
`}</style>

        <div className={`print-container min-h-screen transition-colors duration-300 ${
          temaClaro 
            ? 'bg-gray-100 text-gray-900' 
            : 'bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white'
        }`}>        
{/* Header para impressão */}
<div className="print-only px-4 py-6 border-b border-gray-300 mb-6">
  <div className="flex items-center justify-between">
    <div className="flex flex-col items-center">
      <img 
        src="/images/logo.png" 
        alt="DAMA Digital" 
        className="h-12 invert"
      />
      <span className="text-gray-500 text-[12px] -mt-3">Digital Criativa</span>
    </div>
    <div className="text-right text-xs text-gray-600">
      <p>damadigitalcriativa@gmail.com</p>
      <p>(13) 99743-4878</p>
    </div>
  </div>
</div>

        {/* Header fixo (tela) */}
        <header className={`no-print sticky top-0 z-50 backdrop-blur-md border-b transition-colors duration-300 ${
  temaClaro 
    ? 'bg-white/80 border-gray-200' 
    : 'bg-gray-900/80 border-gray-800'
}`}>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
            <Link href="/" className="flex flex-col items-center justify-center">
<img 
  src="/images/logo.png" 
  alt="DAMA Digital" 
  className={`h-12 ${temaClaro ? 'invert' : ''}`}
/>
              <div className="hidden sm:block -mt-3">
   <span className={`text-[12px] ${temaClaro ? 'text-gray-600' : 'text-gray-400'}`}>
  Digital Criativa
</span>
              </div>
            </Link>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setTemaClaro(!temaClaro)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${
                  temaClaro 
                    ? 'bg-gray-200 hover:bg-gray-300 text-gray-800' 
                    : 'bg-gray-800 hover:bg-gray-700 text-white'
                }`}
                title={temaClaro ? 'Versão escura' : 'Versão para impressão'}
              >
                {temaClaro ? <Moon size={18} /> : <Sun size={18} />}
              </button>
              <button
                onClick={gerarPDF}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${
                  temaClaro 
                    ? 'bg-gray-200 hover:bg-gray-300 text-gray-800' 
                    : 'bg-gray-800 hover:bg-gray-700 text-white'
                }`}
              >
                <Download size={18} />
                <span className="hidden sm:inline">Baixar PDF</span>
              </button>
            </div>
          </div>
        </header>

        {/* Conteúdo */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          {/* Saudação */}
          <div className="mb-10 print-break-avoid">
<p className={`mb-2 ${temaClaro ? 'text-gray-600' : 'text-gray-400'}`}>
  Olá{orcamento.cliente?.nome ? `, ${orcamento.cliente.nome}` : ''} ✨
</p>
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">
              Proposta para{' '}
              <span className={`bg-gradient-to-r ${divisaoConfig.gradiente} bg-clip-text text-transparent`}>
                {orcamento.projeto_titulo}
              </span>
            </h1>
{orcamento.projeto_descricao && (
  <p className={`text-lg ${temaClaro ? 'text-gray-600' : 'text-gray-400'}`}>{orcamento.projeto_descricao}</p>
)}
          </div>

          {/* Meta Info */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-10 print-break-avoid">
 {[
  { label: 'Número', value: orcamento.numero },
  { label: 'Data', value: formatarData(orcamento.data_emissao) },
  { label: 'Válido até', value: orcamento.validade ? formatarData(orcamento.validade) : '-' },
  { label: 'Status', value: isAprovado ? '✓ Aprovado' : 'Aguardando' }
].map((item, i) => (
  <div key={i} className={`rounded-xl p-4 border ${
    temaClaro 
      ? 'bg-gray-200/50 border-gray-300' 
      : 'bg-gray-800/50 border-gray-700/50'
  }`}>
    <p className={`text-xs uppercase tracking-wider mb-1 ${temaClaro ? 'text-gray-500' : 'text-gray-500'}`}>{item.label}</p>
    <p className="font-medium text-sm sm:text-base">{item.value}</p>
  </div>
))}
          </div>

          {/* Itens */}
          <div className="mb-10">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span className={`w-2 h-2 bg-gradient-to-r ${divisaoConfig.gradiente} rounded-full`} />
              Serviços Inclusos
            </h2>
            
            <div className="space-y-4">
              {orcamento.itens.map((item: any) => {
                const isExpanded = expandedItems.includes(item.id);
                const itemConfig = getItemConfig(item.categoria);
                
                return (
<div 
  key={item.id}
  className={`print-break-avoid rounded-2xl border overflow-hidden transition-colors ${itemConfig.borderColor} ${
    temaClaro ? 'bg-gray-200/50' : 'bg-gray-800/30'
  }`}
>
                    <div 
                      className="p-5 cursor-pointer no-print-cursor"
                      onClick={() => toggleItem(item.id)}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="flex-1">
                          <span className={`inline-block text-xs px-2 py-1 rounded-full mb-2 ${itemConfig.bgLight} ${itemConfig.textColor}`}>
                            {item.categoria}
                          </span>
                          <h3 className="font-semibold text-lg mb-1">{item.nome}</h3>
{item.descricao && (
  <p className={`text-sm ${temaClaro ? 'text-gray-600' : 'text-gray-400'}`}>{item.descricao}</p>
)}
                        </div>
                        <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2">
                          <p className="text-xl font-semibold">
                            {formatarMoeda(Number(item.valor) * Number(item.quantidade))}
                          </p>
                          {item.detalhes?.length > 0 && (
                            <button className={`expand-button text-xs flex items-center gap-1 ${itemConfig.textColor}`}>
                              {isExpanded ? 'Menos' : 'Detalhes'}
                              {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Detalhes - sempre visível no print, toggle na tela */}
{item.detalhes?.length > 0 && (
  <div className={`details-content px-5 pb-5 pt-2 border-t border-gray-800/50 ${isExpanded ? 'block' : 'hidden'}`}>
    <p className={`text-xs uppercase tracking-wider mb-3 ${temaClaro ? 'text-gray-500' : 'text-gray-500'}`}>O que está incluso:</p>
<ul className="space-y-2">
  {item.detalhes.map((detalhe: any, i: number) => (
    <li key={i} className={`flex items-center justify-between text-sm ${temaClaro ? 'text-gray-700' : 'text-gray-300'}`}>
          <span className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            {detalhe.texto || detalhe}
          </span>
{detalhe.valor && (
  <span className={temaClaro ? 'text-gray-500' : 'text-gray-400'}>{formatarMoeda(Number(detalhe.valor))}</span>
)}
        </li>
      ))}
    </ul>
    {item.detalhes.some((d: any) => d.valor) && (
  <div className={`mt-3 pt-3 border-t flex justify-between items-center ${temaClaro ? 'border-gray-300' : 'border-gray-700'}`}>
    <span className={`text-sm ${temaClaro ? 'text-gray-500' : 'text-gray-400'}`}>Subtotal</span>
        <span className="font-semibold">{formatarMoeda(item.detalhes.reduce((acc: number, d: any) => acc + (Number(d.valor) || 0), 0))}</span>
      </div>
    )}
  </div>
)}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Total */}
          <div className={`print-break-avoid rounded-2xl p-6 border ${divisaoConfig.borderColor} mb-10 ${temaClaro ? 'bg-gray-200/50' : 'bg-gray-800/40'}`}>
  <div className="flex justify-between items-center mb-3">
    <span className={temaClaro ? 'text-gray-500' : 'text-gray-400'}>Subtotal</span>
              <span>{formatarMoeda(subtotal)}</span>
            </div>
            {Number(orcamento.desconto) > 0 && (
              <div className="flex justify-between items-center mb-3 text-emerald-400">
                <span>Desconto especial</span>
                <span>- {formatarMoeda(Number(orcamento.desconto))}</span>
              </div>
            )}
<div className={`h-px my-4 ${temaClaro ? 'bg-gray-300' : 'bg-gray-700'}`} />            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">Total</span>
              <span className={`text-3xl font-bold bg-gradient-to-r ${divisaoConfig.gradiente} bg-clip-text text-transparent`}>
                {formatarMoeda(total)}
              </span>
            </div>
          </div>

          {/* Condições */}
          {(orcamento.prazo_entrega || orcamento.condicoes_pagamento || orcamento.observacoes) && (
<div className={`print-break-avoid mb-10 p-5 rounded-xl border space-y-3 ${
  temaClaro 
    ? 'bg-gray-200/50 border-gray-300' 
    : 'bg-gray-800/30 border-gray-700/50'
}`}>              {orcamento.prazo_entrega && (
                <p className="text-sm">
                  <span className={temaClaro ? 'text-gray-500' : 'text-gray-500'}>Prazo de entrega:</span>{' '}
<span className={temaClaro ? 'text-gray-700' : 'text-gray-300'}>{orcamento.prazo_entrega}</span>
                </p>
              )}
              {orcamento.condicoes_pagamento && (
                <p className="text-sm">
                  <span className={temaClaro ? 'text-gray-500' : 'text-gray-500'}>Pagamento:</span>{' '}
                  <span className={temaClaro ? 'text-gray-700' : 'text-gray-300'}>{orcamento.condicoes_pagamento}</span>
                </p>
              )}
              {orcamento.observacoes && (
                <p className="text-sm">
                  <span className={temaClaro ? 'text-gray-500' : 'text-gray-500'}>Observações:</span>{' '}
                  <span className={temaClaro ? 'text-gray-700' : 'text-gray-300'}>{orcamento.observacoes}</span>
                </p>
              )}
            </div>
          )}

          {/* Banner Aprovado */}
          {isAprovado && (
            <div className={`print-break-avoid mb-6 p-5 rounded-2xl border ${justApproved ? 'bg-emerald-500/20 border-emerald-500/50 animate-pulse' : 'bg-emerald-500/10 border-emerald-500/30'} flex items-center gap-4`}>
              <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/30">
                <Check size={28} />
              </div>
              <div>
  <p className={`font-semibold text-lg ${temaClaro ? 'text-emerald-600' : 'text-emerald-400'}`}>
    {justApproved ? '🎉 Orçamento Aprovado com Sucesso!' : 'Orçamento Aprovado!'}
  </p>
  <p className={temaClaro ? 'text-gray-700' : 'text-gray-300'}>
    {justApproved 
      ? 'Obrigado pela confiança! Nossa equipe entrará em contato em breve para alinhar os próximos passos.'
      : 'Entraremos em contato em breve para alinhar os próximos passos.'
    }
  </p>
</div>
            </div>
          )}

          {/* Ações (não aparece no print) */}
          <div className="no-print">
            {!isAprovado ? (
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => setShowConfirmModal(true)}
                  className={`flex-1 py-4 px-6 bg-gradient-to-r ${divisaoConfig.gradiente} hover:opacity-90 rounded-xl font-semibold text-lg transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg`}
                >
                  <Check size={24} />
                  Aprovar Orçamento
                </button>
                <a
href={`https://wa.me/${whatsappNumber}?text=Olá! Gostaria de falar sobre o orçamento ${orcamento.numero}`}
  target="_blank"
  rel="noopener noreferrer"
  className={`flex-1 py-4 px-6 rounded-xl font-semibold text-lg transition-all border flex items-center justify-center gap-2 ${
    temaClaro 
      ? 'bg-gray-200 hover:bg-gray-300 border-gray-300 text-gray-800' 
      : 'bg-gray-800 hover:bg-gray-700 border-gray-700 text-white'
  }`}
>
                  <MessageCircle size={24} />
                  Falar no WhatsApp
                </a>
              </div>
            ) : (
              <a
                href={`https://wa.me/${whatsappNumber}?text=Olá! Acabei de aprovar o orçamento ${orcamento.numero} e gostaria de alinhar os próximos passos.`}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-full py-4 px-6 bg-gradient-to-r ${divisaoConfig.gradiente} hover:opacity-90 rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-2 shadow-lg`}
              >
                <MessageCircle size={24} />
                Falar com a DAMA no WhatsApp
              </a>
            )}
          </div>

          {/* Mensagem otimista */}
          <div className="mt-12 text-center print-break-avoid">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Sparkles className={`w-5 h-5 ${divisaoConfig.textColor}`} />
              <span className={`text-lg font-medium ${divisaoConfig.textColor}`}>
                Conte com a gente para transformar suas ideias em realidade!
              </span>
              <Sparkles className={`w-5 h-5 ${divisaoConfig.textColor}`} />
            </div>
          </div>
        </main>

        {/* Footer (tela) */}
<footer className={`no-print border-t mt-8 ${temaClaro ? 'border-gray-300' : 'border-gray-800'}`}>          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 text-center">
            <div className="flex justify-center mb-4">
              <Link href="/" className="flex flex-col items-center justify-center">
<img 
  src="/images/logo.png" 
  alt="DAMA Digital" 
  className={`h-12 ${temaClaro ? 'invert' : ''}`}
/>
                <div className="hidden sm:block -mt-3">
                  <span className="text-gray-300 font-bold text-xl">
                    Digital Criativa
                  </span>
                </div>
                <p className="text-gray-500 text-sm mb-6">Criando experiências digitais únicas</p>
              </Link>
            </div>          
            <div className="flex flex-wrap justify-center gap-6 text-sm mb-6">
              <a 
                href={`https://wa.me/${whatsappNumber}`} 
                className={`${divisaoConfig.textColor} hover:opacity-80 flex items-center gap-2`}
              >
                <MessageCircle size={18} />
                WhatsApp
              </a>
              <a 
                href="mailto:damadigitalcriativa@gmail.com" 
                className={`${divisaoConfig.textColor} hover:opacity-80`}
              >
                ✉️ damadigitalcriativa@gmail.com
              </a>
            </div>
            
            <div className="flex items-center justify-center gap-1 text-gray-600 text-sm">
              <span>Feito com</span>
              <Heart size={14} className="text-pink-500 fill-pink-500" />
              <span>pela DAMA • {new Date().getFullYear()}</span>
            </div>
          </div>
        </footer>

{/* Footer (print) */}
<div className="print-only mt-10 pt-6 border-t border-gray-300 text-center">
  <div className="flex flex-col items-center mb-3">
    <img 
      src="/images/logo.png" 
      alt="DAMA Digital" 
      className="h-10 invert"
    />
    <span className="text-gray-500 text-[12px] -mt-3">Digital Criativa</span>
  </div>
  <div className="flex justify-center gap-4 text-xs text-gray-500 mb-2">
    <span>📱 (13) 99743-4878</span>
    <span>✉️ damadigitalcriativa@gmail.com</span>
  </div>
  <p className="text-gray-400 text-xs">
    Feito com ❤️ pela DAMA • {new Date().getFullYear()}
  </p>
</div>

        {/* Modal de Confirmação */}
        {showConfirmModal && (
          <div className="no-print fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-gray-900 rounded-2xl p-6 max-w-md w-full border border-gray-800">
              <div className="flex justify-center mb-4">
                <div className={`w-16 h-16 bg-gradient-to-br ${divisaoConfig.gradiente} rounded-2xl flex items-center justify-center`}>
                  <Check size={32} />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-center">Confirmar Aprovação</h3>
              <p className="text-gray-400 mb-6 text-center">
                Ao aprovar, você concorda com os termos e valores apresentados. 
                Nossa equipe entrará em contato para alinhar os próximos passos.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  disabled={aprovando}
                  className="flex-1 py-3 px-4 bg-gray-800 hover:bg-gray-700 rounded-xl font-medium transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={aprovarOrcamento}
                  disabled={aprovando}
                  className={`flex-1 py-3 px-4 bg-gradient-to-r ${divisaoConfig.gradiente} hover:opacity-90 rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2`}
                >
                  {aprovando ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Aprovando...
                    </>
                  ) : (
                    <>
                      <Check size={18} />
                      Confirmar
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}