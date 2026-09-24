# Auditoria técnica — Tropa da Lan Web V3

## Verificações executadas

- JavaScript validado como módulo ES com `node --input-type=module --check`.
- `config.js` validado sintaticamente com Node.
- JavaScript submetido também ao parser/checker do TypeScript em modo `checkJs` com DOM/ES2022.
- HTML verificado para IDs duplicados e para todos os IDs referenciados pelo JavaScript.
- CSS analisado com parser `tinycss2`, sem erros de sintaxe.
- Recursos locais referenciados pelo HTML conferidos (`app.js`, `config.js`, `styles.css`, `assets/logo.svg`).
- SQL revisado para criação da tabela, índice, RLS, políticas de leitura/inserção e publicação Realtime.

## Falhas lógicas corrigidas

1. Corrida ao trocar rapidamente entre canais de texto.
2. Possibilidade de uma entrada na call continuar depois de o usuário mandar sair durante a conexão.
3. Candidatos ICE chegando antes da descrição remota.
4. Ofertas WebRTC simultâneas (perfect negotiation).
5. Reconexão ICE em falha/desconexão, com limite para evitar loop infinito.
6. Câmera encerrando durante screen share e substituindo indevidamente a faixa compartilhada.
7. Cliques concorrentes em câmera/transmissão.
8. Limpeza de tracks e peers ao sair da chamada ou fechar a página.
9. Colisão de client_id entre abas duplicadas/recarregadas.
10. Backdrop cobrindo o painel de membros em telas intermediárias.
11. Duplo envio de mensagens.
12. Resultado atrasado de um canal antigo aparecendo depois de trocar de canal.
13. Perda física do microfone durante uma chamada.
14. Estado de mídia remoto recebido antes da criação do peer.

## Limitação externa que não é bug de código

O projeto usa STUN por padrão. WebRTC ponto a ponto não consegue atravessar todos os tipos de NAT/firewall apenas com STUN. Para a chamada funcionar com confiabilidade alta em redes restritivas, configure um servidor TURN em `config.js`. Sem TURN, nenhum código frontend consegue garantir conexão entre 100% das redes.

O compartilhamento de tela também depende de `getDisplayMedia`, que não é disponibilizado por todos os navegadores móveis.
