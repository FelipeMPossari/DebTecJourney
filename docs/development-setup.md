# Setup de Desenvolvimento

## Stack Atual

- React Native com Expo para o aplicativo mobile.
- ASP.NET Core Web API para o backend.
- Entity Framework Core para persistência.
- SQLite local para desenvolvimento.
- Conteúdo didático versionado em JSON.

## Ferramentas

Valide no terminal:

```powershell
node --version
npm --version
dotnet --version
adb version
```

Neste ambiente, o projeto já foi validado com:

- Node.js `v24.16.0`
- npm `11.13.0`
- .NET SDK `10.0.300`
- Android SDK Platform Tools `37.0.0`

## API

Executar:

```powershell
cd D:\Development\DebTecJourney
dotnet run --project api --urls "http://localhost:5228"
```

Na primeira execução, a API cria `api/debtecjourney.db` e importa `content/technical-debt-course.json`.

Para validar sem usar a saída `api/bin`, útil quando já existe uma API rodando:

```powershell
dotnet build api\DebTecJourney.Api.csproj -o .build\api-validation
```

## Mobile

Instalar dependências:

```powershell
cd D:\Development\DebTecJourney\mobile
npm.cmd install
```

Executar:

```powershell
npm.cmd start
```

Ou via USB/local:

```powershell
npm.cmd run start:usb
```

## Android Via USB

Com o celular conectado e autorizado:

```powershell
adb devices
adb reverse tcp:8081 tcp:8081
adb reverse tcp:5228 tcp:5228
```

O `adb reverse tcp:5228 tcp:5228` permite que o app no Android acesse a API em `http://localhost:5228`.

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

## Debug

O Expo Go do SDK 56 usa Hermes por padrão. Para abrir o React Native DevTools:

1. Inicie o app no celular.
2. Aguarde a tela do app carregar.
3. No terminal do Expo, pressione `j`.

Para confirmar se o DevTools enxerga o app:

```powershell
Invoke-WebRequest http://127.0.0.1:8081/json/list
```

O retorno precisa listar uma VM `Hermes`.

Se o celular mostrar `java.io.IOException: Failed to download remote update`, force uma abertura limpa:

```powershell
adb shell am force-stop host.exp.exponent
adb shell pm clear host.exp.exponent
adb reverse tcp:8081 tcp:8081
adb reverse tcp:5228 tcp:5228
adb shell am start -a android.intent.action.VIEW -d "exp://127.0.0.1:8081"
```

## Validação

API:

```powershell
dotnet build api\DebTecJourney.Api.csproj -o .build\api-validation
```

Mobile:

```powershell
cd mobile
npm.cmd run typecheck
```
