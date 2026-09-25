# Tropa da Lan Web — V7 PRO

Versão consolidada do Tropa da Lan para GitHub Pages + Supabase + WebRTC + PWA.

## Atualização de uma instalação V6

1. No Supabase, abra **SQL Editor > New query**.
2. Execute **somente** `MIGRATION_V7_PRO.sql` uma vez. Ela é aditiva e foi feita para rodar depois da V6.
3. No GitHub Pages, substitua os arquivos do site pela versão V7 (principalmente `index.html`, `app.js`, `v7.js`, `styles.css` e `sw.js`).
4. Faça o commit e espere o deploy do GitHub Pages ficar verde.
5. Abra o site e use Ctrl+F5. Em PWA/celular, feche e reabra o app; se necessário, limpe os dados do site uma vez para remover cache antigo.

> Se o projeto ainda não recebeu a estrutura V6, instale primeiro `supabase_v4.sql`, depois `MIGRATION_V6_ULTIMATE.sql`, e por último `MIGRATION_V7_PRO.sql`.

## Principais melhorias da V7

### Voz e chamadas
- diagnóstico WebRTC com RTT/ping aproximado, jitter, perda de pacotes e tipo de rota ICE;
- reconexão rápida do áudio;
- Push-to-Talk com tecla configurável;
- sensibilidade visual de voz;
- monitor local de microfone (use fones para evitar eco);
- seleção de microfone/saída preservada da V6.1.1;
- painel técnico para copiar diagnóstico;
- modo de baixa largura de banda.

### Transmissão de tela
- perfis de 720p, 1080p e 1440p;
- 15/30/60 FPS quando suportado;
- modos qualidade, equilibrado e fluidez;
- mantém o tratamento contra preview recursivo da própria tela.

### Chat
- arrastar arquivos para o chat e colar imagens/arquivos com Ctrl+V;
- carregar mensagens anteriores em lotes;
- marcador manual de não lidas;
- botão para voltar às mensagens recentes;
- copiar link profundo de uma mensagem;
- busca avançada no canal com filtros `from:`, `before:`, `after:` e `has:`;
- comandos `/help`, `/poll`, `/invite`, `/nick`, `/status`, `/diag`, `/clear`, `/shrug` e `/me`;
- enquetes com duração, múltiplas escolhas e opção anônima.

### Servidores, canais e cargos
- categorias de canais;
- canais privados por cargo, protegidos por RLS;
- canais somente leitura;
- slowmode configurável;
- reorganização de canais;
- hierarquia de cargos reforçada no frontend e no banco;
- templates de servidor;
- banner e cor de destaque do servidor.

### Moderação
- advertências;
- timeout temporário;
- histórico pela estrutura existente de auditoria;
- bloqueios no banco para mensagens durante timeout e canais sem permissão.

### Mobile / PWA / UX
- barra inferior no celular;
- comando rápido Ctrl+K;
- instalação PWA e verificação de atualização;
- versão visível do aplicativo;
- relatório técnico para bugs;
- ícones SVG consistentes nos principais controles de chamada;
- lembretes de eventos enquanto o site/PWA estiver aberto.

## O que ainda exige infraestrutura externa

A V7 continua podendo funcionar com STUN/P2P como antes. Para chamadas confiáveis entre redes mais restritivas, ainda é recomendado adicionar um servidor TURN. TURN, SFU para chamadas grandes, transcrição, tradução, IA e integrações como Twitch/Spotify/Steam não são simuladas por botões falsos nesta versão.

## Auditoria

Consulte `AUDITORIA_V7.md` para os testes realizados e as limitações do ambiente de validação.
