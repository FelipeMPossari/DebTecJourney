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

### Android via USB

Para testar o aplicativo em um celular Android via USB, é necessário ter o Android SDK Platform Tools instalado.

Status neste ambiente:

- Android SDK Platform Tools instalado: `37.0.0`
- `adb.exe` instalado em:

```text
C:\Users\felip\AppData\Local\Microsoft\WinGet\Packages\Google.PlatformTools_Microsoft.Winget.Source_8wekyb3d8bbwe\platform-tools\adb.exe
```

Se `adb` não for reconhecido em um terminal já aberto, reinicie o terminal ou use o caminho completo acima.

Se o Expo mostrar erro dizendo que não encontrou o Android SDK, configure as variáveis de ambiente do usuário:

```powershell
$platformTools = "$env:LOCALAPPDATA\Microsoft\WinGet\Packages\Google.PlatformTools_Microsoft.Winget.Source_8wekyb3d8bbwe\platform-tools"
$sdkRoot = Split-Path $platformTools -Parent

[Environment]::SetEnvironmentVariable('ANDROID_HOME', $sdkRoot, 'User')
[Environment]::SetEnvironmentVariable('ANDROID_SDK_ROOT', $sdkRoot, 'User')

$userPath = [Environment]::GetEnvironmentVariable('Path', 'User')
[Environment]::SetEnvironmentVariable('Path', "$userPath;$platformTools", 'User')
```

Depois disso, reinicie o terminal ou o VS Code.

Comandos úteis:

```powershell
adb devices
adb reverse tcp:5228 tcp:5228
cd mobile
npm.cmd start -- --localhost
```

Se o aparelho aparecer como `unauthorized`, desbloqueie o celular e aceite a solicitação "Permitir depuração USB?".

O comando `adb reverse tcp:5228 tcp:5228` permite que o Android conectado via USB acesse a API local do computador em `http://localhost:5228`.

Para reiniciar o Expo de forma limpa pelo USB:

```powershell
adb devices
adb reverse tcp:8081 tcp:8081
cd mobile
$env:NODE_OPTIONS = '--dns-result-order=ipv4first'
npm.cmd start -- --localhost --clear
```

Depois que o Metro abrir, pressione `a`. Se o React Native DevTools disser que não há apps compatíveis conectados, primeiro confirme se o app abriu no celular; logs de erro de JavaScript aparecem no terminal do Metro.

O Expo Go do SDK 56 usa Hermes por padrão. Para confirmar se o DevTools consegue enxergar a aplicação, execute com o app aberto:

```powershell
Invoke-WebRequest http://127.0.0.1:8081/json/list
```

O retorno precisa listar uma VM `Hermes`. Se vier vazio, recarregue o app com `r` no terminal do Expo ou reinicie o Metro com `npm.cmd run start:usb`.

Se o celular mostrar `java.io.IOException: Failed to download remote update`, confirme no computador:

```powershell
Invoke-WebRequest http://127.0.0.1:8081/status
```

Esse endereço precisa responder `200`. Se responder apenas em `localhost`, mantenha o `NODE_OPTIONS` acima antes de iniciar o Expo.

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
