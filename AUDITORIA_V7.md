# Auditoria técnica — Tropa da Lan V7.0.1 PRO

Data da revisão: 2026-09-25

## Verificações concluídas

- `app.js` validado com `node --check`.
- `v7.js` validado com `node --check`.
- IDs HTML verificados: nenhum ID duplicado.
- Referências estáticas `$("#id")` verificadas contra o HTML. As referências `loadOlderMessagesBtn` e `v7HomeSummary` são criadas dinamicamente pelo próprio `v7.js`.
- Nenhuma função declarada em duplicidade entre `app.js` e `v7.js`.
- Chaves CSS balanceadas.
- `manifest.webmanifest` parseado como JSON válido.
- Ordem de carregamento: `config.js` → `app.js` → `v7.js`.
- Service Worker usa cache `tropa-v7-shell-1` e inclui `v7.js`.
- `MIGRATION_V7_PRO.sql` revisada para os campos consumidos pela interface V7.
- A migração inclui canais privados com checagem RLS, categorias, read-only, slowmode, timeout, notificações por servidor, advertências e hierarquia de cargos.
- Enquetes de múltipla escolha usam chave primária `(message_id,user_id,option_index)`.
- ZIP final validado com `unzip -t`.

## Pontos críticos

### Chamadas
A V7 mantém o fluxo de áudio dedicado da V6.1.1 e acrescenta diagnóstico via `RTCPeerConnection.getStats()`, Push-to-Talk, reconexão de áudio, monitor local e controles rápidos de qualidade de transmissão. O navegador continua responsável pela negociação WebRTC/Opus.

### Canais privados
A privacidade não depende apenas de esconder canais na interface. A função `can_view_channel()` é usada nas políticas RLS para canais, mensagens, reações e votos.

### Cargos
A migração adiciona `highest_role_position()` e `can_manage_role()` para impedir gerenciamento de cargos acima da própria hierarquia. O dono do servidor continua com autoridade máxima.

### PWA
O Service Worker usa um cache de versão nova e estratégia network-first para arquivos principais, reduzindo o risco de celular permanecer preso em CSS/JS antigo.

## Limitação da auditoria

A validação feita aqui é estática e de estrutura. Não foi possível executar um teste E2E completo contra o Supabase real com duas contas, microfones/câmeras reais e redes diferentes. Portanto, a versão não é apresentada como “zero bugs”.

## Testes recomendados depois do deploy

1. Entrar com duas contas em navegadores diferentes.
2. Executar `MIGRATION_V7_PRO.sql` e confirmar a linha `Tropa V7 PRO instalada`.
3. Criar categoria e canal privado; confirmar bloqueio para usuário sem cargo permitido.
4. Testar canal somente leitura e slowmode.
5. Criar/reordenar cargos e tentar editar cargo acima da hierarquia.
6. Aplicar advertência e timeout.
7. Entrar em call, trocar microfone/saída, testar Push-to-Talk e diagnóstico.
8. Compartilhar tela em 720p/1080p/1440p e 15/30/60 FPS conforme suporte do navegador.
9. Testar drag-and-drop, Ctrl+V, busca avançada, comandos e histórico do chat.
10. Testar a barra inferior no celular e instalação PWA.
