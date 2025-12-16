import BriefingForm from '@/components/BriefingForm';

export const metadata = {
  title: 'Briefing | DAMA Digital',
  description: 'Formulário de briefing para novos projetos',
  robots: 'noindex, nofollow', // Oculta dos buscadores
};

export default function BriefingBrunoAgnello() {
  return <BriefingForm clientName="Bruno Agnello" />;
}