# Tropa da Lan Web — V4.2.1

Versão web com estrutura de comunidade inspirada em aplicativos modernos de chat por servidores, sem copiar marca, logo ou recursos proprietários de terceiros.

## O que entrou nesta versão

### Melhorias visuais V5
- visual mais profissional e refinado;
- botões refeitos com acabamento premium;
- formulários, modais e painéis com estilo mais moderno;
- hierarquia visual, espaçamento e sombras melhorados;
- aparência mais consistente em desktop, tablet e celular.


- Login e cadastro com **e-mail + senha** usando Supabase Auth, mantendo um nome de usuário público separado.
- Perfil persistente com:
  - foto/avatar;
  - nome de exibição;
  - status personalizado;
  - bio.
- Criação de **servidores**.
- Ícone e descrição por servidor.
- Convites por link: `?invite=CODIGO`.
- Validade e limite de usos do convite.
- Canais de **texto** e **voz** criados por servidor.
- Chat em tempo real por canal.
- Lista de membros online/offline.
- Cargos com cor e permissões.
- Atribuição de cargos aos membros.
- Remoção de membros para quem tiver permissão.
- Presença real nos canais de voz: os participantes aparecem abaixo do canal.
- Chamada WebRTC com:
  - microfone;
  - mute;
  - ensurdecer;
  - câmera;
  - compartilhamento de tela;
  - lista visual de participantes;
  - reconexão ICE.
- Layout responsivo para desktop, tablet e celular.
- RLS no Supabase para impedir que usuários comuns alterem servidores/canais/cargos sem permissão.
- Buckets de Storage para avatares e ícones dos servidores.

## Passo obrigatório antes de publicar a V4

Esta versão usa uma estrutura de banco diferente da V3.

### 1. Supabase > SQL Editor

Abra o arquivo:

`supabase_v4.sql`

Copie **todo** o conteúdo e execute no SQL Editor do seu projeto.

O script:

- cria as novas tabelas da V4;
- cria RLS e políticas;
- cria cargos/canais padrão quando um servidor é criado;
- cria funções seguras de convite;
- cria os buckets `avatars` e `server-icons`;
- ativa Realtime nas tabelas usadas pela interface;
- remove as políticas públicas do chat antigo da V3.

Ele **não dá DROP na tabela antiga `messages`**. Os dados antigos continuam no banco, mas a V4 passa a usar `channel_messages`.

### 2. Configurar autenticação por e-mail

A V5 não usa mais e-mails falsos. O cadastro pede um **e-mail real**, um **nome de usuário público** e uma senha. Isso evita o erro de endereço de e-mail inválido do Supabase.

Para testar rapidamente sem depender do envio de mensagens, abra o provedor **Email** em Authentication e deixe **Confirm email** desativado. Assim, a conta recebe uma sessão imediatamente após o cadastro.

Se você quiser exigir confirmação de endereço no futuro, ative **Confirm email** e configure um SMTP apropriado para entregar os e-mails aos usuários.

O e-mail é usado somente para autenticação; no servidor e nas mensagens aparece o nome de usuário/perfil.

### 3. Configuração do projeto

`config.js` já contém o Project URL e a Publishable Key usados nas versões anteriores.

Nunca coloque no frontend:

- Secret key;
- `service_role`;
- senha do banco de dados.

## Publicar no GitHub Pages

Substitua no seu repositório os arquivos da versão antiga pelos arquivos desta pasta:

- `.nojekyll`
- `index.html`
- `styles.css`
- `app.js`
- `config.js`
- `assets/logo.svg`
- `README.md`

O arquivo `supabase_v4.sql` pode ficar no repositório, mas ele não é executado pelo GitHub Pages. Ele deve ser executado manualmente no SQL Editor do Supabase.

Depois faça o commit e aguarde o GitHub Pages concluir o deploy.

Faça `Ctrl + F5` no PC para evitar cache da versão anterior.

## Primeiro teste recomendado

1. Abra o site em uma janela normal.
2. Crie a conta `teste1` com uma senha de pelo menos 6 caracteres.
3. Crie um servidor.
4. Gere um link de convite.
5. Abra o link em uma janela anônima/outro navegador.
6. Crie a conta `teste2`.
7. Aceite o convite.
8. Teste mensagens no `#geral`.
9. Entre com as duas contas no canal `🔊 Geral`.
10. Confira se os dois nomes aparecem abaixo do canal de voz.
11. Teste áudio, câmera e compartilhamento de tela.

## TURN e chamadas em redes diferentes

O arquivo `config.js` já possui servidores STUN. Isso permite conexão direta WebRTC em muitas redes.

Para chamadas funcionarem de forma confiável em praticamente qualquer rede, ainda é recomendado adicionar um **servidor TURN** em `ICE_SERVERS`.

Sem TURN, pode acontecer de:

- chat funcionar normalmente;
- os dois usuários aparecerem na call;
- mas o áudio/vídeo não conseguir criar uma rota entre duas redes mais restritas.

Isso é uma limitação de conectividade WebRTC/NAT, não do GitHub Pages.

## Permissões de cargos disponíveis

- Ver canais
- Enviar mensagens
- Conectar em voz
- Falar
- Criar convites
- Gerenciar mensagens
- Gerenciar canais
- Gerenciar apelidos
- Expulsar membros
- Gerenciar cargos
- Gerenciar servidor
- Administrador

O dono do servidor tem todas as permissões automaticamente.

## Segurança

- Senhas ficam no Supabase Auth; o frontend não grava senha em tabela própria.
- A Publishable Key pode ficar no site porque o acesso aos dados é protegido por RLS.
- Convites são gerados no banco por função segura.
- Usuários não podem editar o `username` público nesta versão; podem alterar o nome de exibição.
- O dono não pode ser removido pela política de membros.
- O cargo `@everyone` não pode ser apagado diretamente.

## Limitações atuais

Para ficar ainda mais completo no futuro, ainda podem entrar:

- mensagens privadas/DM;
- categorias de canais;
- permissões específicas por canal;
- reações e respostas a mensagens;
- anexos de arquivos/imagens;
- notificações;
- bots;
- recuperação de senha por e-mail (próxima melhoria);
- moderação avançada e logs;
- TURN próprio para maior confiabilidade das chamadas.


## Correção V4.2.1

- Logo principal e ícones também ficam na raiz do projeto para evitar caminhos quebrados no GitHub Pages.
- Cadastro mostra uma mensagem clara quando o Supabase retorna limite de e-mail/cadastro (HTTP 429).
- O botão de cadastro entra em espera por 60 s após rate limit para evitar novas tentativas repetidas.
- Para testes no plano gratuito, desative **Confirm email** em Supabase → Authentication → Providers → Email.
