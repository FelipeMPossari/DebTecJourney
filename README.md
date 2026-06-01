# DebTec Journey

Aplicativo mobile gamificado para apoiar o ensino de dívida técnica em engenharia de software.

O projeto tem como objetivo transformar conceitos, problemas, métricas e estratégias de gestão de dívida técnica em uma experiência de aprendizagem curta, progressiva e interativa, inspirada em aplicativos como Duolingo, mas adaptada ao contexto de engenharia de software.

## Objetivo do TCC

Desenvolver e avaliar uma aplicação mobile gamificada para auxiliar estudantes e profissionais iniciantes a compreenderem dívida técnica, seus impactos e formas de identificação, medição e tratamento.

## Proposta de arquitetura

```text
React Native / Expo
        |
        | REST API
        v
ASP.NET Core Web API
        |
        | Entity Framework Core
        v
PostgreSQL ou SQL Server
```

## Estrutura planejada

```text
docs/       Documentação do produto, TCC, requisitos e API
mobile/     Aplicativo React Native com Expo
api/        Backend ASP.NET Core Web API
```

## Como executar

### API

```powershell
dotnet run --project api
```

Endpoints iniciais:

```http
GET /api/health
GET /api/courses
GET /api/courses/{courseId}
GET /api/courses/{courseId}/modules
GET /api/modules/{moduleId}/lessons
GET /api/lessons/{lessonId}
GET /api/lessons/{lessonId}/questions
POST /api/questions/{questionId}/answer
```

### Mobile

```powershell
cd mobile
npm start
```

O Expo abrirá as opções para rodar no Android, iOS ou navegador.

## Primeiro MVP

O MVP deve focar na experiência principal de aprendizagem:

- Trilhas de conteúdo sobre dívida técnica
- Lições curtas
- Perguntas de múltipla escolha
- Feedback imediato
- Pontuação/XP
- Progresso do usuário
- Conquistas simples

## Documentação

- [Visão do Produto](docs/product-vision.md)
- [MVP e Roadmap](docs/mvp-roadmap.md)
- [Modelo de Dados e API](docs/api-data-model.md)
- [Setup de Desenvolvimento](docs/development-setup.md)
