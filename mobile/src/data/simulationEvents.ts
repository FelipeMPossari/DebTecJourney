export type SimulationAttributeKey = 'deadline' | 'cost' | 'quality' | 'morale' | 'debt';

export type SimulationAttributes = Record<SimulationAttributeKey, number>;

export type SimulationEffect = Partial<Record<SimulationAttributeKey, number>>;

export type SimulationEvent = {
  id: string;
  title: string;
  context: string;
  acceptLabel: string;
  rejectLabel: string;
  acceptEffects: SimulationEffect;
  rejectEffects: SimulationEffect;
  acceptOutcome: string;
  rejectOutcome: string;
};

export const initialSimulationAttributes: SimulationAttributes = {
  deadline: 100,
  cost: 0,
  quality: 72,
  morale: 74,
  debt: 0,
};

export const simulationEvents: SimulationEvent[] = [
  {
    id: 'legacy-copy',
    title: 'Entrega urgente no módulo de pagamentos',
    context:
      'O time encontrou um componente antigo que resolve quase tudo, mas ele tem dependências desatualizadas e pouca cobertura de testes.',
    acceptLabel: 'Usar o componente legado',
    rejectLabel: 'Construir a solução mínima limpa',
    acceptEffects: { cost: 4, quality: -12, morale: -5, debt: 15 },
    rejectEffects: { deadline: -5, cost: 6, quality: 11, morale: 6, debt: -9 },
    acceptOutcome: 'A entrega acelera, mas a base fica mais frágil e difícil de evoluir.',
    rejectOutcome: 'O prazo aperta, porém o time reduz risco técnico para as próximas entregas.',
  },
  {
    id: 'test-sprint',
    title: 'Sprint dedicada a testes automatizados',
    context:
      'A suíte atual cobre apenas os fluxos felizes. A equipe quer reservar alguns dias para testes de regressão antes da próxima feature.',
    acceptLabel: 'Reservar a sprint de testes',
    rejectLabel: 'Seguir direto para a próxima feature',
    acceptEffects: { deadline: -5, cost: 5, quality: 16, morale: 8, debt: -13 },
    rejectEffects: { cost: -1, quality: -13, morale: -6, debt: 12 },
    acceptOutcome: 'A cadência desacelera, mas o produto ganha confiança e previsibilidade.',
    rejectOutcome: 'O roadmap anda rápido, enquanto defeitos antigos continuam acumulando pressão.',
  },
  {
    id: 'dependency-update',
    title: 'Atualização crítica de dependências',
    context:
      'Uma biblioteca central recebeu correção de segurança. Atualizar agora exige adaptação em várias telas.',
    acceptLabel: 'Atualizar agora',
    rejectLabel: 'Adiar para depois da entrega',
    acceptEffects: { deadline: -4, cost: 4, quality: 12, morale: 2, debt: -11 },
    rejectEffects: { cost: -1, quality: -10, morale: -3, debt: 13 },
    acceptOutcome: 'A atualização consome energia, mas elimina uma fonte importante de dívida.',
    rejectOutcome: 'O curto prazo agradece, mas a manutenção fica mais arriscada.',
  },
  {
    id: 'code-review',
    title: 'Fila de revisão de código crescendo',
    context:
      'Há pull requests parados desde ontem. Liberar sem revisão destravaria o time, mas algumas mudanças tocam regras de negócio sensíveis.',
    acceptLabel: 'Manter revisão obrigatória',
    rejectLabel: 'Fazer merge sem revisão',
    acceptEffects: { deadline: -2, cost: 1, quality: 13, morale: 4, debt: -8 },
    rejectEffects: { cost: -2, quality: -14, morale: -7, debt: 11 },
    acceptOutcome: 'A fila demora mais um pouco, mas erros importantes são encontrados cedo.',
    rejectOutcome: 'A entrega flui hoje, com uma chance maior de retrabalho amanhã.',
  },
  {
    id: 'architecture-record',
    title: 'Decisão arquitetural sem registro',
    context:
      'O time escolheu uma abordagem para autenticação, mas ninguém documentou o motivo nem as alternativas descartadas.',
    acceptLabel: 'Registrar a decisão',
    rejectLabel: 'Deixar apenas na conversa',
    acceptEffects: { deadline: -1, cost: 1, quality: 8, morale: 7, debt: -10 },
    rejectEffects: { cost: -1, quality: -8, morale: -5, debt: 9 },
    acceptOutcome: 'A documentação reduz ruído e ajuda novos integrantes a entender o contexto.',
    rejectOutcome: 'A decisão some no fluxo do projeto e volta como dúvida em pouco tempo.',
  },
  {
    id: 'client-change',
    title: 'Mudança crítica de requisito',
    context:
      'O cliente pediu uma mudança no fluxo principal. Dá para encaixar rápido, mas a modelagem atual não foi feita para isso.',
    acceptLabel: 'Aceitar a mudança imediatamente',
    rejectLabel: 'Negociar escopo e redesenho',
    acceptEffects: { deadline: -2, cost: 10, quality: -15, morale: -8, debt: 16 },
    rejectEffects: { deadline: -4, cost: 3, quality: 10, morale: 5, debt: -8 },
    acceptOutcome: 'O cliente vê avanço rápido, mas a arquitetura absorve uma adaptação torta.',
    rejectOutcome: 'A conversa é mais difícil, porém o time protege a evolução do produto.',
  },
  {
    id: 'refactor-auth',
    title: 'Refatoração da autenticação',
    context:
      'A autenticação funciona, mas possui regras duplicadas entre telas e serviços. Um ajuste pequeno costuma quebrar algo distante.',
    acceptLabel: 'Refatorar agora',
    rejectLabel: 'Tratar apenas o bug atual',
    acceptEffects: { deadline: -5, cost: 8, quality: 17, morale: 6, debt: -16 },
    rejectEffects: { cost: 2, quality: -11, morale: -4, debt: 12 },
    acceptOutcome: 'A base fica mais simples de manter, mesmo com uma entrega menos folgada.',
    rejectOutcome: 'O bug sai rápido, enquanto a duplicação continua cobrando juros.',
  },
  {
    id: 'manual-deploy',
    title: 'Deploy manual toda sexta',
    context:
      'O processo de publicação depende de uma sequência manual feita por uma pessoa específica da equipe.',
    acceptLabel: 'Automatizar o deploy',
    rejectLabel: 'Manter processo manual',
    acceptEffects: { deadline: -4, cost: 9, quality: 14, morale: 9, debt: -12 },
    rejectEffects: { cost: -2, quality: -12, morale: -7, debt: 10 },
    acceptOutcome: 'O investimento dói no orçamento, mas reduz erro humano e dependência individual.',
    rejectOutcome: 'O custo imediato fica baixo, com risco crescente a cada publicação.',
  },
  {
    id: 'team-burnout',
    title: 'Sinais de cansaço no time',
    context:
      'A equipe acumulou horas extras por duas semanas. Há pressão para manter o ritmo até o fim do mês.',
    acceptLabel: 'Reduzir carga e renegociar ritmo',
    rejectLabel: 'Forçar o ritmo atual',
    acceptEffects: { deadline: -3, cost: 3, quality: 7, morale: 17, debt: -5 },
    rejectEffects: { cost: -4, quality: -9, morale: -18, debt: 8 },
    acceptOutcome: 'A velocidade cai, mas a equipe recupera clareza para decidir melhor.',
    rejectOutcome: 'O cronograma ganha fôlego no papel, enquanto o time perde sustentação.',
  },
  {
    id: 'observability',
    title: 'Falhas sem rastreabilidade',
    context:
      'Os usuários relatam erros intermitentes. Sem logs estruturados, o time gasta horas tentando reproduzir cada caso.',
    acceptLabel: 'Investir em observabilidade',
    rejectLabel: 'Investigar caso a caso',
    acceptEffects: { deadline: -3, cost: 7, quality: 13, morale: 7, debt: -11 },
    rejectEffects: { deadline: -1, cost: 2, quality: -12, morale: -9, debt: 9 },
    acceptOutcome: 'Os diagnósticos ficam mais rápidos e o time deixa de trabalhar no escuro.',
    rejectOutcome: 'Alguns chamados são resolvidos, mas a causa sistêmica continua escondida.',
  },
];
