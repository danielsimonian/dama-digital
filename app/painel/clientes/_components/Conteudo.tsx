'use client';

import { useEffect, useState } from 'react';
import { ArrowDown, ArrowUp, ExternalLink, File, Pencil, PenTool, Plus, Type, Video, type LucideIcon } from 'lucide-react';
import { supabase, type AulaConteudo, type AulaModulo, type TipoConteudo } from '@/lib/supabase';
import { Button } from '@/components/ds/primitives';
import { Modal, useToast } from '@/components/ds/interactive';
import { SelectField, TextArea, TextField } from '@/components/ds/fields';

const TIPOS: { value: TipoConteudo; label: string; icon: LucideIcon }[] = [
  { value: 'video', label: 'Vídeo', icon: Video },
  { value: 'pdf', label: 'PDF', icon: File },
  { value: 'exercicio', label: 'Exercício', icon: PenTool },
  { value: 'link', label: 'Link', icon: ExternalLink },
  { value: 'texto', label: 'Texto', icon: Type },
];
const COM_URL: TipoConteudo[] = ['video', 'pdf', 'link'];

type Edicao =
  | { tipo: 'modulo'; modulo: AulaModulo | null }
  | { tipo: 'conteudo'; moduloId: string; conteudo: AulaConteudo | null };

/** Conteúdo das aulas que aparece na aba "Conteúdo" do portal do cliente. */
export function ConteudoDaPessoa({ clienteId }: { clienteId: string }) {
  const toast = useToast();
  const [carregados, setCarregados] = useState<{ id: string; modulos: AulaModulo[] } | null>(null);
  const [versao, setVersao] = useState(0);
  const [edicao, setEdicao] = useState<Edicao | null>(null);
  const modulos = carregados?.id === clienteId ? carregados.modulos : null;

  useEffect(() => {
    supabase
      .from('aulas_modulos')
      .select('*, conteudos:aulas_conteudos(*)')
      .eq('cliente_id', clienteId)
      .order('ordem')
      .then(({ data }) => {
        const lista = ((data as AulaModulo[] | null) ?? []).map((m) => ({
          ...m,
          conteudos: [...(m.conteudos ?? [])].sort((a, b) => a.ordem - b.ordem),
        }));
        setCarregados({ id: clienteId, modulos: lista });
      });
  }, [clienteId, versao]);

  const recarregar = () => setVersao((v) => v + 1);

  const mover = async (tabela: 'aulas_modulos' | 'aulas_conteudos', lista: { id: string }[], de: number, para: number) => {
    if (para < 0 || para >= lista.length) return;
    const nova = [...lista];
    const [item] = nova.splice(de, 1);
    nova.splice(para, 0, item);
    const res = await Promise.all(nova.map((x, i) => supabase.from(tabela).update({ ordem: i + 1 }).eq('id', x.id)));
    const erro = res.find((r) => r.error)?.error;
    if (erro) toast({ tone: 'danger', title: 'Não foi possível reordenar', description: erro.message });
    recarregar();
  };

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="ds-annot uppercase">Conteúdo das aulas</p>
        <button type="button" onClick={() => setEdicao({ tipo: 'modulo', modulo: null })} className="ds-annot hover:text-ds-fg">
          + módulo
        </button>
      </div>
      {modulos === null ? (
        <p className="ds-annot">carregando…</p>
      ) : modulos.length === 0 ? (
        <p className="text-sm text-ds-subtle">Nenhum módulo ainda. O que for criado aqui aparece na aba Conteúdo do portal.</p>
      ) : (
        <ol className="space-y-3">
          {modulos.map((m, i) => (
            <li key={m.id} className="rounded-ds-sm border border-ds-line">
              <div className="flex items-start gap-2 border-b border-ds-line px-3 py-2">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ds-fg">
                    <span className="ds-annot mr-1.5">{String(i + 1).padStart(2, '0')}</span>
                    {m.titulo}
                  </p>
                  {m.descricao && <p className="mt-0.5 line-clamp-2 text-xs text-ds-subtle">{m.descricao}</p>}
                </div>
                <Ordem
                  primeiro={i === 0}
                  ultimo={i === modulos.length - 1}
                  onSubir={() => mover('aulas_modulos', modulos, i, i - 1)}
                  onDescer={() => mover('aulas_modulos', modulos, i, i + 1)}
                />
                <IconeBotao label="Editar módulo" onClick={() => setEdicao({ tipo: 'modulo', modulo: m })}>
                  <Pencil className="size-3.5" strokeWidth={1.5} aria-hidden />
                </IconeBotao>
              </div>
              <ul className="divide-y divide-ds-line">
                {(m.conteudos ?? []).map((c, j, lista) => {
                  const Icone = TIPOS.find((t) => t.value === c.tipo)?.icon ?? Video;
                  return (
                    <li key={c.id} className="flex items-center gap-2 px-3 py-1.5">
                      <Icone className="size-4 shrink-0 text-ds-subtle" strokeWidth={1.5} aria-hidden />
                      <button
                        type="button"
                        onClick={() => setEdicao({ tipo: 'conteudo', moduloId: m.id, conteudo: c })}
                        className="min-w-0 flex-1 truncate text-left text-sm text-ds-fg hover:underline"
                      >
                        {c.titulo}
                      </button>
                      <Ordem
                        primeiro={j === 0}
                        ultimo={j === lista.length - 1}
                        onSubir={() => mover('aulas_conteudos', lista, j, j - 1)}
                        onDescer={() => mover('aulas_conteudos', lista, j, j + 1)}
                      />
                    </li>
                  );
                })}
                <li className="px-3 py-1.5">
                  <button
                    type="button"
                    onClick={() => setEdicao({ tipo: 'conteudo', moduloId: m.id, conteudo: null })}
                    className="ds-annot inline-flex items-center gap-1 hover:text-ds-fg"
                  >
                    <Plus className="size-3" strokeWidth={1.5} aria-hidden /> conteúdo
                  </button>
                </li>
              </ul>
            </li>
          ))}
        </ol>
      )}

      {edicao?.tipo === 'modulo' && (
        <ModuloModal
          key={edicao.modulo?.id ?? 'novo'}
          clienteId={clienteId}
          modulo={edicao.modulo}
          proximaOrdem={(modulos?.reduce((max, m) => Math.max(max, m.ordem), 0) ?? 0) + 1}
          onClose={() => setEdicao(null)}
          onSalvo={() => {
            setEdicao(null);
            recarregar();
          }}
        />
      )}
      {edicao?.tipo === 'conteudo' && (
        <ConteudoModal
          key={edicao.conteudo?.id ?? `novo-${edicao.moduloId}`}
          moduloId={edicao.moduloId}
          conteudo={edicao.conteudo}
          proximaOrdem={
            (modulos?.find((m) => m.id === edicao.moduloId)?.conteudos?.reduce((max, c) => Math.max(max, c.ordem), 0) ?? 0) + 1
          }
          onClose={() => setEdicao(null)}
          onSalvo={() => {
            setEdicao(null);
            recarregar();
          }}
        />
      )}
    </div>
  );
}

function IconeBotao({ label, onClick, disabled, children }: { label: string; onClick: () => void; disabled?: boolean; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className="inline-flex size-7 shrink-0 items-center justify-center rounded-ds-xs text-ds-subtle hover:bg-ds-surface hover:text-ds-fg disabled:opacity-30 disabled:hover:bg-transparent"
    >
      {children}
    </button>
  );
}

function Ordem({ primeiro, ultimo, onSubir, onDescer }: { primeiro: boolean; ultimo: boolean; onSubir: () => void; onDescer: () => void }) {
  return (
    <span className="flex shrink-0">
      <IconeBotao label="Subir" onClick={onSubir} disabled={primeiro}>
        <ArrowUp className="size-3.5" strokeWidth={1.5} aria-hidden />
      </IconeBotao>
      <IconeBotao label="Descer" onClick={onDescer} disabled={ultimo}>
        <ArrowDown className="size-3.5" strokeWidth={1.5} aria-hidden />
      </IconeBotao>
    </span>
  );
}

function ModuloModal({
  clienteId,
  modulo,
  proximaOrdem,
  onClose,
  onSalvo,
}: {
  clienteId: string;
  modulo: AulaModulo | null;
  proximaOrdem: number;
  onClose: () => void;
  onSalvo: () => void;
}) {
  const toast = useToast();
  const [titulo, setTitulo] = useState(modulo?.titulo ?? '');
  const [descricao, setDescricao] = useState(modulo?.descricao ?? '');
  const [salvando, setSalvando] = useState(false);
  const [apagando, setApagando] = useState(false);

  const resultado = (error: { message: string } | null, msg: string) => {
    setSalvando(false);
    if (error) {
      toast({ tone: 'danger', title: 'Não foi possível salvar', description: error.message });
      return;
    }
    toast({ tone: 'success', title: msg });
    onSalvo();
  };

  const salvar = async () => {
    if (!titulo.trim()) {
      toast({ tone: 'danger', title: 'Dê um título ao módulo' });
      return;
    }
    setSalvando(true);
    const dados = { titulo: titulo.trim(), descricao: descricao.trim() || null };
    const { error } = modulo
      ? await supabase.from('aulas_modulos').update(dados).eq('id', modulo.id)
      : await supabase.from('aulas_modulos').insert({ ...dados, cliente_id: clienteId, ordem: proximaOrdem });
    resultado(error, modulo ? 'Módulo atualizado' : 'Módulo criado');
  };

  const apagar = async () => {
    if (!modulo) return;
    setSalvando(true);
    const { error } = await supabase.from('aulas_modulos').delete().eq('id', modulo.id);
    resultado(error, 'Módulo excluído');
  };

  return (
    <Modal
      open
      onClose={onClose}
      index="conteúdo"
      title={modulo ? 'Módulo' : 'Novo módulo'}
      footer={
        <>
          {modulo &&
            (apagando ? (
              <Button variant="ghost" disabled={salvando} onClick={apagar}>
                Excluir módulo e {modulo.conteudos?.length ?? 0} conteúdo(s)
              </Button>
            ) : (
              <Button variant="ghost" onClick={() => setApagando(true)}>
                Excluir
              </Button>
            ))}
          <Button onClick={salvar} loading={salvando}>
            Salvar
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <TextField label="Título" value={titulo} onChange={(e) => setTitulo(e.target.value)} autoFocus={!modulo} />
        <TextArea label="Descrição" optional value={descricao} onChange={(e) => setDescricao(e.target.value)} className="min-h-16" />
      </div>
    </Modal>
  );
}

function ConteudoModal({
  moduloId,
  conteudo,
  proximaOrdem,
  onClose,
  onSalvo,
}: {
  moduloId: string;
  conteudo: AulaConteudo | null;
  proximaOrdem: number;
  onClose: () => void;
  onSalvo: () => void;
}) {
  const toast = useToast();
  const [tipo, setTipo] = useState<TipoConteudo>(conteudo?.tipo ?? 'video');
  const [titulo, setTitulo] = useState(conteudo?.titulo ?? '');
  const [descricao, setDescricao] = useState(conteudo?.descricao ?? '');
  const [url, setUrl] = useState(conteudo?.url ?? '');
  const [texto, setTexto] = useState(conteudo?.conteudo ?? '');
  const [salvando, setSalvando] = useState(false);
  const [apagando, setApagando] = useState(false);
  const comUrl = COM_URL.includes(tipo);

  const resultado = (error: { message: string } | null, msg: string) => {
    setSalvando(false);
    if (error) {
      toast({ tone: 'danger', title: 'Não foi possível salvar', description: error.message });
      return;
    }
    toast({ tone: 'success', title: msg });
    onSalvo();
  };

  const salvar = async () => {
    if (!titulo.trim()) {
      toast({ tone: 'danger', title: 'Dê um título ao conteúdo' });
      return;
    }
    if (comUrl && !/^https?:\/\//i.test(url.trim())) {
      toast({ tone: 'danger', title: 'Cole o link completo, começando com https://' });
      return;
    }
    setSalvando(true);
    const dados = {
      tipo,
      titulo: titulo.trim(),
      descricao: descricao.trim() || null,
      url: comUrl ? url.trim() : null,
      conteudo: comUrl ? null : texto.trim() || null,
    };
    const { error } = conteudo
      ? await supabase.from('aulas_conteudos').update(dados).eq('id', conteudo.id)
      : await supabase.from('aulas_conteudos').insert({ ...dados, modulo_id: moduloId, ordem: proximaOrdem });
    resultado(error, conteudo ? 'Conteúdo atualizado' : 'Conteúdo adicionado');
  };

  const apagar = async () => {
    if (!conteudo) return;
    setSalvando(true);
    const { error } = await supabase.from('aulas_conteudos').delete().eq('id', conteudo.id);
    resultado(error, 'Conteúdo excluído');
  };

  return (
    <Modal
      open
      onClose={onClose}
      index="conteúdo"
      title={conteudo ? 'Conteúdo' : 'Novo conteúdo'}
      footer={
        <>
          {conteudo &&
            (apagando ? (
              <Button variant="ghost" disabled={salvando} onClick={apagar}>
                Confirmar exclusão
              </Button>
            ) : (
              <Button variant="ghost" onClick={() => setApagando(true)}>
                Excluir
              </Button>
            ))}
          <Button onClick={salvar} loading={salvando}>
            Salvar
          </Button>
        </>
      }
    >
      <div className="-m-1 max-h-[60vh] space-y-4 overflow-y-auto p-1 pr-2">
        <SelectField
          label="Tipo"
          value={tipo}
          onChange={(e) => setTipo(e.target.value as TipoConteudo)}
          options={TIPOS.map((t) => ({ value: t.value, label: t.label }))}
        />
        <TextField label="Título" value={titulo} onChange={(e) => setTitulo(e.target.value)} autoFocus={!conteudo} />
        <TextArea label="Descrição" optional value={descricao} onChange={(e) => setDescricao(e.target.value)} className="min-h-16" />
        {comUrl ? (
          <TextField
            label="Link"
            hint={tipo === 'video' ? 'YouTube, Vimeo…' : tipo === 'pdf' ? 'Google Drive, Dropbox…' : undefined}
            inputMode="url"
            placeholder="https://"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
        ) : (
          <TextArea
            label={tipo === 'exercicio' ? 'Instruções do exercício' : 'Texto'}
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            className="min-h-32"
          />
        )}
      </div>
    </Modal>
  );
}
