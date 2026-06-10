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

O app abre primeiro em uma tela de login local. Nesta fase, o login aceita qualquer e-mail válido e senha com pelo menos 4 caracteres. A autenticação real será conectada à API em uma etapa posterior.

Depois do login, a navegação principal usa um drawer lateral à esquerda com as abas:

- Início
- Configurações

O usuário pode sair para a tela de login pelo drawer ou pela seção Sessão na tela de Configurações.

Na aba de Configurações, o usuário pode alternar entre tema claro e escuro. Na primeira abertura, o app usa o tema atual do celular; depois disso, a escolha do usuário é salva localmente no dispositivo.

Também é possível habilitar entrada com biometria em Configurações. Para usar:

1. Entre uma vez com e-mail e senha.
2. Acesse Configurações.
3. Ative "Entrar com biometria".
4. Saia pelo drawer.
5. Use o botão "Entrar com biometria" na tela de login.

No Expo Go, a biometria funciona no Android. Para Face ID no iOS, a documentação do Expo indica usar uma development build.

### Teste no Android via USB

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
npm.cmd start -- --localhost --clear
```

Quando o Metro abrir, pressione `a`.

### Debug com React Native DevTools

O Expo Go no SDK 56 já usa Hermes por padrão. Para abrir o DevTools:

1. Inicie o app no celular.
2. Aguarde a tela do app carregar.
3. No terminal do Expo, pressione `j`.

Se aparecer `No compatible apps connected`, teste:

```powershell
Invoke-WebRequest http://127.0.0.1:8081/json/list
```

O retorno precisa conter uma entrada com `"vm": "Hermes"`. Se vier vazio, reinicie o Expo com:

```powershell
adb reverse tcp:8081 tcp:8081
cd mobile
$env:NODE_OPTIONS = "--dns-result-order=ipv4first"
npm.cmd run start:usb
```

Também é possível abrir o menu de desenvolvedor no Android conectado por USB:

```powershell
adb shell input keyevent 82
```

Se o Expo Go mostrar `java.io.IOException: Failed to download remote update`, force uma abertura limpa pela URL USB:

```powershell
adb shell am force-stop host.exp.exponent
adb shell pm clear host.exp.exponent
adb reverse tcp:8081 tcp:8081
adb reverse tcp:5228 tcp:5228
adb shell am start -a android.intent.action.VIEW -d "exp://127.0.0.1:8081"
```

## Primeiro MVP

O MVP deve focar na experiência principal de aprendizagem:

- Trilhas de conteúdo sobre dívida técnica
- Lições curtas
- Conteúdo organizado em páginas antes do quiz
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
