# Roadmap — recursos que precisam de serviços externos

A base do Tropa da Lan V6 já deixa o projeto preparado para evoluir, mas os itens abaixo precisam de infraestrutura além de GitHub Pages + Supabase.

## Voz e transmissão em nível de produção
- servidor TURN autenticado;
- opcionalmente SFU (LiveKit, mediasoup, Janus ou equivalente) para calls maiores;
- telemetria de jitter, perda de pacotes e bitrate;
- seleção dinâmica de qualidade de vídeo.

## Notificações push reais
- Web Push/VAPID ou serviço equivalente;
- backend/Edge Function para disparos quando o usuário está offline.

## Bots e automações
- runtime 24/7 para bots;
- tokens e permissões específicas;
- webhooks e filas de eventos.

## IA
- resumo de canais/calls;
- transcrição;
- tradução;
- pesquisa semântica;
- assistente do servidor;
- moderação assistida, sempre com revisão humana em ações importantes.

## Integrações
- Twitch/YouTube;
- Spotify;
- Steam/jogos;
- GitHub;
- calendários externos.

## Mídia privada e escala
- anexos privados com URLs assinadas;
- thumbnails e compressão no servidor;
- CDN;
- antivírus/verificação de uploads;
- limites e cotas por servidor/usuário.
