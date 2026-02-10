// ============================================
// ARQUIVO: app/admin/clientes/[id]/page.tsx
// Página de detalhes do cliente com abas
// ============================================

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  Building2, 
  FileText, 
  Eye, 
  Edit, 
  Filter,
  Check,
  Clock,
  Send,
  XCircle,
  Loader2,
  Plus,
  Trash2,
  Calendar,
  DollarSign,
  Music,
  BookOpen,
  X,
  Copy,
  Link as LinkIcon,
  Video,
  FileIcon,
  PenTool,
  ExternalLink,
  Type,
  ChevronDown,
  ChevronUp,
  GripVertical
} from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { supabase, formatarMoeda, formatarData, DIVISAO_CONFIG } from '@/lib/supabase';

type Divisao = 'tech' | 'sports' | 'studio';
type Area = 'tech' | 'sports' | 'studio';
type Tab = 'sobre' | 'orcamentos' | 'sessoes' | 'aulas';
type TipoConteudo = 'video' | 'pdf' | 'exercicio' | 'link' | 'texto';

interface Cliente {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  empresa: string;
  documento: string;
  endereco: string;
  notas: string;
  areas: Area[];
  slug: string;
  senha_acesso: string;
  created_at: string;
}

interface Orcamento {
  id: string;
  numero: string;
  projeto_titulo: string;
  status: string;
  divisao: Divisao;
  desconto: number;
  data_emissao: string;
  slug: string;
  itens: { valor: number; quantidade: number }[];
}

interface Sessao {
  id: string;
  cliente_id: string;
  data: string;
  hora_inicio: string;
  hora_fim: string;
  valor_hora: number;
  observacoes: string;
  pago: boolean;
  pago_em: string | null;
}

interface Modulo {
  id: string;
  cliente_id: string;
  titulo: string;
  descricao: string;
  ordem: number;
  conteudos?: Conteudo[];
}

interface Conteudo {
  id: string;
  modulo_id: string;
  tipo: TipoConteudo;
  titulo: string;
  descricao: string;
  url: string;
  conteudo: string;
  ordem: number;
}

// Componente Sortable para Módulo
function SortableModulo({ 
  modulo, 
  index, 
  isExpanded, 
  onToggle, 
  onEdit, 
  onDelete,
  children 
}: { 
  modulo: Modulo;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  children: React.ReactNode;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: modulo.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-gray-900/50 rounded-2xl border border-gray-800 overflow-hidden"
    >
      {/* Header do Módulo */}
      <div className="p-4 flex items-center justify-between hover:bg-gray-800/50 transition-colors">
        <div className="flex items-center gap-3">
          {/* Handle para arrastar */}
          <button
            {...attributes}
            {...listeners}
            className="p-1 cursor-grab active:cursor-grabbing text-gray-500 hover:text-gray-300 touch-none"
          >
            <GripVertical size={20} />
          </button>
          
          <div 
            className="flex items-center gap-3 cursor-pointer flex-1"
            onClick={onToggle}
          >
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold">
              {index + 1}
            </div>
            <div>
              <h3 className="font-semibold text-white">{modulo.titulo}</h3>
              <p className="text-sm text-gray-400">
                {modulo.conteudos?.length || 0} conteúdo(s)
                {modulo.descricao && ` • ${modulo.descricao}`}
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={onEdit}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Edit size={16} className="text-gray-400" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 hover:bg-red-600 rounded-lg transition-colors"
          >
            <Trash2 size={16} className="text-gray-400" />
          </button>
          <button onClick={onToggle} className="p-2">
            {isExpanded ? (
              <ChevronUp size={20} className="text-gray-400" />
            ) : (
              <ChevronDown size={20} className="text-gray-400" />
            )}
          </button>
        </div>
      </div>

      {/* Conteúdos do Módulo */}
      {isExpanded && children}
    </div>
  );
}

// Componente Sortable para Conteúdo
function SortableConteudo({ 
  conteudo, 
  tipoConfig, 
  onOpenUrl, 
  onEdit, 
  onDelete 
}: { 
  conteudo: Conteudo;
  tipoConfig: { value: TipoConteudo; label: string; icon: any };
  onOpenUrl?: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: conteudo.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const TipoIcon = tipoConfig.icon;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center justify-between p-3 bg-gray-800/50 rounded-xl hover:bg-gray-800 transition-colors"
    >
      <div className="flex items-center gap-3">
        {/* Handle para arrastar */}
        <button
          {...attributes}
          {...listeners}
          className="p-1 cursor-grab active:cursor-grabbing text-gray-500 hover:text-gray-300 touch-none"
        >
          <GripVertical size={16} />
        </button>
        
        <div className="w-8 h-8 rounded-lg bg-gray-700 flex items-center justify-center">
          <TipoIcon size={16} className="text-blue-400" />
        </div>
        <div>
          <p className="font-medium text-white text-sm">{conteudo.titulo}</p>
          <p className="text-xs text-gray-500">{tipoConfig.label}</p>
        </div>
      </div>
      
      <div className="flex items-center gap-1">
        {conteudo.url && (
          <a
            href={conteudo.url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink size={14} className="text-gray-400" />
          </a>
        )}
        <button
          onClick={onEdit}
          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
        >
          <Edit size={14} className="text-gray-400" />
        </button>
        <button
          onClick={onDelete}
          className="p-2 hover:bg-red-600 rounded-lg transition-colors"
        >
          <Trash2 size={14} className="text-gray-400" />
        </button>
      </div>
    </div>
  );
}

export default function ClienteDetalhesPage() {
  const params = useParams();
  const router = useRouter();
  const clienteId = params?.id as string;

  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
  const [sessoes, setSessoes] = useState<Sessao[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('sobre');
  const [filtroOrcamento, setFiltroOrcamento] = useState<Divisao | 'todos'>('todos');
  
  // Modal de sessão
  const [showSessaoModal, setShowSessaoModal] = useState(false);
  const [editingSessao, setEditingSessao] = useState<Sessao | null>(null);
  const [savingSessao, setSavingSessao] = useState(false);
  const [sessaoForm, setSessaoForm] = useState({
    data: '',
    hora_inicio: '',
    hora_fim: '',
    valor_hora: '',
    observacoes: ''
  });

  // Filtro de mês para sessões
  const [mesSessao, setMesSessao] = useState(() => {
    const hoje = new Date();
    return `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`;
  });

  // Estados para Aulas/Módulos
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [expandedModulos, setExpandedModulos] = useState<string[]>([]);
  
  // Sensors para drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  
  // Modal de módulo
  const [showModuloModal, setShowModuloModal] = useState(false);
  const [editingModulo, setEditingModulo] = useState<Modulo | null>(null);
  const [savingModulo, setSavingModulo] = useState(false);
  const [moduloForm, setModuloForm] = useState({
    titulo: '',
    descricao: ''
  });

  // Modal de conteúdo
  const [showConteudoModal, setShowConteudoModal] = useState(false);
  const [editingConteudo, setEditingConteudo] = useState<Conteudo | null>(null);
  const [savingConteudo, setSavingConteudo] = useState(false);
  const [conteudoModuloId, setConteudoModuloId] = useState<string | null>(null);
  const [conteudoForm, setConteudoForm] = useState({
    tipo: 'video' as TipoConteudo,
    titulo: '',
    descricao: '',
    url: '',
    conteudo: ''
  });

  useEffect(() => {
    if (clienteId) {
      fetchCliente();
      fetchOrcamentos();
      fetchSessoes();
      fetchModulos();
    }
  }, [clienteId]);

  async function fetchCliente() {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .eq('id', clienteId)
        .single();

      if (error) {
        console.error('Erro ao buscar cliente:', error);
        router.push('/admin/clientes');
        return;
      }

      setCliente(data);
    } catch (err) {
      console.error('Erro:', err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchOrcamentos() {
    try {
      const { data, error } = await supabase
        .from('orcamentos')
        .select(`
          id, 
          numero, 
          projeto_titulo, 
          status, 
          divisao, 
          desconto,
          data_emissao, 
          slug,
          itens:orcamento_itens(valor, quantidade)
        `)
        .eq('cliente_id', clienteId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar orçamentos:', error);
        return;
      }

      setOrcamentos(data || []);
    } catch (err) {
      console.error('Erro:', err);
    }
  }

  async function fetchSessoes() {
    try {
      const { data, error } = await supabase
        .from('sessoes')
        .select('*')
        .eq('cliente_id', clienteId)
        .order('data', { ascending: false });

      if (error) {
        console.error('Erro ao buscar sessões:', error);
        return;
      }

      setSessoes(data || []);
    } catch (err) {
      console.error('Erro:', err);
    }
  }

  async function fetchModulos() {
    try {
      const { data, error } = await supabase
        .from('aulas_modulos')
        .select(`
          *,
          conteudos:aulas_conteudos(*)
        `)
        .eq('cliente_id', clienteId)
        .order('ordem', { ascending: true });

      if (error) {
        console.error('Erro ao buscar módulos:', error);
        return;
      }

      // Ordenar conteúdos dentro de cada módulo
      const modulosOrdenados = (data || []).map(m => ({
        ...m,
        conteudos: m.conteudos?.sort((a: Conteudo, b: Conteudo) => a.ordem - b.ordem) || []
      }));

      setModulos(modulosOrdenados);
    } catch (err) {
      console.error('Erro:', err);
    }
  }

  // Calcular valor total de um orçamento
  function calcularValorTotal(orc: Orcamento): number {
    const subtotal = orc.itens?.reduce((acc, item) => 
      acc + (Number(item.valor) * Number(item.quantidade)), 0
    ) || 0;
    return subtotal - Number(orc.desconto || 0);
  }

  // Calcular horas de uma sessão
  function calcularHoras(inicio: string, fim: string): number {
    const [hInicio, mInicio] = inicio.split(':').map(Number);
    const [hFim, mFim] = fim.split(':').map(Number);
    const minutosInicio = hInicio * 60 + mInicio;
    const minutosFim = hFim * 60 + mFim;
    return (minutosFim - minutosInicio) / 60;
  }

  // Formatar horas (ex: 2.5 -> "2h30")
  function formatarHoras(horas: number): string {
    const h = Math.floor(horas);
    const m = Math.round((horas - h) * 60);
    return m > 0 ? `${h}h${m.toString().padStart(2, '0')}` : `${h}h`;
  }

  // Obter dia da semana
  function getDiaSemana(dataStr: string): string {
    const dias = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const data = new Date(dataStr + 'T00:00:00');
    return dias[data.getDay()];
  }

  // Filtrar sessões por mês
  const sessoesFiltradas = sessoes.filter(s => s.data.startsWith(mesSessao));

  // Calcular resumo do mês
  const resumoMes = sessoesFiltradas.reduce((acc, s) => {
    const horas = calcularHoras(s.hora_inicio, s.hora_fim);
    const valor = horas * Number(s.valor_hora);
    return {
      totalHoras: acc.totalHoras + horas,
      totalValor: acc.totalValor + valor,
      valorAberto: acc.valorAberto + (s.pago ? 0 : valor),
      qtdSessoes: acc.qtdSessoes + 1
    };
  }, { totalHoras: 0, totalValor: 0, valorAberto: 0, qtdSessoes: 0 });

  // Filtrar orçamentos
  const orcamentosFiltrados = filtroOrcamento === 'todos' 
    ? orcamentos 
    : orcamentos.filter(orc => orc.divisao === filtroOrcamento);

  // Estatísticas de orçamentos
  const estatisticas = {
    tech: orcamentos.filter(o => o.divisao === 'tech').length,
    sports: orcamentos.filter(o => o.divisao === 'sports').length,
    studio: orcamentos.filter(o => o.divisao === 'studio').length,
    total: orcamentos.length,
    valorTotal: orcamentos.reduce((acc, o) => acc + calcularValorTotal(o), 0),
  };

  // Status config
  function getStatusConfig(status: string) {
    switch (status) {
      case 'aprovado':
        return { icon: Check, cor: 'text-emerald-400', bg: 'bg-emerald-500/20', label: 'Aprovado' };
      case 'visualizado':
        return { icon: Eye, cor: 'text-blue-400', bg: 'bg-blue-500/20', label: 'Visualizado' };
      case 'enviado':
        return { icon: Send, cor: 'text-purple-400', bg: 'bg-purple-500/20', label: 'Enviado' };
      case 'rejeitado':
        return { icon: XCircle, cor: 'text-red-400', bg: 'bg-red-500/20', label: 'Rejeitado' };
      default:
        return { icon: Clock, cor: 'text-gray-400', bg: 'bg-gray-500/20', label: 'Rascunho' };
    }
  }

  // Modal de sessão
  function openSessaoModal(sessao?: Sessao) {
    if (sessao) {
      setEditingSessao(sessao);
      setSessaoForm({
        data: sessao.data,
        hora_inicio: sessao.hora_inicio,
        hora_fim: sessao.hora_fim,
        valor_hora: String(sessao.valor_hora),
        observacoes: sessao.observacoes || ''
      });
    } else {
      setEditingSessao(null);
      // Pegar valor da última sessão como padrão
      const ultimaSessao = sessoes[0];
      setSessaoForm({
        data: new Date().toISOString().split('T')[0],
        hora_inicio: '',
        hora_fim: '',
        valor_hora: ultimaSessao ? String(ultimaSessao.valor_hora) : '',
        observacoes: ''
      });
    }
    setShowSessaoModal(true);
  }

  function closeSessaoModal() {
    setShowSessaoModal(false);
    setEditingSessao(null);
    setSessaoForm({
      data: '',
      hora_inicio: '',
      hora_fim: '',
      valor_hora: '',
      observacoes: ''
    });
  }

  async function handleSessaoSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSavingSessao(true);

    try {
      const sessaoData = {
        cliente_id: clienteId,
        data: sessaoForm.data,
        hora_inicio: sessaoForm.hora_inicio,
        hora_fim: sessaoForm.hora_fim,
        valor_hora: Number(sessaoForm.valor_hora),
        observacoes: sessaoForm.observacoes || null
      };

      if (editingSessao) {
        const { error } = await supabase
          .from('sessoes')
          .update(sessaoData)
          .eq('id', editingSessao.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('sessoes')
          .insert(sessaoData);

        if (error) throw error;
      }

      await fetchSessoes();
      closeSessaoModal();
    } catch (err: any) {
      alert('Erro ao salvar: ' + err.message);
    } finally {
      setSavingSessao(false);
    }
  }

  async function deleteSessao(id: string) {
    if (!confirm('Tem certeza que deseja excluir esta sessão?')) return;

    const { error } = await supabase
      .from('sessoes')
      .delete()
      .eq('id', id);

    if (error) {
      alert('Erro ao excluir: ' + error.message);
      return;
    }

    setSessoes(sessoes.filter(s => s.id !== id));
  }

  // Marcar sessão como paga/não paga
  async function togglePagamento(sessao: Sessao) {
    const novoPago = !sessao.pago;
    const pagoEm = novoPago ? new Date().toISOString() : null;

    const { error } = await supabase
      .from('sessoes')
      .update({ 
        pago: novoPago,
        pago_em: pagoEm
      })
      .eq('id', sessao.id);

    if (error) {
      alert('Erro ao atualizar: ' + error.message);
      return;
    }

    // Atualiza estado local
    setSessoes(sessoes.map(s => 
      s.id === sessao.id 
        ? { ...s, pago: novoPago, pago_em: pagoEm }
        : s
    ));
  }

  // ========== FUNÇÕES DE MÓDULOS ==========
  
  // Toggle expandir módulo
  function toggleModulo(moduloId: string) {
    setExpandedModulos(prev => 
      prev.includes(moduloId) 
        ? prev.filter(id => id !== moduloId)
        : [...prev, moduloId]
    );
  }

  // Abrir modal de módulo
  function openModuloModal(modulo?: Modulo) {
    if (modulo) {
      setEditingModulo(modulo);
      setModuloForm({
        titulo: modulo.titulo,
        descricao: modulo.descricao || ''
      });
    } else {
      setEditingModulo(null);
      setModuloForm({
        titulo: '',
        descricao: ''
      });
    }
    setShowModuloModal(true);
  }

  function closeModuloModal() {
    setShowModuloModal(false);
    setEditingModulo(null);
    setModuloForm({ titulo: '', descricao: '' });
  }

  async function handleModuloSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSavingModulo(true);

    try {
      if (editingModulo) {
        const { error } = await supabase
          .from('aulas_modulos')
          .update({
            titulo: moduloForm.titulo,
            descricao: moduloForm.descricao || null
          })
          .eq('id', editingModulo.id);

        if (error) throw error;
      } else {
        // Pegar próxima ordem
        const maxOrdem = modulos.reduce((max, m) => Math.max(max, m.ordem || 0), 0);
        
        const { error } = await supabase
          .from('aulas_modulos')
          .insert({
            cliente_id: clienteId,
            titulo: moduloForm.titulo,
            descricao: moduloForm.descricao || null,
            ordem: maxOrdem + 1
          });

        if (error) throw error;
      }

      await fetchModulos();
      closeModuloModal();
    } catch (err: any) {
      alert('Erro ao salvar: ' + err.message);
    } finally {
      setSavingModulo(false);
    }
  }

  async function deleteModulo(id: string) {
    if (!confirm('Tem certeza que deseja excluir este módulo e todos os seus conteúdos?')) return;

    const { error } = await supabase
      .from('aulas_modulos')
      .delete()
      .eq('id', id);

    if (error) {
      alert('Erro ao excluir: ' + error.message);
      return;
    }

    setModulos(modulos.filter(m => m.id !== id));
  }

  // Drag and drop para módulos
  async function handleDragEndModulos(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = modulos.findIndex((m) => m.id === active.id);
      const newIndex = modulos.findIndex((m) => m.id === over.id);

      const newModulos = arrayMove(modulos, oldIndex, newIndex);
      setModulos(newModulos);

      // Atualizar ordem no banco
      try {
        const updates = newModulos.map((m, index) => ({
          id: m.id,
          ordem: index + 1
        }));

        for (const update of updates) {
          await supabase
            .from('aulas_modulos')
            .update({ ordem: update.ordem })
            .eq('id', update.id);
        }
      } catch (err) {
        console.error('Erro ao reordenar módulos:', err);
        // Reverter em caso de erro
        fetchModulos();
      }
    }
  }

  // Drag and drop para conteúdos dentro de um módulo
  async function handleDragEndConteudos(event: DragEndEvent, moduloId: string) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const modulo = modulos.find(m => m.id === moduloId);
      if (!modulo?.conteudos) return;

      const oldIndex = modulo.conteudos.findIndex((c) => c.id === active.id);
      const newIndex = modulo.conteudos.findIndex((c) => c.id === over.id);

      const newConteudos = arrayMove(modulo.conteudos, oldIndex, newIndex);
      
      // Atualizar estado local
      setModulos(modulos.map(m => 
        m.id === moduloId 
          ? { ...m, conteudos: newConteudos }
          : m
      ));

      // Atualizar ordem no banco
      try {
        const updates = newConteudos.map((c, index) => ({
          id: c.id,
          ordem: index + 1
        }));

        for (const update of updates) {
          await supabase
            .from('aulas_conteudos')
            .update({ ordem: update.ordem })
            .eq('id', update.id);
        }
      } catch (err) {
        console.error('Erro ao reordenar conteúdos:', err);
        // Reverter em caso de erro
        fetchModulos();
      }
    }
  }

  // ========== FUNÇÕES DE CONTEÚDOS ==========

  // Config de tipos de conteúdo
  const tiposConteudo: { value: TipoConteudo; label: string; icon: any }[] = [
    { value: 'video', label: 'Vídeo', icon: Video },
    { value: 'pdf', label: 'PDF', icon: FileIcon },
    { value: 'exercicio', label: 'Exercício', icon: PenTool },
    { value: 'link', label: 'Link', icon: ExternalLink },
    { value: 'texto', label: 'Texto', icon: Type },
  ];

  function getTipoConfig(tipo: TipoConteudo) {
    return tiposConteudo.find(t => t.value === tipo) || tiposConteudo[0];
  }

  // Abrir modal de conteúdo
  function openConteudoModal(moduloId: string, conteudo?: Conteudo) {
    setConteudoModuloId(moduloId);
    if (conteudo) {
      setEditingConteudo(conteudo);
      setConteudoForm({
        tipo: conteudo.tipo,
        titulo: conteudo.titulo,
        descricao: conteudo.descricao || '',
        url: conteudo.url || '',
        conteudo: conteudo.conteudo || ''
      });
    } else {
      setEditingConteudo(null);
      setConteudoForm({
        tipo: 'video',
        titulo: '',
        descricao: '',
        url: '',
        conteudo: ''
      });
    }
    setShowConteudoModal(true);
  }

  function closeConteudoModal() {
    setShowConteudoModal(false);
    setEditingConteudo(null);
    setConteudoModuloId(null);
    setConteudoForm({
      tipo: 'video',
      titulo: '',
      descricao: '',
      url: '',
      conteudo: ''
    });
  }

  async function handleConteudoSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSavingConteudo(true);

    try {
      if (editingConteudo) {
        const { error } = await supabase
          .from('aulas_conteudos')
          .update({
            tipo: conteudoForm.tipo,
            titulo: conteudoForm.titulo,
            descricao: conteudoForm.descricao || null,
            url: conteudoForm.url || null,
            conteudo: conteudoForm.conteudo || null
          })
          .eq('id', editingConteudo.id);

        if (error) throw error;
      } else {
        // Pegar próxima ordem dentro do módulo
        const modulo = modulos.find(m => m.id === conteudoModuloId);
        const maxOrdem = modulo?.conteudos?.reduce((max, c) => Math.max(max, c.ordem || 0), 0) || 0;
        
        const { error } = await supabase
          .from('aulas_conteudos')
          .insert({
            modulo_id: conteudoModuloId,
            tipo: conteudoForm.tipo,
            titulo: conteudoForm.titulo,
            descricao: conteudoForm.descricao || null,
            url: conteudoForm.url || null,
            conteudo: conteudoForm.conteudo || null,
            ordem: maxOrdem + 1
          });

        if (error) throw error;
      }

      await fetchModulos();
      closeConteudoModal();
    } catch (err: any) {
      alert('Erro ao salvar: ' + err.message);
    } finally {
      setSavingConteudo(false);
    }
  }

  async function deleteConteudo(id: string) {
    if (!confirm('Tem certeza que deseja excluir este conteúdo?')) return;

    const { error } = await supabase
      .from('aulas_conteudos')
      .delete()
      .eq('id', id);

    if (error) {
      alert('Erro ao excluir: ' + error.message);
      return;
    }

    await fetchModulos();
  }

  // Copiar link de acesso
  function copiarLink() {
    const link = `${window.location.origin}/cliente/${cliente?.slug}`;
    navigator.clipboard.writeText(link);
    alert('Link copiado!');
  }

  // Verificar se cliente é Studio
  const isStudio = cliente?.areas?.includes('studio') || false;

  // Tabs disponíveis
  const tabs: { id: Tab; label: string; icon: any; visible: boolean }[] = [
    { id: 'sobre', label: 'Sobre', icon: User, visible: true },
    { id: 'orcamentos', label: 'Orçamentos', icon: FileText, visible: true },
    { id: 'sessoes', label: 'Sessões', icon: Music, visible: isStudio },
    { id: 'aulas', label: 'Aulas', icon: BookOpen, visible: isStudio },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    );
  }

  if (!cliente) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white">
        <p>Cliente não encontrado</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/admin/clientes"
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <ArrowLeft size={20} />
              </Link>
              <div>
                <h1 className="text-xl font-bold">{cliente.nome}</h1>
                <div className="flex items-center gap-2 mt-1">
                  {cliente.areas?.map((area) => {
                    const config = DIVISAO_CONFIG[area];
                    return (
                      <span
                        key={area}
                        className={`text-xs px-2 py-0.5 rounded-full ${config.bgLight} ${config.textColor}`}
                      >
                        {config.nome}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Link de acesso */}
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-gray-800 rounded-lg text-sm">
                <LinkIcon size={14} className="text-gray-400" />
                <span className="text-gray-400">/cliente/{cliente.slug}</span>
                <span className="text-gray-600">•</span>
                <span className="text-gray-400">Senha:</span>
                <code className="text-purple-400">{cliente.senha_acesso}</code>
              </div>
              <button
                onClick={copiarLink}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                title="Copiar link"
              >
                <Copy size={18} className="text-gray-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <nav className="flex gap-1 -mb-px">
            {tabs.filter(t => t.visible).map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                    isActive
                      ? 'border-purple-500 text-purple-400'
                      : 'border-transparent text-gray-400 hover:text-white'
                  }`}
                >
                  <Icon size={18} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Tab: Sobre */}
        {activeTab === 'sobre' && (
          <div className="space-y-6">
            <div className="bg-gray-900/50 rounded-2xl border border-gray-800 p-6">
              <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <User size={20} className="text-purple-400" />
                Informações do Cliente
              </h2>
              
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-gray-800/50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                    <User size={14} />
                    Nome
                  </div>
                  <p className="font-medium">{cliente.nome}</p>
                </div>
                
                <div className="bg-gray-800/50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                    <Mail size={14} />
                    Email
                  </div>
                  <p className="font-medium truncate">{cliente.email || '-'}</p>
                </div>
                
                <div className="bg-gray-800/50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                    <Phone size={14} />
                    Telefone
                  </div>
                  <p className="font-medium">{cliente.telefone || '-'}</p>
                </div>
                
                <div className="bg-gray-800/50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                    <Building2 size={14} />
                    Empresa
                  </div>
                  <p className="font-medium">{cliente.empresa || '-'}</p>
                </div>

                <div className="bg-gray-800/50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                    <FileText size={14} />
                    CPF/CNPJ
                  </div>
                  <p className="font-medium">{cliente.documento || '-'}</p>
                </div>

                <div className="bg-gray-800/50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                    <Calendar size={14} />
                    Cliente desde
                  </div>
                  <p className="font-medium">{formatarData(cliente.created_at)}</p>
                </div>
              </div>

              {cliente.endereco && (
                <div className="mt-4 bg-gray-800/50 rounded-xl p-4">
                  <p className="text-gray-400 text-sm mb-1">Endereço</p>
                  <p className="font-medium">{cliente.endereco}</p>
                </div>
              )}

              {cliente.notas && (
                <div className="mt-4 bg-gray-800/50 rounded-xl p-4">
                  <p className="text-gray-400 text-sm mb-1">Observações</p>
                  <p className="text-gray-300">{cliente.notas}</p>
                </div>
              )}
            </div>

            {/* Link de Acesso */}
            <div className="bg-gray-900/50 rounded-2xl border border-gray-800 p-6">
              <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <LinkIcon size={20} className="text-purple-400" />
                Acesso do Cliente
              </h2>
              
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-gray-800/50 rounded-xl p-4">
                  <p className="text-gray-400 text-sm mb-2">Link de Acesso</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 px-3 py-2 bg-gray-900 rounded-lg text-purple-400 text-sm truncate">
                      {typeof window !== 'undefined' ? window.location.origin : ''}/cliente/{cliente.slug}
                    </code>
                    <button
                      onClick={copiarLink}
                      className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                    >
                      <Copy size={16} />
                    </button>
                  </div>
                </div>
                
                <div className="bg-gray-800/50 rounded-xl p-4">
                  <p className="text-gray-400 text-sm mb-2">Senha de Acesso</p>
                  <code className="px-3 py-2 bg-gray-900 rounded-lg text-purple-400 text-lg font-mono">
                    {cliente.senha_acesso}
                  </code>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Orçamentos */}
        {activeTab === 'orcamentos' && (
          <div className="space-y-6">
            {/* Estatísticas */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-4">
                <p className="text-sm text-gray-400 mb-1">Total</p>
                <p className="text-2xl font-bold">{estatisticas.total}</p>
              </div>
              
              <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-4">
                <p className="text-sm text-gray-400 mb-1">Valor Total</p>
                <p className="text-2xl font-bold text-purple-400">
                  {formatarMoeda(estatisticas.valorTotal)}
                </p>
              </div>
              
              <div className="bg-gray-900/50 rounded-xl border border-purple-500/30 p-4">
                <p className="text-sm text-purple-400 mb-1">DAMA Tech</p>
                <p className="text-2xl font-bold">{estatisticas.tech}</p>
              </div>
              
              <div className="bg-gray-900/50 rounded-xl border border-orange-500/30 p-4">
                <p className="text-sm text-orange-400 mb-1">DAMA Sports</p>
                <p className="text-2xl font-bold">{estatisticas.sports}</p>
              </div>
              
              <div className="bg-gray-900/50 rounded-xl border border-blue-500/30 p-4">
                <p className="text-sm text-blue-400 mb-1">DAMA Studio</p>
                <p className="text-2xl font-bold">{estatisticas.studio}</p>
              </div>
            </div>

            {/* Lista de Orçamentos */}
            <div className="bg-gray-900/50 rounded-2xl border border-gray-800 p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <h2 className="font-semibold text-lg flex items-center gap-2">
                  <FileText size={20} className="text-purple-400" />
                  Orçamentos ({orcamentosFiltrados.length})
                </h2>
                
                {/* Filtro */}
                <div className="flex items-center gap-2">
                  <Filter size={16} className="text-gray-400" />
                  <div className="flex gap-2">
                    <button
                      onClick={() => setFiltroOrcamento('todos')}
                      className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                        filtroOrcamento === 'todos'
                          ? 'bg-gray-700 text-white'
                          : 'text-gray-400 hover:bg-gray-800'
                      }`}
                    >
                      Todos
                    </button>
                    {(['tech', 'sports', 'studio'] as const).map((div) => {
                      const config = DIVISAO_CONFIG[div];
                      return (
                        <button
                          key={div}
                          onClick={() => setFiltroOrcamento(div)}
                          className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                            filtroOrcamento === div
                              ? `${config.bgLight} ${config.textColor}`
                              : 'text-gray-400 hover:bg-gray-800'
                          }`}
                        >
                          {config.nome.replace('DAMA ', '')}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {orcamentosFiltrados.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <FileText size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Nenhum orçamento encontrado</p>
                  <Link
                    href={`/admin/orcamentos/novo?cliente=${clienteId}`}
                    className="inline-block mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg transition-colors"
                  >
                    Criar Orçamento
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {orcamentosFiltrados.map((orc) => {
                    const statusConfig = getStatusConfig(orc.status);
                    const StatusIcon = statusConfig.icon;
                    const divisaoConfig = DIVISAO_CONFIG[orc.divisao] || DIVISAO_CONFIG.tech;

                    return (
                      <div
                        key={orc.id}
                        className={`bg-gray-800/30 rounded-xl border ${divisaoConfig.borderColor} p-4 hover:bg-gray-800/50 transition-colors`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-xs px-2 py-0.5 rounded-full ${divisaoConfig.bgLight} ${divisaoConfig.textColor}`}>
                                {divisaoConfig.nome}
                              </span>
                              <span className={`text-xs px-2 py-0.5 rounded-full flex items-center gap-1 ${statusConfig.bg} ${statusConfig.cor}`}>
                                <StatusIcon size={12} />
                                {statusConfig.label}
                              </span>
                            </div>
                            <h3 className="font-semibold">{orc.projeto_titulo}</h3>
                            <p className="text-sm text-gray-400">
                              #{orc.numero} • {formatarData(orc.data_emissao)}
                            </p>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <p className={`text-xl font-bold ${divisaoConfig.textColor}`}>
                              {formatarMoeda(calcularValorTotal(orc))}
                            </p>
                            
                            <div className="flex gap-2">
                              <Link
                                href={`/orcamento/${orc.slug}`}
                                target="_blank"
                                className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                                title="Ver página pública"
                              >
                                <Eye size={16} />
                              </Link>
                              <Link
                                href={`/admin/orcamentos/${orc.id}`}
                                className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                                title="Editar"
                              >
                                <Edit size={16} />
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab: Sessões */}
        {activeTab === 'sessoes' && (
          <div className="space-y-6">
            {/* Header + Filtro de Mês */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <input
                  type="month"
                  value={mesSessao}
                  onChange={(e) => setMesSessao(e.target.value)}
                  className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-purple-500 text-white"
                />
              </div>
              
              <button
                onClick={() => openSessaoModal()}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 rounded-xl font-medium transition-all"
              >
                <Plus size={20} />
                Nova Sessão
              </button>
            </div>

            {/* Resumo do Mês */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-gray-900/50 rounded-xl border border-blue-500/30 p-4">
                <p className="text-sm text-blue-400 mb-1">Sessões no Mês</p>
                <p className="text-2xl font-bold">{resumoMes.qtdSessoes}</p>
              </div>
              
              <div className="bg-gray-900/50 rounded-xl border border-blue-500/30 p-4">
                <p className="text-sm text-blue-400 mb-1">Total de Horas</p>
                <p className="text-2xl font-bold">{formatarHoras(resumoMes.totalHoras)}</p>
              </div>
              
              <div className="bg-gray-900/50 rounded-xl border border-blue-500/30 p-4">
                <p className="text-sm text-blue-400 mb-1">Valor Total</p>
                <p className="text-2xl font-bold text-blue-400">{formatarMoeda(resumoMes.totalValor)}</p>
              </div>

              <div className={`bg-gray-900/50 rounded-xl border p-4 ${resumoMes.valorAberto > 0 ? 'border-yellow-500/30' : 'border-emerald-500/30'}`}>
                <p className={`text-sm mb-1 ${resumoMes.valorAberto > 0 ? 'text-yellow-400' : 'text-emerald-400'}`}>
                  Valor em Aberto
                </p>
                <p className={`text-2xl font-bold ${resumoMes.valorAberto > 0 ? 'text-yellow-400' : 'text-emerald-400'}`}>
                  {formatarMoeda(resumoMes.valorAberto)}
                </p>
              </div>
            </div>

            {/* Lista de Sessões */}
            <div className="bg-gray-900/50 rounded-2xl border border-gray-800 p-6">
              <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Music size={20} className="text-blue-400" />
                Sessões ({sessoesFiltradas.length})
              </h2>

              {sessoesFiltradas.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <Music size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Nenhuma sessão neste mês</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {sessoesFiltradas.map((sessao) => {
                    const horas = calcularHoras(sessao.hora_inicio, sessao.hora_fim);
                    const valor = horas * Number(sessao.valor_hora);
                    
                    return (
                      <div
                        key={sessao.id}
                        className={`bg-gray-800/30 rounded-xl border p-4 hover:bg-gray-800/50 transition-colors ${
                          sessao.pago ? 'border-emerald-500/30' : 'border-gray-700'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-start gap-3">
                            {/* Checkbox de Pagamento */}
                            <button
                              onClick={() => togglePagamento(sessao)}
                              className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors flex-shrink-0 ${
                                sessao.pago 
                                  ? 'bg-emerald-500 border-emerald-500' 
                                  : 'border-gray-600 hover:border-gray-500'
                              }`}
                              title={sessao.pago ? `Pago em ${formatarData(sessao.pago_em!)}` : 'Marcar como pago'}
                            >
                              {sessao.pago && <Check size={14} className="text-white" />}
                            </button>

                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-1">
                                <span className={`font-semibold ${sessao.pago ? 'text-gray-400' : 'text-white'}`}>
                                  {formatarData(sessao.data)}
                                </span>
                                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-700 text-gray-300">
                                  {getDiaSemana(sessao.data)}
                                </span>
                                {sessao.pago && (
                                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                                    Pago
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-4 text-sm text-gray-400">
                                <span className="flex items-center gap-1">
                                  <Clock size={14} />
                                  {sessao.hora_inicio} - {sessao.hora_fim}
                                </span>
                                <span className="flex items-center gap-1">
                                  <DollarSign size={14} />
                                  {formatarMoeda(Number(sessao.valor_hora))}/h
                                </span>
                              </div>
                              {sessao.observacoes && (
                                <p className="text-sm text-gray-500 mt-1">{sessao.observacoes}</p>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-sm text-gray-400">{formatarHoras(horas)}</p>
                              <p className={`text-xl font-bold ${sessao.pago ? 'text-gray-500' : 'text-blue-400'}`}>
                                {formatarMoeda(valor)}
                              </p>
                            </div>
                            
                            <div className="flex gap-2">
                              <button
                                onClick={() => openSessaoModal(sessao)}
                                className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={() => deleteSessao(sessao.id)}
                                className="p-2 bg-gray-700 hover:bg-red-600 rounded-lg transition-colors"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab: Aulas */}
        {activeTab === 'aulas' && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">Módulos de Aulas</h2>
                <p className="text-gray-400 text-sm">{modulos.length} módulo(s) • {modulos.reduce((acc, m) => acc + (m.conteudos?.length || 0), 0)} conteúdo(s)</p>
              </div>
              
              <button
                onClick={() => openModuloModal()}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 rounded-xl font-medium transition-all"
              >
                <Plus size={20} />
                Novo Módulo
              </button>
            </div>

            {/* Lista de Módulos */}
            {modulos.length === 0 ? (
              <div className="bg-gray-900/50 rounded-2xl border border-gray-800 p-12 text-center">
                <BookOpen size={48} className="mx-auto mb-4 text-gray-600" />
                <p className="text-gray-400 mb-4">Nenhum módulo criado ainda</p>
                <button
                  onClick={() => openModuloModal()}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm transition-colors"
                >
                  <Plus size={16} />
                  Criar primeiro módulo
                </button>
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEndModulos}
              >
                <SortableContext
                  items={modulos.map(m => m.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-4">
                    {modulos.map((modulo, index) => {
                      const isExpanded = expandedModulos.includes(modulo.id);
                      
                      return (
                        <SortableModulo
                          key={modulo.id}
                          modulo={modulo}
                          index={index}
                          isExpanded={isExpanded}
                          onToggle={() => toggleModulo(modulo.id)}
                          onEdit={() => openModuloModal(modulo)}
                          onDelete={() => deleteModulo(modulo.id)}
                        >
                          {/* Conteúdos do Módulo */}
                          <div className="border-t border-gray-800 p-4 bg-gray-800/20">
                            {modulo.conteudos && modulo.conteudos.length > 0 ? (
                              <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragEnd={(event) => handleDragEndConteudos(event, modulo.id)}
                              >
                                <SortableContext
                                  items={modulo.conteudos.map(c => c.id)}
                                  strategy={verticalListSortingStrategy}
                                >
                                  <div className="space-y-2">
                                    {modulo.conteudos.map((conteudo) => {
                                      const tipoConfig = getTipoConfig(conteudo.tipo);
                                      
                                      return (
                                        <SortableConteudo
                                          key={conteudo.id}
                                          conteudo={conteudo}
                                          tipoConfig={tipoConfig}
                                          onEdit={() => openConteudoModal(modulo.id, conteudo)}
                                          onDelete={() => deleteConteudo(conteudo.id)}
                                        />
                                      );
                                    })}
                                  </div>
                                </SortableContext>
                              </DndContext>
                            ) : (
                              <p className="text-gray-500 text-sm text-center py-4">
                                Nenhum conteúdo neste módulo
                              </p>
                            )}
                            
                            {/* Botão adicionar conteúdo */}
                            <button
                              onClick={() => openConteudoModal(modulo.id)}
                              className="mt-3 w-full py-2 border border-dashed border-gray-700 rounded-xl text-gray-400 hover:border-blue-500 hover:text-blue-400 transition-colors flex items-center justify-center gap-2 text-sm"
                            >
                              <Plus size={16} />
                              Adicionar Conteúdo
                            </button>
                          </div>
                        </SortableModulo>
                      );
                    })}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>
        )}
      </main>

      {/* Modal de Sessão */}
      {showSessaoModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-md border border-gray-800">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">
                {editingSessao ? 'Editar Sessão' : 'Nova Sessão'}
              </h3>
              <button
                onClick={closeSessaoModal}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSessaoSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Data *</label>
                <input
                  type="date"
                  value={sessaoForm.data}
                  onChange={(e) => setSessaoForm({ ...sessaoForm, data: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-blue-500 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Hora Início *</label>
                  <input
                    type="time"
                    value={sessaoForm.hora_inicio}
                    onChange={(e) => setSessaoForm({ ...sessaoForm, hora_inicio: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-blue-500 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Hora Fim *</label>
                  <input
                    type="time"
                    value={sessaoForm.hora_fim}
                    onChange={(e) => setSessaoForm({ ...sessaoForm, hora_fim: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-blue-500 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Valor por Hora *</label>
                <input
                  type="number"
                  step="0.01"
                  value={sessaoForm.valor_hora}
                  onChange={(e) => setSessaoForm({ ...sessaoForm, valor_hora: e.target.value })}
                  placeholder="100.00"
                  required
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-blue-500 text-white"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Observações</label>
                <textarea
                  value={sessaoForm.observacoes}
                  onChange={(e) => setSessaoForm({ ...sessaoForm, observacoes: e.target.value })}
                  placeholder="Anotações sobre a sessão..."
                  rows={2}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-blue-500 text-white"
                />
              </div>

              {/* Preview do cálculo */}
              {sessaoForm.hora_inicio && sessaoForm.hora_fim && sessaoForm.valor_hora && (
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Duração:</span>
                    <span className="text-white font-medium">
                      {formatarHoras(calcularHoras(sessaoForm.hora_inicio, sessaoForm.hora_fim))}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-gray-400">Valor Total:</span>
                    <span className="text-blue-400 font-bold">
                      {formatarMoeda(
                        calcularHoras(sessaoForm.hora_inicio, sessaoForm.hora_fim) * 
                        Number(sessaoForm.valor_hora)
                      )}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeSessaoModal}
                  className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingSessao}
                  className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {savingSessao ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    'Salvar'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Módulo */}
      {showModuloModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-md border border-gray-800">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">
                {editingModulo ? 'Editar Módulo' : 'Novo Módulo'}
              </h3>
              <button
                onClick={closeModuloModal}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleModuloSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Título do Módulo *</label>
                <input
                  type="text"
                  value={moduloForm.titulo}
                  onChange={(e) => setModuloForm({ ...moduloForm, titulo: e.target.value })}
                  placeholder="Ex: Módulo 1 - Fundamentos"
                  required
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-blue-500 text-white"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Descrição</label>
                <textarea
                  value={moduloForm.descricao}
                  onChange={(e) => setModuloForm({ ...moduloForm, descricao: e.target.value })}
                  placeholder="Descrição do módulo..."
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-blue-500 text-white"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModuloModal}
                  className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingModulo}
                  className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {savingModulo ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    'Salvar'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Conteúdo */}
      {showConteudoModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-lg border border-gray-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">
                {editingConteudo ? 'Editar Conteúdo' : 'Novo Conteúdo'}
              </h3>
              <button
                onClick={closeConteudoModal}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleConteudoSubmit} className="space-y-4">
              {/* Tipo de Conteúdo */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Tipo *</label>
                <div className="grid grid-cols-5 gap-2">
                  {tiposConteudo.map((tipo) => {
                    const TipoIcon = tipo.icon;
                    const isSelected = conteudoForm.tipo === tipo.value;
                    return (
                      <button
                        key={tipo.value}
                        type="button"
                        onClick={() => setConteudoForm({ ...conteudoForm, tipo: tipo.value })}
                        className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all ${
                          isSelected
                            ? 'border-blue-500 bg-blue-500/20 text-blue-400'
                            : 'border-gray-700 hover:border-gray-600 text-gray-400'
                        }`}
                      >
                        <TipoIcon size={20} />
                        <span className="text-xs">{tipo.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Título *</label>
                <input
                  type="text"
                  value={conteudoForm.titulo}
                  onChange={(e) => setConteudoForm({ ...conteudoForm, titulo: e.target.value })}
                  placeholder="Título do conteúdo"
                  required
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-blue-500 text-white"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Descrição</label>
                <textarea
                  value={conteudoForm.descricao}
                  onChange={(e) => setConteudoForm({ ...conteudoForm, descricao: e.target.value })}
                  placeholder="Descrição do conteúdo..."
                  rows={2}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-blue-500 text-white"
                />
              </div>

              {/* URL - para vídeo, pdf, link */}
              {['video', 'pdf', 'link'].includes(conteudoForm.tipo) && (
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    URL {conteudoForm.tipo === 'video' ? '(YouTube, Vimeo, etc.)' : conteudoForm.tipo === 'pdf' ? '(Google Drive, Dropbox, etc.)' : ''}
                  </label>
                  <input
                    type="url"
                    value={conteudoForm.url}
                    onChange={(e) => setConteudoForm({ ...conteudoForm, url: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-blue-500 text-white"
                  />
                </div>
              )}

              {/* Conteúdo texto - para exercício e texto */}
              {['exercicio', 'texto'].includes(conteudoForm.tipo) && (
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    {conteudoForm.tipo === 'exercicio' ? 'Instruções do Exercício' : 'Conteúdo'}
                  </label>
                  <textarea
                    value={conteudoForm.conteudo}
                    onChange={(e) => setConteudoForm({ ...conteudoForm, conteudo: e.target.value })}
                    placeholder={conteudoForm.tipo === 'exercicio' ? 'Descreva o exercício...' : 'Digite o conteúdo...'}
                    rows={5}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-blue-500 text-white"
                  />
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeConteudoModal}
                  className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingConteudo}
                  className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {savingConteudo ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    'Salvar'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}