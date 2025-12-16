'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// URL do Google Apps Script
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwSTrvTQry_ezg96elva71DAu44l-B1mhJch94ClyE9eA6jRWKKh5H9p2NKJVFSPeTX/exec';

interface Question {
  id: string;
  type: 'text' | 'textarea' | 'select' | 'multiselect' | 'email';
  question: string;
  subtitle?: string;
  options?: string[];
  required?: boolean;
  placeholder?: string;
}

const questions: Question[] = [
  {
    id: 'nome',
    type: 'text',
    question: 'Qual é o seu nome?',
    subtitle: 'Como você gostaria de ser chamado',
    placeholder: 'Digite seu nome',
    required: true,
  },
  {
    id: 'email',
    type: 'email',
    question: 'Qual seu melhor e-mail?',
    subtitle: 'Para te enviar atualizações do projeto',
    placeholder: 'seu@email.com',
    required: true,
  },
  {
    id: 'objetivo',
    type: 'select',
    question: 'Qual o principal objetivo do site?',
    subtitle: 'Escolha a opção que mais se encaixa',
    options: [
      'Cartão de visitas digital (links e contato)',
      'Portfólio pessoal (mostrar carreira e conquistas)',
      'Atrair marcas e patrocinadores',
      'Vender produtos/serviços',
      'Outro',
    ],
    required: true,
  },
  {
    id: 'acao_visitante',
    type: 'textarea',
    question: 'O que você quer que a pessoa faça ao entrar no site?',
    subtitle: 'Ex: Me seguir nas redes, entrar em contato para parcerias, conhecer minha história...',
    placeholder: 'Descreva a ação principal...',
    required: true,
  },
  {
    id: 'secoes',
    type: 'multiselect',
    question: 'Quais seções você quer no site?',
    subtitle: 'Selecione todas que interessam',
    options: [
      'Sobre mim / Bio',
      'Carreira / Linha do tempo',
      'Links das redes sociais',
      'Galeria de fotos/vídeos',
      'Parceiros e patrocinadores',
      'Loja / Produtos',
      'Contato / Formulário para parcerias',
      'Blog / Novidades',
      'Mídia Kit para download',
    ],
    required: true,
  },
  {
    id: 'tem_textos',
    type: 'select',
    question: 'Você tem textos prontos?',
    subtitle: 'Bio, descrições, etc.',
    options: [
      'Sim, tenho tudo pronto',
      'Tenho parcialmente, preciso de ajuda com alguns',
      'Não tenho, preciso que vocês escrevam',
    ],
    required: true,
  },
  {
    id: 'tem_fotos',
    type: 'select',
    question: 'Tem fotos profissionais em alta qualidade?',
    subtitle: 'Para usar no site',
    options: [
      'Sim, tenho várias',
      'Tenho algumas, mas preciso de mais',
      'Não tenho, preciso produzir',
    ],
    required: true,
  },
  {
    id: 'cores',
    type: 'select',
    question: 'Já tem uma paleta de cores definida?',
    subtitle: 'Identidade visual da sua marca',
    options: [
      'Sim, tenho identidade visual completa',
      'Tenho algumas cores em mente',
      'Não, podem criar do zero',
    ],
    required: true,
  },
  {
    id: 'tem_logo',
    type: 'select',
    question: 'Tem logo em arquivo vetorial?',
    subtitle: 'Formatos como SVG, AI, EPS ou PDF',
    options: [
      'Sim, tenho em vetorial',
      'Tenho só em PNG/JPG',
      'Não tenho logo ainda',
    ],
    required: true,
  },
  {
    id: 'referencia',
    type: 'textarea',
    question: 'Tem algum site que você curte a estética?',
    subtitle: 'Cole links de referências visuais que te inspiram',
    placeholder: 'https://...',
    required: false,
  },
  {
    id: 'funcionalidades',
    type: 'multiselect',
    question: 'Precisa de alguma funcionalidade específica?',
    subtitle: 'Recursos extras para o site',
    options: [
      'Formulário de contato',
      'Integração com e-mail marketing',
      'Feed do Instagram embutido',
      'Loja virtual',
      'Área de mídia kit para download',
      'Multi-idioma (PT/EN)',
      'Blog',
      'Agendamento online',
    ],
    required: false,
  },
  {
    id: 'atualizacao',
    type: 'select',
    question: 'Vai precisar atualizar o site com frequência?',
    subtitle: 'Isso define se precisamos de um CMS',
    options: [
      'Sim, vou atualizar sempre',
      'De vez em quando',
      'Raramente, pode ser mais estático',
    ],
    required: true,
  },
  {
    id: 'dominio',
    type: 'text',
    question: 'Já tem domínio registrado?',
    subtitle: 'Ex: seusite.com.br — se não tiver, deixe "não tenho"',
    placeholder: 'seusite.com.br',
    required: true,
  },
  {
    id: 'prazo',
    type: 'text',
    question: 'Tem alguma data limite?',
    subtitle: 'Prazo para o site estar no ar',
    placeholder: 'Ex: Março/2025 ou "sem pressa"',
    required: false,
  },
  {
    id: 'prioridade',
    type: 'select',
    question: 'O que é mais importante pra você?',
    subtitle: 'Escolha a prioridade principal',
    options: [
      'Visual impactante',
      'Velocidade de carregamento',
      'Facilidade de atualizar depois',
      'Todas igualmente importantes',
    ],
    required: true,
  },
  {
    id: 'extras',
    type: 'textarea',
    question: 'Algo mais que gostaria de compartilhar?',
    subtitle: 'Informações extras, desejos, ou coisas que NÃO quer de jeito nenhum',
    placeholder: 'Fique à vontade...',
    required: false,
  },
];

export default function BriefingForm({ clientName = 'Cliente' }: { clientName?: string }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [direction, setDirection] = useState(1);

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  const handleAnswer = (value: string | string[]) => {
    setAnswers(prev => ({
      ...prev,
      [question.id]: value,
    }));
  };

  const handleMultiSelect = (option: string) => {
    const current = (answers[question.id] as string[]) || [];
    if (current.includes(option)) {
      handleAnswer(current.filter(item => item !== option));
    } else {
      handleAnswer([...current, option]);
    }
  };

  const canProceed = () => {
    if (!question.required) return true;
    const answer = answers[question.id];
    if (Array.isArray(answer)) return answer.length > 0;
    return answer && answer.trim() !== '';
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setDirection(1);
      setCurrentQuestion(prev => prev + 1);
    } else {
      submitForm();
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setDirection(-1);
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const submitForm = async () => {
    setIsSubmitting(true);
    
    const formData = {
      timestamp: new Date().toLocaleString('pt-BR'),
      cliente: clientName,
      ...answers,
      // Converter arrays para string
      secoes: Array.isArray(answers.secoes) ? answers.secoes.join(', ') : answers.secoes,
      funcionalidades: Array.isArray(answers.funcionalidades) ? answers.funcionalidades.join(', ') : answers.funcionalidades,
    };

    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      setIsComplete(true);
    } catch (error) {
      console.error('Erro ao enviar:', error);
      alert('Erro ao enviar. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && question.type !== 'textarea') {
      e.preventDefault();
      if (canProceed()) nextQuestion();
    }
  };

  const variants = {
    enter: (direction: number) => ({
      y: direction > 0 ? 50 : -50,
      opacity: 0,
    }),
    center: {
      y: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      y: direction < 0 ? 50 : -50,
      opacity: 0,
    }),
  };

  if (isComplete) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center max-w-md"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Respostas enviadas!</h2>
          <p className="text-gray-400 mb-8">
            Obrigado por responder, {answers.nome}! Vamos analisar suas respostas e entrar em contato em breve.
          </p>
          <a
            href="https://www.damadigitalcriativa.com.br"
            className="inline-block px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-full hover:opacity-90 transition-opacity"
          >
            Voltar para o site
          </a>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col" onKeyDown={handleKeyDown}>
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gray-800 z-50">
        <motion.div
          className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Header */}
      <header className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            DAMA
          </span>
          <span className="text-gray-500 text-sm">Briefing</span>
        </div>
        <span className="text-gray-500 text-sm">
          {currentQuestion + 1} de {questions.length}
        </span>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentQuestion}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              {/* Question number */}
              <div className="flex items-center gap-2 mb-4">
                <span className="text-purple-400 font-mono text-sm">
                  {String(currentQuestion + 1).padStart(2, '0')}
                </span>
                <div className="w-8 h-px bg-purple-400/30" />
              </div>

              {/* Question */}
              <h2 className="text-2xl md:text-4xl font-bold text-white mb-3">
                {question.question}
              </h2>
              
              {question.subtitle && (
                <p className="text-gray-400 mb-8">{question.subtitle}</p>
              )}

              {/* Input based on type */}
              <div className="mt-8">
                {question.type === 'text' && (
                  <input
                    type="text"
                    value={(answers[question.id] as string) || ''}
                    onChange={(e) => handleAnswer(e.target.value)}
                    placeholder={question.placeholder}
                    className="w-full bg-transparent border-b-2 border-gray-700 focus:border-purple-500 text-white text-xl py-3 outline-none transition-colors placeholder:text-gray-600"
                    autoFocus
                  />
                )}

                {question.type === 'email' && (
                  <input
                    type="email"
                    value={(answers[question.id] as string) || ''}
                    onChange={(e) => handleAnswer(e.target.value)}
                    placeholder={question.placeholder}
                    className="w-full bg-transparent border-b-2 border-gray-700 focus:border-purple-500 text-white text-xl py-3 outline-none transition-colors placeholder:text-gray-600"
                    autoFocus
                  />
                )}

                {question.type === 'textarea' && (
                  <textarea
                    value={(answers[question.id] as string) || ''}
                    onChange={(e) => handleAnswer(e.target.value)}
                    placeholder={question.placeholder}
                    rows={4}
                    className="w-full bg-transparent border-2 border-gray-700 focus:border-purple-500 text-white text-lg p-4 rounded-lg outline-none transition-colors placeholder:text-gray-600 resize-none"
                    autoFocus
                  />
                )}

                {question.type === 'select' && (
                  <div className="space-y-3">
                    {question.options?.map((option, index) => (
                      <button
                        key={option}
                        onClick={() => handleAnswer(option)}
                        className={`w-full text-left px-6 py-4 rounded-lg border-2 transition-all flex items-center gap-4 group ${
                          answers[question.id] === option
                            ? 'border-purple-500 bg-purple-500/10 text-white'
                            : 'border-gray-700 text-gray-300 hover:border-gray-500 hover:bg-gray-800/50'
                        }`}
                      >
                        <span className={`w-8 h-8 rounded-md flex items-center justify-center text-sm font-medium transition-colors ${
                          answers[question.id] === option
                            ? 'bg-purple-500 text-white'
                            : 'bg-gray-800 text-gray-400 group-hover:bg-gray-700'
                        }`}>
                          {String.fromCharCode(65 + index)}
                        </span>
                        <span>{option}</span>
                      </button>
                    ))}
                  </div>
                )}

                {question.type === 'multiselect' && (
                  <div className="space-y-3">
                    {question.options?.map((option, index) => {
                      const selected = ((answers[question.id] as string[]) || []).includes(option);
                      return (
                        <button
                          key={option}
                          onClick={() => handleMultiSelect(option)}
                          className={`w-full text-left px-6 py-4 rounded-lg border-2 transition-all flex items-center gap-4 group ${
                            selected
                              ? 'border-purple-500 bg-purple-500/10 text-white'
                              : 'border-gray-700 text-gray-300 hover:border-gray-500 hover:bg-gray-800/50'
                          }`}
                        >
                          <span className={`w-8 h-8 rounded-md flex items-center justify-center text-sm transition-colors ${
                            selected
                              ? 'bg-purple-500 text-white'
                              : 'bg-gray-800 text-gray-400 group-hover:bg-gray-700'
                          }`}>
                            {selected ? (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              String.fromCharCode(65 + index)
                            )}
                          </span>
                          <span>{option}</span>
                        </button>
                      );
                    })}
                    <p className="text-gray-500 text-sm mt-4">
                      * Selecione todas que se aplicam
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Footer navigation */}
      <footer className="p-6 flex items-center justify-between">
        <button
          onClick={prevQuestion}
          disabled={currentQuestion === 0}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            currentQuestion === 0
              ? 'text-gray-600 cursor-not-allowed'
              : 'text-gray-400 hover:text-white hover:bg-gray-800'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="hidden sm:inline">Voltar</span>
        </button>

        <button
          onClick={nextQuestion}
          disabled={!canProceed() || isSubmitting}
          className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all ${
            canProceed()
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:opacity-90 hover:scale-105'
              : 'bg-gray-800 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Enviando...
            </>
          ) : currentQuestion === questions.length - 1 ? (
            <>
              Enviar
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </>
          ) : (
            <>
              Continuar
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </>
          )}
        </button>
      </footer>

      {/* Keyboard hint */}
      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 text-gray-600 text-sm hidden md:block">
        Pressione <kbd className="px-2 py-1 bg-gray-800 rounded text-gray-400 mx-1">Enter ↵</kbd> para continuar
      </div>
    </div>
  );
}