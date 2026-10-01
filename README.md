# Tropa da Lan — Android V7.3.9 Native Screen

Aplicativo Android do Tropa da Lan com **compartilhamento de tela nativo**.

## O que mudou

A versão anterior dependia de `navigator.mediaDevices.getDisplayMedia()`, que não é disponibilizado de forma confiável pelo Chrome/WebView no Android. Nesta versão o app usa:

- `MediaProjection` do Android para capturar a tela;
- `VirtualDisplay` + `ImageReader` para receber os frames;
- serviço em primeiro plano (`mediaProjection`) para manter a captura ativa;
- ponte Java ↔ JavaScript (`TropaNativeScreen`);
- `canvas.captureStream()` dentro do WebView para transformar os frames nativos em uma `MediaStreamTrack` que o WebRTC atual do Tropa da Lan consegue enviar aos outros participantes.

A página web continua sendo carregada de:

`https://dudulz2.github.io/tropa-da-lan-web/`

## Como usar

1. Entre normalmente no Tropa da Lan pelo aplicativo Android.
2. Entre em um canal de voz.
3. Toque em **Compartilhar tela**.
4. O Android mostrará a caixa oficial de permissão de captura.
5. Confirme **Iniciar agora**.
6. A tela será entregue ao WebRTC da própria interface do Tropa da Lan.
7. Para encerrar, toque novamente no botão de compartilhamento ou use **Parar** na notificação do Android.

## Características da captura

- resolução adaptativa, limitada a até 1280 px no lado maior por padrão;
- 5–15 FPS (10 FPS padrão) para manter estabilidade no WebView;
- JPEG otimizado enviado pela ponte nativa;
- descarte de frames atrasados para não acumular atraso;
- redimensionamento automático ao girar o celular;
- fundo preto/letterbox para preservar proporção e evitar distorção;
- a call de voz continua usando o WebRTC já existente no site.

## Limitação atual

A transmissão nativa desta versão compartilha **vídeo da tela**. O áudio interno do Android ainda não é injetado no `MediaStream` do WebView. O microfone da chamada continua funcionando normalmente.

## Compilar no Android Studio

1. Abra a pasta do projeto no Android Studio.
2. Aguarde o Gradle Sync.
3. Use **Build > Build APK(s)**.
4. O APK debug será criado em:

`app/build/outputs/apk/debug/app-debug.apk`

## Compilar no GitHub

O projeto mantém `.github/workflows/build-apk.yml`.

1. Envie esta pasta para um repositório GitHub.
2. Abra **Actions**.
3. Execute **Build Android APK**.
4. Baixe o artefato `Tropa-da-Lan-Android-debug`.

## Versão

Android: **7.3.9**
