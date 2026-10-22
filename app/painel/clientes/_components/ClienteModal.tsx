'use client';

import { useState } from 'react';
import { Mail } from 'lucide-react';
import { supabase, type Cliente, type Divisao, type Papel, type PessoaStatus, type Responsavel } from '@/lib/supabase';
import { cn, Button } from '@/components/ds/primitives';
import { Modal, useToast } from '@/components/ds/interactive';
import { TextField, TextArea, SelectField, Checkbox } from '@/components/ds/fields';
import { STATUS_LABEL } from '../_lib';

const PAPEIS: { id: Papel; label: string; desc: string }[] = [
  { id: 'aluno', label: 'Aluno', desc: 'aulas de música · DAMA Studio' },
  { id: 'estudio', label: 'Estúdio', desc: 'gravação, mix, produção' },
  { id: 'tech', label: 'Tech', desc: 'sites e sistemas' },
  { id: 'sports', label: 'Sports', desc: 'torneios e eventos' },
];

type Form = {
  id?: string;
  nome: string;
  papeis: Papel[];
  status: PessoaStatus;
  telefone: string;
  email: string;
  empresa: string;
  documento: string;
  instrumento: string;
  responsavel: Responsavel | '';
  notas: string;
};

const VAZIO: Form = { nome: '', papeis: [], status: 'ativo', telefone: '', email: '', empresa: '', documento: '', instrumento: '', responsavel: '', notas: '' };

function paraForm(c: Cliente): Form {
  return {
    id: c.id,
    nome: c.nome,
    papeis: c.papeis ?? [],
    status: c.status ?? 'ativo',
    telefone: c.telefone ?? '',
    email: c.email ?? '',
    empresa: c.empresa ?? '',
    documento: c.documento ?? '',
    instrumento: c.instrumento ?? '',
    responsavel: c.responsavel ?? '',
    notas: c.notas ?? '',
  };
}

// o portal ainda lê `areas` (divisões)
function areasDosPapeis(papeis: Papel[]): Divisao[] {
  const areas = new Set<Divisao>();
  for (const p of papeis) areas.add(p === 'aluno' || p === 'estudio' ? 'studio' : p);
  return [...areas];
}

/** Cadastro novo ou edição. Montar com `key` para reiniciar os campos. */
export function ClienteModal({ cliente, onClose, onSalvo }: { cliente: Cliente | 'novo'; onClose: () => void; onSalvo: (id: string) => void }) {
  const toast = useToast();
  const [form, setForm] = useState<Form>(cliente === 'novo' ? VAZIO : paraForm(cliente));
  const [salvando, setSalvando] = useState(false);

  const salvar = async () => {
    if (!form.nome.trim()) {
      toast({ tone: 'danger', title: 'O nome é obrigatório' });
      return;
    }
    setSalvando(true);
    const dados = {
      nome: form.nome.trim(),
      papeis: form.papeis,
      areas: areasDosPapeis(form.papeis),
      status: form.status,
      telefone: form.telefone.trim() || null,
      email: form.email.trim() || null,
      empresa: form.empresa.trim() || null,
      documento: form.documento.trim() || null,
      instrumento: form.papeis.includes('aluno') ? form.instrumento.trim() || null : null,
      responsavel: form.responsavel || null,
      notas: form.notas.trim() || null,
    };
    const res = form.id
      ? await supabase.from('clientes').update(dados).eq('id', form.id).select('id').single()
      : await supabase.from('clientes').insert(dados).select('id').single();
    setSalvando(false);
    if (res.error) {
      toast({ tone: 'danger', title: 'Não foi possível salvar', description: res.error.message });
      return;
    }
    toast({ tone: 'success', title: form.id ? 'Cadastro atualizado' : 'Cliente cadastrado', description: dados.nome });
    onSalvo(res.data.id);
  };

  return (
    <Modal
      open
      onClose={onClose}
      index={form.id ? 'editar cadastro' : 'nome e WhatsApp bastam · o resto pode vir depois'}
      title={form.id ? form.nome || 'Cliente' : 'Novo cliente'}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={salvar} loading={salvando}>
            Salvar
          </Button>
        </>
      }
    >
      {/* -m-1 p-1: o contorno de foco (2px + 2px de offset) não é cortado pela rolagem */}
      <div className="-m-1 max-h-[60vh] space-y-4 overflow-y-auto p-1 pr-2">
        <TextField label="Nome" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} autoFocus />
        <TextField label="WhatsApp" type="tel" optional value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} placeholder="(13) 99999-9999" />
        <fieldset>
          <legend className="mb-1 text-sm text-ds-fg">Papéis</legend>
          <div className="grid grid-cols-2 gap-x-3">
            {PAPEIS.map((r) => (
              <Checkbox
                key={r.id}
                label={r.label}
                description={r.desc}
                checked={form.papeis.includes(r.id)}
                onChange={(e) => setForm({ ...form, papeis: e.target.checked ? [...form.papeis, r.id] : form.papeis.filter((x) => x !== r.id) })}
              />
            ))}
          </div>
        </fieldset>
        {form.papeis.includes('aluno') && (
          <TextField label="Instrumento" optional value={form.instrumento} onChange={(e) => setForm({ ...form, instrumento: e.target.value })} placeholder="Violão, piano, canto…" />
        )}
        <div className="grid grid-cols-2 gap-3">
          <SelectField
            label="Status"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value as PessoaStatus })}
            options={(Object.keys(STATUS_LABEL) as PessoaStatus[]).map((s) => ({ value: s, label: STATUS_LABEL[s] }))}
          />
          <SelectField
            label="Responsável"
            value={form.responsavel}
            onChange={(e) => setForm({ ...form, responsavel: e.target.value as Responsavel | '' })}
            options={[
              { value: '', label: '—' },
              { value: 'daniel', label: 'Daniel' },
              { value: 'marcella', label: 'Marcella' },
            ]}
          />
        </div>
        <TextField label="E-mail" type="email" optional value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} leading={<Mail className="size-4" strokeWidth={1.5} />} />
        <div className="grid grid-cols-2 gap-3">
          <TextField label="Empresa" optional value={form.empresa} onChange={(e) => setForm({ ...form, empresa: e.target.value })} />
          <TextField label="CPF/CNPJ" optional value={form.documento} onChange={(e) => setForm({ ...form, documento: e.target.value })} />
        </div>
        <TextArea label="Notas" optional value={form.notas} onChange={(e) => setForm({ ...form, notas: e.target.value })} className={cn('min-h-20')} />
      </div>
    </Modal>
  );
}
