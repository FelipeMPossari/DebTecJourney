# Setup de Desenvolvimento

Este projeto foi pensado para ser desenvolvido com:

- React Native com Expo para o aplicativo mobile
- ASP.NET Core Web API para o backend
- Entity Framework Core para acesso ao banco de dados
- PostgreSQL ou SQL Server como banco relacional

## Ferramentas necessárias

### Node.js

Instale a versão LTS do Node.js.

Em 1 de junho de 2026, a versão LTS indicada no site oficial é Node.js 24.

Download oficial:

https://nodejs.org/en/download

Após instalar, valide:

```powershell
node --version
npm --version
```

Status neste ambiente:

- Node.js instalado: `v24.16.0`
- npm instalado: `11.13.0`
- npx instalado: `11.13.0`

Observação: se `node` ou `npm` não forem reconhecidos em um terminal já aberto, reinicie o terminal ou o VS Code para carregar o `PATH` atualizado.

### .NET SDK

Instale a versão LTS do .NET SDK.

Em 1 de junho de 2026, a versão LTS ativa recomendada é .NET 10.

Download oficial:

https://dotnet.microsoft.com/download

Após instalar, valide:

```powershell
dotnet --version
```

Status neste ambiente:

- .NET SDK instalado: `10.0.300`

### Expo

Depois de instalar Node.js, o aplicativo pode ser executado com Expo.

Comandos:

```powershell
cd mobile
npx expo start
```

### Backend

Depois de instalar o .NET SDK, a API pode ser executada com:

```powershell
dotnet run --project api
```

## Próxima etapa técnica

Com a estrutura inicial criada, os próximos passos são:

1. Conectar a tela mobile aos endpoints da API.
2. Criar o fluxo de lição e quiz.
3. Adicionar persistência com banco de dados.
4. Implementar autenticação.
5. Salvar XP e progresso do usuário.
