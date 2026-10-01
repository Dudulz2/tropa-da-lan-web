# Arquitetura do compartilhamento nativo

Fluxo:

1. O site chama `navigator.mediaDevices.getDisplayMedia()`.
2. O app injeta um shim que redireciona essa chamada para `TropaNativeScreen.requestCapture()`.
3. `MainActivity` abre a permissão oficial `MediaProjectionManager.createScreenCaptureIntent()`.
4. `ScreenCaptureService` inicia como foreground service do tipo `mediaProjection`.
5. A tela é renderizada em um `VirtualDisplay` ligado a um `ImageReader` RGBA.
6. O serviço converte o frame para JPEG e envia somente o frame mais recente para o WebView.
7. O JavaScript desenha os frames em um canvas invisível.
8. `canvas.captureStream()` cria uma trilha de vídeo WebRTC normal.
9. O código web existente usa essa trilha no mesmo fluxo de `replaceTrack()`/renegociação usado no PC.

Isso evita depender de `getDisplayMedia()` do Chrome Android.
