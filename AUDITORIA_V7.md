# Auditoria técnica — Tropa da Lan V7.0.6 Audit Fix

Data: 2026-09-25

## Resultado

A versão foi revisada com testes estáticos e testes simulados em Chromium. Não foram encontrados erros críticos de JavaScript nos fluxos simulados de inicialização, login carregado, servidor/canais, entrada em call, microfone e transmissão de tela.

## Testes executados

- `app.js`, `v7.js` e `sw.js` validados como módulos JavaScript com `node --check`.
- `manifest.webmanifest` validado como JSON.
- 277 IDs HTML: nenhum duplicado.
- Referências de IDs de `app.js`/`v7.js` conferidas contra o HTML. As referências `loadOlderMessagesBtn`, `media-local` e `v7HomeSummary` são elementos criados dinamicamente.
- Referências locais de HTML para CSS/JS/imagens/manifest conferidas: nenhum arquivo ausente.
- CSS com 1020 pares de chaves balanceados na base auditada.
- Tabelas usadas pelo frontend conferidas contra os SQLs: todas as 17 tabelas utilizadas aparecem nas migrações.
- 11 RPCs usadas pelo frontend conferidas contra os SQLs.
- RLS conferida nas 17 tabelas consumidas pelo frontend.
- Inicialização simulada sem sessão: runtime carregou e tela de login respondeu sem `pageerror`.
- Inicialização simulada com sessão: perfil, preferências, servidor, canais e canal de texto carregaram sem `pageerror`.
- Call simulada: microfone capturado e canal de voz entrou em estado conectado.
- Push-to-Talk/hard mute: hard mute bloqueia PTT; ao desmutar, PTT volta a funcionar normalmente.
- Transmissão simulada: compartilhamento iniciou e seletor alterou 1080p/30 para 720p/15.
- Parâmetros simulados no `RTCRtpSender`: 720p/15 => `maxFramerate=15`, `maxBitrate=2500000` e escala correta a partir de uma fonte maior.
- Baixa largura de banda: 1440p/60 configurado + modo low => alvo limitado a 1280x720/15 FPS/2.5 Mbps.
- ZIP final validado com `unzip -t`.

## Correções adicionais da V7.0.6

1. Service Worker registrado com a versão correta e cache `tropa-v7-shell-6`.
2. Modo baixa largura de banda agora realmente limita também o bitrate.
3. Hard mute separado do Push-to-Talk, impedindo que a tecla PTT reative um microfone explicitamente mutado.
4. Texto da sensibilidade esclarecido: ela controla o indicador visual de fala, não um gate de áudio automático.
5. Interface de moderação esconde ações contra membro de cargo igual/superior.
6. SQL `AUDIT_FIX_V7_0_6.sql` reforça kick, ban, advertência e timeout com hierarquia no próprio banco.
7. `DB_REPAIR_V7.sql` foi endurecido para não rebaixar as proteções de moderação ao ser executado novamente.

## Limitações que continuam reais

- Não existe garantia de “zero bugs” sem teste contra o Supabase real e com pelo menos duas contas/dispositivos reais.
- Sem TURN, WebRTC ainda pode falhar em NAT/firewalls restritivos.
- 1440p/60 exige bastante CPU, upload e rede; o navegador pode adaptar para baixo.
- A qualidade escolhida é um alvo máximo, não uma promessa de resolução/FPS constantes.
- Testes de microfone/câmera reais dependem dos drivers e permissões de cada dispositivo.

## Teste real recomendado após deploy

Usar duas contas em dois navegadores/dispositivos, entrar na mesma call, trocar microfone, testar mute/PTT, compartilhar tela em 720p/15 e 1080p/30, e testar uma rede diferente (por exemplo PC no Wi-Fi e celular no 4G/5G).
