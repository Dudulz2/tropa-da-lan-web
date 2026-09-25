# Auditoria V6.1 — Áudio

Verificações realizadas:

- `node --check app.js`: aprovado;
- referências de IDs JavaScript x HTML: 208/208, nenhuma referência ausente;
- IDs duplicados no HTML: nenhum;
- funções JavaScript duplicadas: nenhuma;
- chaves CSS `{}` balanceadas: aprovado;
- fallback para dispositivo de áudio inexistente implementado;
- troca de track via `RTCRtpSender.replaceTrack` implementada;
- mute preservado durante troca de microfone;
- Opus priorizado apenas quando suportado, com fallback seguro;
- ajuste de bitrate protegido por `try/catch` para navegadores que não aceitam o parâmetro;
- `devicechange` tratado para atualizar microfones conectados/removidos.

Observação: qualidade final depende do microfone, navegador, rede e processamento do sistema operacional. TURN melhora conectividade, não a qualidade intrínseca do microfone.
