# DebTec Journey

Aplicativo mobile gamificado para apoiar o ensino de dívida técnica em engenharia de software.

O projeto transforma conceitos, problemas, métricas e estratégias de gestão de dívida técnica em uma experiência de aprendizagem curta, progressiva e interativa, inspirada em aplicativos como Duolingo, mas adaptada ao contexto de engenharia de software.

## Objetivo do TCC

Desenvolver e avaliar uma aplicação mobile gamificada para auxiliar estudantes e profissionais iniciantes a compreenderem dívida técnica, seus impactos e formas de identificação, medição e tratamento.

## Arquitetura

```text
React Native / Expo
        |
        | REST API
        v
ASP.NET Core Web API
        |
        | Entity Framework Core
        v
SQLite local no desenvolvimento
        ^
        | importação inicial
content/technical-debt-course.json
```

## Estrutura

```text
content/    Conteúdo versionado das trilhas, módulos, lições, páginas e quizzes
docs/       Documentação do produto, TCC, requisitos e API
mobile/     Aplicativo React Native com Expo
api/        Backend ASP.NET Core Web API
```

## Como Executar

### API

```powershell
dotnet run --project api --urls "http://localhost:5228"
```

Na primeira execução, a API cria o banco SQLite `api/debtecjourney.db` e importa o conteúdo de `content/technical-debt-course.json`.

Endpoints principais:

```http
GET /api/health
POST /api/auth/register
POST /api/auth/login
GET /api/auth/me
GET /api/courses
GET /api/courses/{courseId}
GET /api/courses/{courseId}/modules
GET /api/modules/{moduleId}/lessons
GET /api/lessons/{lessonId}
GET /api/lessons/{lessonId}/questions
GET /api/users/me/course-overview
POST /api/questions/{questionId}/answer
```

### Mobile

```powershell
cd mobile
npm.cmd start
```

O app abre primeiro em uma tela de login conectada à API. Para o primeiro acesso, informe um e-mail válido, uma senha com pelo menos 4 caracteres e toque em `Criar conta`. Depois disso, use `Entrar` com a mesma conta.

Depois do login, a navegação principal usa um drawer lateral à esquerda com as abas:

- Início
- Configurações

Na aba de Configurações, o usuário pode alternar entre tema claro e escuro. Na primeira abertura, o app usa o tema atual do celular; depois disso, a escolha do usuário é salva localmente no dispositivo.

Também é possível habilitar entrada com biometria em Configurações. A sessão é salva com `expo-secure-store`, e a biometria desbloqueia a sessão armazenada no aparelho.

## Android Via USB

Com o celular conectado e autorizado na depuração USB:

```powershell
adb devices
adb reverse tcp:8081 tcp:8081
adb reverse tcp:5228 tcp:5228
```

Em um terminal, suba a API:

```powershell
dotnet run --project api --urls "http://localhost:5228"
```

Em outro terminal, suba o Expo:

```powershell
cd mobile
$env:NODE_OPTIONS = "--dns-result-order=ipv4first"
npm.cmd run start:usb
```

Quando o Metro abrir, pressione `a`.

Se o Expo Go mostrar `java.io.IOException: Failed to download remote update`, force uma abertura limpa pela URL USB:

```powershell
adb shell am force-stop host.exp.exponent
adb shell pm clear host.exp.exponent
adb reverse tcp:8081 tcp:8081
adb reverse tcp:5228 tcp:5228
adb shell am start -a android.intent.action.VIEW -d "exp://127.0.0.1:8081"
```

## Primeiro MVP

O MVP foca na experiência principal de aprendizagem:

- Cadastro e login reais
- Trilha de conteúdo sobre dívida técnica
- Lições curtas organizadas em páginas
- Quiz apenas no final da lição
- Feedback imediato
- Pontuação/XP
- Progresso do usuário salvo no backend
- Tema claro/escuro e biometria local

## Documentação

- [Visão do Produto](docs/product-vision.md)
- [MVP e Roadmap](docs/mvp-roadmap.md)
- [Modelo de Dados e API](docs/api-data-model.md)
- [Setup de Desenvolvimento](docs/development-setup.md)
