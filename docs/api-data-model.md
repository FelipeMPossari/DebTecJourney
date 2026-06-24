# Modelo de Dados e API

## Decisão de Conteúdo

O conteúdo didático fica em arquivos versionados e é importado pela API para o banco local.

Fonte editorial atual:

```text
content/technical-debt-course.json
```

Essa abordagem permite revisar lições com Git, reaproveitar material da monografia e ainda manter progresso, respostas, XP e usuários no banco de dados.

## Banco Atual

No ambiente de desenvolvimento, a API usa SQLite com Entity Framework Core.

Arquivo gerado em execução:

```text
api/debtecjourney.db
```

Esse arquivo é recriado automaticamente se não existir.

## Entidades Implementadas

### ApplicationUser

- id
- name
- email
- passwordHash
- totalXp
- currentLevel
- createdAt

### Course

- id
- title
- description
- order
- isPublished

### LearningModule

- id
- courseId
- title
- description
- order

### Lesson

- id
- moduleId
- title
- summary
- content
- order
- xpReward

### LessonPage

- id
- lessonId
- title
- body
- highlight
- order

### Question

- id
- lessonId
- statement
- explanation
- order

### AnswerOption

- id
- questionId
- text
- isCorrect
- feedback

### UserProgress

- id
- userId
- lessonId
- status
- score
- xpEarned
- completedAt

### UserAnswer

- id
- userId
- questionId
- answerOptionId
- isCorrect
- answeredAt

## Endpoints Implementados

### Sistema

```http
GET /api/health
```

### Autenticação

```http
POST /api/auth/register
POST /api/auth/login
GET /api/auth/me
```

### Cursos e Conteúdo

```http
GET /api/courses
GET /api/courses/{courseId}
GET /api/courses/{courseId}/modules
GET /api/modules/{moduleId}/lessons
GET /api/lessons/{lessonId}
GET /api/lessons/{lessonId}/questions
```

### Progresso

```http
GET /api/users/me/course-overview
POST /api/questions/{questionId}/answer
```

`GET /api/users/me/course-overview` retorna a trilha publicada com XP, nível, percentual de dívida reduzida e status das lições.

`POST /api/questions/{questionId}/answer` registra a resposta, conclui a lição quando a alternativa está correta e atualiza XP do usuário.

## Próximos Pontos

- Adicionar conquistas.
- Adicionar revisão inteligente.
- Adicionar simulação final de projeto.
- Trocar SQLite por PostgreSQL se o projeto precisar de deploy multiusuário.
- Criar painel administrativo somente se a edição de conteúdo via arquivo ficar insuficiente.
