import { CoursePreview } from '../types/learning';

export const demoCourse: CoursePreview = {
  id: '05f52bda-d391-43cf-9b18-45f6bb1e5b8d',
  title: 'Dívida Técnica',
  description: 'Aprenda a identificar, medir e tratar decisões técnicas que afetam a evolução de software.',
  modules: [
    {
      id: 'f69785c7-e4ff-4814-99f1-264f400ffcb8',
      title: 'Fundamentos',
      description: 'Conceitos centrais para entender o que é dívida técnica e por que ela aparece.',
      progress: 0.34,
      lessons: [
        {
          id: 'b820fdfb-fc97-44ab-945a-8c2ef6874fe5',
          title: 'O que é dívida técnica?',
          xpReward: 20,
          status: 'available',
        },
        {
          id: 'lesson-risk',
          title: 'Juros técnicos',
          xpReward: 25,
          status: 'locked',
        },
      ],
    },
    {
      id: 'f4a0af2a-1d30-41b2-98e4-5c73f9155301',
      title: 'Identificação',
      description: 'Sinais, sintomas e métricas que ajudam a encontrar dívida técnica.',
      progress: 0,
      lessons: [
        {
          id: 'a6d753bb-16ea-44e5-b0c6-a63d7c04fd61',
          title: 'Sinais de alerta',
          xpReward: 25,
          status: 'locked',
        },
      ],
    },
    {
      id: 'c8201aa9-84cb-4695-a8a9-e4db1c401a0c',
      title: 'Estratégias',
      description: 'Formas práticas de priorizar, reduzir e monitorar dívida técnica.',
      progress: 0,
      lessons: [
        {
          id: 'c0336811-7fbc-4bec-96eb-a5280e3c4ae8',
          title: 'Pagando a dívida',
          xpReward: 30,
          status: 'locked',
        },
      ],
    },
  ],
};
