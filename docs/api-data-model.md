# Modelo de Dados e API

## Entidades principais

### User

Representa o usuário do aplicativo.

Campos sugeridos:

- id
- name
- email
- passwordHash
- totalXp
- currentLevel
- createdAt

### Course

Representa uma trilha ou curso.

Campos sugeridos:

- id
- title
- description
- order
- isPublished

### Module

Agrupa lições dentro de uma trilha.

Campos sugeridos:

- id
- courseId
- title
- description
- order

### Lesson

Representa uma lição curta.

Campos sugeridos:

- id
- moduleId
- title
- content
- order
- xpReward

### Question

Representa uma pergunta associada a uma lição.

Campos sugeridos:

- id
- lessonId
- statement
- explanation
- type
- order

### AnswerOption

Representa uma alternativa de resposta.

Campos sugeridos:

- id
- questionId
- text
- isCorrect
- feedback

### UserProgress

Registra o progresso do usuário.

Campos sugeridos:

- id
- userId
- lessonId
- status
- score
- completedAt

### UserAnswer

Registra uma resposta dada pelo usuário.

Campos sugeridos:

- id
- userId
- questionId
- answerOptionId
- isCorrect
- answeredAt

### Achievement

Representa uma conquista.

Campos sugeridos:

- id
- title
- description
- icon
- conditionType
- conditionValue

### UserAchievement

Relaciona usuários e conquistas desbloqueadas.

Campos sugeridos:

- id
- userId
- achievementId
- unlockedAt

## Endpoints iniciais

### Autenticação

```http
POST /api/auth/register
POST /api/auth/login
GET /api/auth/me
```

### Cursos e conteúdo

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
GET /api/users/me/progress
POST /api/lessons/{lessonId}/complete
POST /api/questions/{questionId}/answer
```

### Gamificação

```http
GET /api/users/me/xp
GET /api/users/me/achievements
```

## Observações para implementação

- O backend deve expor dados em JSON.
- A autenticação pode usar JWT.
- O conteúdo inicial pode ser inserido com seed no banco.
- A primeira versão pode usar regras simples de XP.
- O painel administrativo web pode ficar fora do MVP.

