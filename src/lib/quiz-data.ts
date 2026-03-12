export interface QuizOption {
  id: string;
  text: string;
  icon: string;
  points: number;
}

export interface QuizQuestion {
  id: number;
  question: string;
  subtitle?: string;
  options: QuizOption[];
}

export interface QuizResult {
  minScore: number;
  maxScore: number;
  title: string;
  description: string;
  icon: string;
  tips: string[];
  ctaText: string;
}

export const quizQuestions: QuizQuestion[] = [
  {
    id: 1,
    question: "Qual é o seu principal objetivo hoje?",
    subtitle: "Escolha a opção que mais se identifica com você",
    options: [
      { id: "1a", text: "Aumentar minhas vendas", icon: "📈", points: 3 },
      { id: "1b", text: "Melhorar minha presença online", icon: "🌐", points: 2 },
      { id: "1c", text: "Organizar meus processos", icon: "📋", points: 1 },
      { id: "1d", text: "Escalar meu negócio", icon: "🚀", points: 4 },
    ],
  },
  {
    id: 2,
    question: "Há quanto tempo você está no mercado?",
    subtitle: "Isso nos ajuda a entender seu momento",
    options: [
      { id: "2a", text: "Estou começando agora", icon: "🌱", points: 1 },
      { id: "2b", text: "1 a 3 anos", icon: "📊", points: 2 },
      { id: "2c", text: "3 a 5 anos", icon: "💼", points: 3 },
      { id: "2d", text: "Mais de 5 anos", icon: "🏆", points: 4 },
    ],
  },
  {
    id: 3,
    question: "Qual é o seu maior desafio atualmente?",
    subtitle: "Selecione o que mais te preocupa",
    options: [
      { id: "3a", text: "Atrair novos clientes", icon: "🎯", points: 3 },
      { id: "3b", text: "Reter clientes existentes", icon: "🤝", points: 2 },
      { id: "3c", text: "Gerenciar meu tempo", icon: "⏰", points: 1 },
      { id: "3d", text: "Aumentar meu faturamento", icon: "💰", points: 4 },
    ],
  },
  {
    id: 4,
    question: "Como você se comunica com seus clientes?",
    subtitle: "Qual canal é o mais importante para você?",
    options: [
      { id: "4a", text: "WhatsApp", icon: "💬", points: 3 },
      { id: "4b", text: "E-mail marketing", icon: "📧", points: 2 },
      { id: "4c", text: "Redes sociais", icon: "📱", points: 3 },
      { id: "4d", text: "Ainda não tenho um canal definido", icon: "🤔", points: 1 },
    ],
  },
  {
    id: 5,
    question: "Qual é o tamanho da sua equipe?",
    subtitle: "Isso nos ajuda a recomendar a melhor solução",
    options: [
      { id: "5a", text: "Só eu", icon: "👤", points: 1 },
      { id: "5b", text: "2 a 5 pessoas", icon: "👥", points: 2 },
      { id: "5c", text: "6 a 20 pessoas", icon: "🏢", points: 3 },
      { id: "5d", text: "Mais de 20 pessoas", icon: "🏗️", points: 4 },
    ],
  },
];

export const quizResults: QuizResult[] = [
  {
    minScore: 5,
    maxScore: 9,
    title: "Perfil Iniciante",
    description:
      "Você está no começo da sua jornada e tem um grande potencial de crescimento! O mais importante agora é construir uma base sólida para seu negócio.",
    icon: "🌱",
    tips: [
      "Defina seu público-alvo com clareza",
      "Crie uma presença digital consistente",
      "Automatize tarefas repetitivas desde o início",
    ],
    ctaText: "Quero começar com o pé direito",
  },
  {
    minScore: 10,
    maxScore: 14,
    title: "Perfil Estratégico",
    description:
      "Você já tem experiência e sabe o que funciona. Agora é hora de otimizar seus processos e escalar seus resultados com estratégias mais avançadas.",
    icon: "📊",
    tips: [
      "Implemente funis de vendas automatizados",
      "Use dados para tomar decisões mais assertivas",
      "Invista em estratégias de retenção de clientes",
    ],
    ctaText: "Quero otimizar meus resultados",
  },
  {
    minScore: 15,
    maxScore: 20,
    title: "Perfil Avançado",
    description:
      "Você é um profissional experiente e está pronto para dominar o mercado! Suas estratégias já funcionam, agora é hora de escalar exponencialmente.",
    icon: "🚀",
    tips: [
      "Diversifique seus canais de aquisição",
      "Construa parcerias estratégicas",
      "Implemente inteligência artificial no seu negócio",
    ],
    ctaText: "Quero escalar meu negócio",
  },
];

export function getResult(score: number): QuizResult {
  return (
    quizResults.find((r) => score >= r.minScore && score <= r.maxScore) ??
    quizResults[0]
  );
}
