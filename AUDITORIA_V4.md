# Auditoria técnica — Tropa da Lan Web V4

## Validações feitas

- `app.js` validado com `node --check`.
- Todos os IDs usados pelo JavaScript foram comparados com o HTML: nenhuma referência ausente.
- Nenhum ID duplicado no HTML.
- Chaves CSS `{}` balanceadas.
- Teste visual automatizado em 1440×900, 820×1000 e 390×844.
- Sem overflow horizontal nos três tamanhos testados.
- Testes com backend Supabase simulado para:
  - carregamento de servidor;
  - carregamento de canais;
  - carregamento de mensagens;
  - lista de membros;
  - configuração do servidor;
  - editor de cargos;
  - editor de perfil;
  - entrada e saída de canal de voz;
  - presença do próprio usuário no canal de voz;
  - ativação de câmera;
  - ativação de compartilhamento de tela.
- Correção específica do menu mobile para impedir que a barra lateral fique parcialmente visível quando fechada.

## Pontos importantes da arquitetura

- Supabase Auth cuida das senhas.
- PostgreSQL + RLS controlam servidores, membros, canais, cargos e mensagens.
- Supabase Realtime é usado para mensagens, presença e sinalização WebRTC.
- WebRTC transporta áudio/vídeo/tela diretamente entre os navegadores quando possível.
- STUN está configurado; TURN continua recomendado para redes restritas.

## Observação

Nenhum aplicativo de comunicação WebRTC pode ser garantido como “zero bugs” em todos os navegadores, sistemas, permissões de câmera/microfone e tipos de NAT. O código foi revisado e testado nos fluxos disponíveis localmente; TURN é a principal dependência externa que ainda afeta a confiabilidade entre redes diferentes.
