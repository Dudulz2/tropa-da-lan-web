# Tropa da Lan Web — V6 Ultimate

A V6 é uma atualização grande do Tropa da Lan, mantendo a arquitetura simples de publicar no **GitHub Pages** e usando **Supabase** para autenticação, banco, storage e Realtime, além de **WebRTC** para voz, câmera e compartilhamento de tela.

## Principais recursos da V6

### Conta e perfil
- cadastro e login com e-mail + senha;
- recuperação e alteração de senha por e-mail;
- nome de usuário público separado do e-mail;
- avatar, banner, bio, status personalizado;
- presença: online, ausente, não perturbe e invisível;
- exportação básica dos próprios dados;
- opção para encerrar sessões em todos os dispositivos.

### Personalização
- temas Neon, Midnight e OLED;
- cor de destaque personalizada;
- densidade confortável ou compacta;
- opção para reduzir animações;
- sons ativáveis/desativáveis;
- notificações do navegador;
- microfone e câmera preferidos salvos por usuário;
- teste visual de microfone.

### Servidores e canais
- criação de servidores;
- ícone, nome e descrição;
- convites por link;
- canais de texto e voz;
- criar, renomear, reorganizar e excluir canais conforme permissões;
- apelido por servidor;
- cargos, cores e permissões;
- lista de membros e presença;
- eventos do servidor com confirmação de presença;
- moderação com ban/desban e log de auditoria básico.

### Chat
- mensagens em tempo real;
- responder mensagens;
- editar e excluir mensagens;
- reações rápidas;
- fixar/desafixar mensagens;
- painel de mensagens fixadas;
- anexos de até 25 MB;
- imagens e arquivos com preview/link;
- enquetes com votação;
- indicador de digitação;
- pesquisa no canal;
- menções visuais, links clicáveis e código inline;
- notificações e som opcional.

### Social
- pedidos de amizade;
- aceitar/recusar solicitações;
- lista de amigos;
- mensagens privadas entre amigos;
- anexos em DMs;
- atualização em tempo real de DMs e amizades.

### Voz e mídia
- canais de voz por servidor;
- microfone, mute e ensurdecer;
- câmera;
- compartilhamento de tela;
- membros visíveis na call e sob o canal de voz;
- indicador visual de quem está falando;
- volume individual por participante;
- tela cheia por participante com duplo clique;
- seleção de microfone/câmera;
- reconexão WebRTC e tratamento de estados ICE.

### Web / PWA
- layout responsivo para desktop, tablet e celular;
- manifest para instalação como aplicativo web;
- service worker para cache do shell da interface;
- atalhos de teclado, incluindo Ctrl/Cmd+K para busca e atalhos de voz;
- visual profissional com temas e microinterações.

## Atualização do seu projeto atual

Se você **já executou o `supabase_v4.sql` anteriormente**, não execute o arquivo base de novo. Faça somente:

1. Abra o Supabase.
2. Vá em **SQL Editor → New query**.
3. Abra `MIGRATION_V6_ULTIMATE.sql` desta pasta.
4. Copie todo o conteúdo.
5. Cole no SQL Editor e clique em **Run**.
6. No final, confira se a verificação mostra `create_server_rpc_ok = true`.
7. Aguarde alguns segundos para o cache da API do Supabase atualizar.

A migração é aditiva e foi escrita para não apagar servidores, usuários ou mensagens existentes.

### Projeto Supabase totalmente novo

Em um projeto vazio, execute nesta ordem:

1. `supabase_v4.sql`
2. `MIGRATION_V6_ULTIMATE.sql`

## Configuração de autenticação

Durante seus testes, em **Authentication → Sign In / Providers → Email**, deixe a confirmação de e-mail desativada se você não configurou SMTP próprio. O provedor de e-mail interno do Supabase possui limites baixos de envio.

Para a recuperação de senha funcionar no GitHub Pages, em **Authentication → URL Configuration**, adicione o endereço do site como Site URL/Redirect URL, por exemplo:

`https://dudulz2.github.io/tropa-da-lan-web/`

## Publicar no GitHub Pages

Envie para a raiz do repositório:

- `.nojekyll`
- `index.html`
- `styles.css`
- `app.js`
- `config.js`
- `logo.svg`
- `logo-wordmark.svg`
- `icon-192.png`
- `icon-512.png`
- `manifest.webmanifest`
- `sw.js`

Os arquivos `.sql` e `.md` podem permanecer no repositório, mas não são necessários para o navegador executar o site.

Depois do deploy, use **Ctrl + F5**. Como a V6 possui service worker, se o navegador insistir em uma versão antiga, limpe os dados do site/cache uma vez e recarregue.

## Limitações que dependem de infraestrutura externa

A V6 implementa o máximo que é razoável dentro da arquitetura atual, mas alguns recursos da lista de ideias exigem serviços adicionais e não foram simulados com botões falsos:

- **TURN dedicado** para tornar chamadas confiáveis em praticamente qualquer NAT/firewall;
- IA, resumo, transcrição e tradução;
- bots executando 24/7;
- integrações Twitch, YouTube, Spotify, Steam, GitHub etc.;
- push notifications de verdade quando o navegador/app está totalmente fechado;
- vídeo de grande escala/SFU para muitas pessoas simultaneamente;
- gravação e processamento de mídia no servidor.

Veja `ROADMAP_SERVICOS_EXTERNOS.md`.

## Segurança e privacidade

- credenciais secretas nunca devem ser colocadas em `config.js`; use somente a Publishable Key do Supabase;
- RLS continua ativo nas tabelas da V6;
- criação de servidor, amizade, pins e moderação usam RPCs controladas no banco;
- anexos de mensagens usam o bucket `message-files`. Nesta versão ele é público por URL para simplificar a hospedagem estática, então não envie arquivos sigilosos pelo Tropa da Lan até migrarmos anexos para URLs assinadas/bucket privado.

## Auditoria

Leia `AUDITORIA_V6.md` para ver os testes executados e as limitações conhecidas.
