# Tropa da Lan Web

Versão web do protótipo Tropa da Lan para GitHub Pages + Supabase + WebRTC.

## O que funciona

- Chat em tempo real por canais (`#geral`, `#jogos` e `#off-topic`)
- Presença de usuários online
- Canal de voz Geral
- Microfone com mute/desmute
- Câmera
- Compartilhamento de tela quando o navegador oferece `getDisplayMedia`
- Layout responsivo para PC e celular
- Menu lateral em formato de gaveta no celular
- Visualização dos participantes da chamada
- Sinalização WebRTC usando Supabase Realtime

## Correções e robustez desta versão (V3)

- Corrigido o layout que deformava o chat e o campo de mensagem
- Corrigido o menu mobile que espremia a interface em uma coluna de 76 px
- Câmera e controles de voz não são mais escondidos no celular
- Chamada agora aguarda o canal Realtime ficar realmente inscrito antes de indicar conexão
- Fila de ICE candidates para evitar erro quando chegam antes do SDP remoto
- Negociação WebRTC mais resistente a ofertas simultâneas
- Transceiver de vídeo criado desde o começo da chamada, permitindo alternar câmera/tela sem recriar a conexão
- Tentativa automática de reinício de ICE quando a conexão falha
- Compartilhamento de tela restaura a câmera ao terminar
- Detecção de navegadores sem suporte a compartilhamento de tela

- Corrigida corrida ao trocar canais de texto rapidamente
- Corrigido cancelamento da chamada enquanto ela ainda está conectando
- Proteção contra cliques simultâneos em câmera e compartilhamento de tela
- Corrigido caso em que a câmera encerrava durante uma transmissão e podia cortar a tela compartilhada
- IDs de sessão agora são sempre novos por carregamento, evitando colisões entre abas duplicadas
- Tratamento de microfone desconectado durante a chamada
- Reconexão ICE com limite de tentativas e aviso quando a rede provavelmente exige TURN
- Estado de mídia remoto preservado mesmo quando chega antes da criação do peer
- Painel de membros corrigido em tablet/mobile para não ficar atrás do backdrop
- Envio de mensagem protegido contra clique duplo e troca de canal durante a requisição
- Presença Supabase com tratamento de falha e status visual
- Limpeza mais segura de streams, peers e canais ao sair/fechar a página

## Publicação no GitHub Pages

Envie todos os arquivos desta pasta para a raiz do repositório. Depois, em `Settings > Pages`, use:

- Source: `Deploy from a branch`
- Branch: `main`
- Folder: `/(root)`

O GitHub Pages usa HTTPS, necessário para microfone, câmera e compartilhamento de tela.

## Teste da chamada

1. Abra o site no computador em uma janela normal.
2. Abra o mesmo link em outro computador/celular ou em outro navegador.
3. Use nomes diferentes.
4. Clique em entrar na chamada nos dois dispositivos.
5. Permita o microfone.
6. Teste mute/desmute.
7. No computador, ligue a câmera.
8. No computador, teste compartilhar a tela.

## Importante sobre STUN e TURN

O projeto já usa STUN. Isso permite chamadas diretas em muitas redes, mas não em todas.

Se duas pessoas estiverem em redes com NAT/firewall restritivo, uma conexão apenas com STUN pode não fechar. Para confiabilidade parecida com Discord/Meet, configure também um servidor TURN em `config.js`.

O código já está preparado para receber TURN; basta adicionar `urls`, `username` e `credential` em `ICE_SERVERS`.

## Compartilhamento de tela no celular

A disponibilidade depende do navegador/sistema. Em navegadores móveis que não expõem `getDisplayMedia`, o botão fica desativado. Para compartilhar a tela, a experiência mais confiável é usar Chrome ou Edge atualizados no computador.
