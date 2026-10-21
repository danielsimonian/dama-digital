'use client';

import { useState } from 'react';
import { ChevronDown, Copy, Pencil, Share2, Trash2, Send, Plus, RotateCcw } from 'lucide-react';
import { Button, Alert, cn } from '@/components/ds/primitives';
import { Switch } from '@/components/ds/fields';
import { Dropdown, Modal, Drawer, useToast } from '@/components/ds/interactive';
import { ContactForm } from '@/components/ds/contact-form';

export function LoadingButtonDemo() {
  const [loading, setLoading] = useState(false);
  return (
    <Button
      loading={loading}
      onClick={() => {
        setLoading(true);
        setTimeout(() => setLoading(false), 1600);
      }}
    >
      {loading ? 'Enviando' : 'Clique para carregar'}
    </Button>
  );
}

export function DropdownDemo() {
  const toast = useToast();
  return (
    <Dropdown
      trigger={({ open, toggle, id }) => (
        <Button variant="secondary" onClick={toggle} aria-expanded={open} aria-controls={id} aria-haspopup="menu">
          Ações do orçamento
          <ChevronDown className={cn('size-4 transition-transform duration-200', open && 'rotate-180')} strokeWidth={1.5} aria-hidden />
        </Button>
      )}
      items={[
        { label: 'Editar', hint: 'E', icon: <Pencil className="size-4" strokeWidth={1.5} /> },
        { label: 'Duplicar', hint: 'D', icon: <Copy className="size-4" strokeWidth={1.5} /> },
        {
          label: 'Copiar link público',
          icon: <Share2 className="size-4" strokeWidth={1.5} />,
          onSelect: () => toast({ tone: 'success', title: 'Link copiado', description: 'damadigitalcriativa.com.br/orcamento/open-verao-2027' }),
        },
        { label: 'Excluir', icon: <Trash2 className="size-4" strokeWidth={1.5} />, danger: true },
      ]}
    />
  );
}

export function ToastDemo() {
  const toast = useToast();
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="secondary"
        onClick={() => toast({ tone: 'success', title: 'Inscrição confirmada', description: 'Dupla Mista B · 6º Open SPFC' })}
      >
        Sucesso
      </Button>
      <Button
        variant="secondary"
        onClick={() => toast({ tone: 'danger', title: 'Falha no upload', description: 'foto-quadra-7.jpg passou de 25 MB.' })}
      >
        Erro
      </Button>
      <Button variant="secondary" onClick={() => toast({ tone: 'info', title: 'Novo lançamento no ar', description: 'Confiança — Fernando Silveyra' })}>
        Informação
      </Button>
    </div>
  );
}

export function ModalDemo() {
  const [open, setOpen] = useState(false);
  const toast = useToast();
  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        Abrir modal
      </Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        index="ORÇAMENTO · #0427"
        title="Enviar proposta ao cliente?"
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => {
                setOpen(false);
                toast({ tone: 'success', title: 'Proposta enviada', description: 'O cliente recebe o link por e-mail e WhatsApp.' });
              }}
            >
              <Send className="size-4" strokeWidth={1.5} aria-hidden /> Enviar proposta
            </Button>
          </>
        }
      >
        O cliente recebe o link público da proposta &quot;Open Verão 2027 — cobertura completa&quot; no valor de R$ 18.640,00.
        Depois de enviada, ela só pode ser editada como nova versão.
      </Modal>
    </>
  );
}

export function DrawerDemo() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        Abrir drawer
      </Button>
      <Drawer open={open} onClose={() => setOpen(false)} title="6º Open SPFC · detalhes">
        <dl className="divide-y divide-ds-line text-sm">
          {[
            ['Datas', '29, 30 e 31 de maio de 2026'],
            ['Local', 'CT do São Paulo FC · São Paulo, SP'],
            ['Atletas', '400+'],
            ['Categorias', '19'],
            ['Quadras', '7'],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4 py-3">
              <dt className="ds-annot uppercase">{k}</dt>
              <dd className="text-right text-ds-fg">{v}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-6">
          <Alert tone="info" title="Fotos chegando">
            A galeria completa sai em até 48 h depois da final.
          </Alert>
        </div>
      </Drawer>
    </>
  );
}

export function ContactDemo() {
  const [fail, setFail] = useState(false);
  return (
    <div>
      <div className="mb-6 max-w-xs">
        <Switch label="Simular falha no envio" checked={fail} onChange={(e) => setFail(e.target.checked)} />
      </div>
      <ContactForm simulateError={fail} />
    </div>
  );
}

const CURVES = [
  { name: '--ease-ds-out', note: 'entradas, hover', value: 'cubic-bezier(0.23, 1, 0.32, 1)' },
  { name: '--ease-ds-inout', note: 'movimento na tela', value: 'cubic-bezier(0.77, 0, 0.175, 1)' },
  { name: '--ease-ds-drawer', note: 'drawers e painéis', value: 'cubic-bezier(0.32, 0.72, 0, 1)' },
];

export function MotionDemo() {
  const [on, setOn] = useState(false);
  return (
    <div>
      <div className="space-y-4">
        {CURVES.map((c) => (
          <div key={c.name} className="grid items-center gap-2 sm:grid-cols-[12rem_1fr]">
            <div>
              <p className="font-ds-mono text-xs text-ds-fg">{c.name}</p>
              <p className="ds-annot">{c.note}</p>
            </div>
            <div className="relative h-8 border-b border-dashed border-ds-line">
              <span className="absolute inset-y-0 left-0 right-3">
                <span
                  className="absolute inset-0"
                  style={{
                    transform: on ? 'translateX(100%)' : 'translateX(0%)',
                    transitionProperty: 'transform',
                    transitionDuration: '900ms',
                    transitionTimingFunction: c.value,
                  }}
                >
                  <span className="absolute bottom-0 left-0 size-3 translate-y-1/2 rounded-full bg-ds-accent" />
                </span>
              </span>
            </div>
          </div>
        ))}
      </div>
      <Button variant="bracket" className="mt-6" onClick={() => setOn((v) => !v)}>
        <RotateCcw className="size-3.5" strokeWidth={1.5} aria-hidden /> Reproduzir
      </Button>
    </div>
  );
}

export function IconButtonDemo() {
  const toast = useToast();
  return (
    <Button size="icon" variant="secondary" aria-label="Adicionar torneio" onClick={() => toast({ tone: 'info', title: 'Novo torneio', description: 'Rascunho criado.' })}>
      <Plus className="size-4" strokeWidth={1.5} />
    </Button>
  );
}
