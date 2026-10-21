'use client';

import { useState } from 'react';
import { Copy, KeyRound, MessageCircle, RefreshCw } from 'lucide-react';
import { supabase, type Cliente } from '@/lib/supabase';
import { Button, buttonClass } from '@/components/ds/primitives';
import { Modal, useToast } from '@/components/ds/interactive';
import { whatsappUrl } from '../../_lib';

// sem 0/o, 1/l/i: fácil de ditar e digitar no celular
const ALFABETO = 'abcdefghjkmnpqrstuvwxyz23456789';

function gerarSenha() {
  const bytes = crypto.getRandomValues(new Uint32Array(8));
  return Array.from(bytes, (b) => ALFABETO[b % ALFABETO.length]).join('');
}

function slugDoNome(nome: string) {
  return nome
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/** Acesso ao portal do cliente: link + senha (guardada só como hash). */
export function PortalAcesso({ p, onMudou }: { p: Cliente; onMudou: () => void }) {
  const toast = useToast();
  const [modal, setModal] = useState(false);
  const [removendo, setRemovendo] = useState(false);
  const temAcesso = !!p.senha_hash;
  const link = p.slug ? `${window.location.origin}/cliente/${p.slug}` : null;

  const copiarLink = async () => {
    if (!link) return;
    await navigator.clipboard.writeText(link);
    toast({ tone: 'success', title: 'Link copiado' });
  };

  const remover = async () => {
    const { error } = await supabase.from('clientes').update({ senha_hash: null }).eq('id', p.id);
    setRemovendo(false);
    if (error) {
      toast({ tone: 'danger', title: 'Não foi possível remover', description: error.message });
      return;
    }
    toast({ tone: 'success', title: 'Acesso ao portal removido' });
    onMudou();
  };

  return (
    <div>
      <p className="ds-annot mb-2 uppercase">Portal do cliente</p>
      <dl className="divide-y divide-ds-line border-y border-ds-line text-sm">
        <div className="flex items-baseline justify-between gap-4 py-2">
          <dt className="ds-annot uppercase">Link</dt>
          <dd className="min-w-0 truncate text-right">
            {link && temAcesso ? (
              <button type="button" onClick={copiarLink} className="inline-flex items-center gap-1.5 text-ds-fg hover:underline">
                /cliente/{p.slug} <Copy className="size-3.5 text-ds-subtle" strokeWidth={1.5} aria-hidden />
              </button>
            ) : (
              <span className="text-ds-subtle">—</span>
            )}
          </dd>
        </div>
        <div className="flex items-baseline justify-between gap-4 py-2">
          <dt className="ds-annot uppercase">Senha</dt>
          <dd className="text-right text-ds-fg">{temAcesso ? 'definida · protegida' : <span className="text-ds-subtle">sem acesso</span>}</dd>
        </div>
      </dl>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <Button variant="secondary" size="sm" onClick={() => setModal(true)}>
          <KeyRound className="size-4" strokeWidth={1.5} aria-hidden /> {temAcesso ? 'Gerar nova senha' : 'Criar acesso'}
        </Button>
        {temAcesso &&
          (removendo ? (
            <>
              <Button variant="ghost" size="sm" onClick={remover}>
                Confirmar remoção
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setRemovendo(false)}>
                Voltar
              </Button>
            </>
          ) : (
            <Button variant="ghost" size="sm" onClick={() => setRemovendo(true)}>
              Remover acesso
            </Button>
          ))}
      </div>
      {modal && <NovaSenhaModal key={p.id} p={p} onClose={() => setModal(false)} onSalvo={onMudou} />}
    </div>
  );
}

function NovaSenhaModal({ p, onClose, onSalvo }: { p: Cliente; onClose: () => void; onSalvo: () => void }) {
  const toast = useToast();
  const [senha, setSenha] = useState(gerarSenha);
  const [salvando, setSalvando] = useState(false);
  const [slugSalvo, setSlugSalvo] = useState<string | null>(null);

  const salvar = async () => {
    setSalvando(true);
    let slug = p.slug || slugDoNome(p.nome) || 'cliente';
    let res = await supabase.from('clientes').update({ senha_acesso: senha, slug }).eq('id', p.id);
    if (res.error?.code === '23505' && !p.slug) {
      // já existe um portal com esse nome
      slug = `${slug}-${gerarSenha().slice(0, 4)}`;
      res = await supabase.from('clientes').update({ senha_acesso: senha, slug }).eq('id', p.id);
    }
    setSalvando(false);
    if (res.error) {
      toast({ tone: 'danger', title: 'Não foi possível salvar', description: res.error.message });
      return;
    }
    setSlugSalvo(slug);
    onSalvo();
  };

  const link = slugSalvo ? `${window.location.origin}/cliente/${slugSalvo}` : '';
  const mensagem = `Olá, ${p.nome.split(' ')[0]}! Seu acesso ao portal da DAMA:\n${link}\nSenha: ${senha}`;
  const wa = p.telefone ? whatsappUrl(p.telefone, mensagem) : null;

  const copiar = async () => {
    await navigator.clipboard.writeText(mensagem);
    toast({ tone: 'success', title: 'Mensagem copiada' });
  };

  return (
    <Modal
      open
      onClose={onClose}
      index="portal"
      title={slugSalvo ? 'Senha salva' : p.senha_hash ? 'Nova senha do portal' : 'Criar acesso ao portal'}
      footer={
        slugSalvo ? (
          <>
            <Button variant="ghost" onClick={copiar}>
              <Copy className="size-4" strokeWidth={1.5} aria-hidden /> Copiar mensagem
            </Button>
            {wa ? (
              <a
                href={wa}
                target="_blank"
                rel="noreferrer"
                className={buttonClass({})}
              >
                <MessageCircle className="size-4" strokeWidth={1.5} aria-hidden /> Enviar no WhatsApp
              </a>
            ) : (
              <Button onClick={onClose}>Fechar</Button>
            )}
          </>
        ) : (
          <>
            <Button variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={salvar} loading={salvando}>
              Salvar senha
            </Button>
          </>
        )
      }
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3 rounded-ds-sm border border-ds-line px-4 py-3">
          <code className="font-mono text-2xl tracking-[0.2em] text-ds-fg">{senha}</code>
          {!slugSalvo && (
            <button type="button" onClick={() => setSenha(gerarSenha())} className="ds-annot inline-flex items-center gap-1 hover:text-ds-fg">
              <RefreshCw className="size-3.5" strokeWidth={1.5} aria-hidden /> outra
            </button>
          )}
        </div>
        {slugSalvo ? (
          <p className="text-sm text-ds-muted">
            Envie agora para {p.nome.split(' ')[0]}: depois de fechar esta janela, a senha não aparece mais — só gerando outra.
          </p>
        ) : (
          <p className="text-sm text-ds-muted">
            A senha fica guardada protegida (hash) e não dá para ver depois.
            {p.senha_hash && ' A senha atual deixa de funcionar e quem estiver no portal precisa entrar de novo.'}
          </p>
        )}
      </div>
    </Modal>
  );
}
