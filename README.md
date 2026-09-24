# Tropa da Lan Web

MVP web inspirado no protótipo desktop do Tropa da Lan. Roda diretamente no navegador, com GitHub Pages no frontend, Supabase para chat/presença/sinalização e WebRTC para voz, câmera e compartilhamento de tela.

## O que já funciona

- Nome de usuário salvo no navegador
- Canais de texto: `#geral`, `#jogos` e `#off-topic`
- Histórico de mensagens no Supabase
- Mensagens em tempo real
- Lista de usuários online
- Canal de voz
- Microfone / silenciar
- Câmera opcional
- Compartilhamento de tela
- WebRTC ponto a ponto
- Layout responsivo inspirado em apps de comunidade

## Arquitetura

```text
GitHub Pages
  └─ HTML + CSS + JavaScript
         │
         ├─ Supabase Postgres -> mensagens
         ├─ Supabase Realtime -> presença + sinalização WebRTC
         └─ WebRTC -> áudio, vídeo e tela entre os navegadores
```

> O GitHub Pages hospeda apenas o frontend. O Supabase é o serviço em tempo real. O áudio/vídeo/tela usam WebRTC.

---

# 1. Criar o projeto no Supabase

1. Entre em `https://supabase.com` e crie uma conta.
2. Clique em **New project**.
3. Escolha uma organização, nomeie o projeto (por exemplo `tropa-da-lan`) e crie uma senha forte para o banco.
4. Aguarde o projeto ficar pronto.

## Criar a tabela do chat

1. No menu do Supabase, abra **SQL Editor**.
2. Clique em **New query**.
3. Abra o arquivo `supabase.sql` deste projeto.
4. Copie todo o conteúdo e cole no SQL Editor.
5. Clique em **Run**.

## Pegar URL e Publishable Key

1. No Supabase, abra a área **Connect** do seu projeto (ou Project Settings/API, dependendo da interface).
2. Copie o **Project URL**.
3. Copie a **Publishable Key**, que começa normalmente com `sb_publishable_`.
4. Abra `config.js` e substitua:

```js
SUPABASE_URL: "https://SEU-PROJETO.supabase.co",
SUPABASE_PUBLISHABLE_KEY: "sb_publishable_COLE_SUA_CHAVE_AQUI",
```

por seus dados reais.

**Nunca coloque `sb_secret_...`, Service Role ou qualquer chave secreta no GitHub.** A Publishable Key é a chave feita para ser usada no frontend.

---

# 2. Testar no computador antes de publicar

O navegador costuma bloquear alguns recursos quando você abre `index.html` diretamente. Use um servidor HTTP local.

Se você tiver Python instalado, abra o terminal dentro da pasta e rode:

```bash
python -m http.server 8080
```

Depois abra:

```text
http://localhost:8080
```

Para testar chamada de verdade, abra o site em dois navegadores/dispositivos com nomes diferentes.

---

# 3. Colocar no GitHub

## Opção mais simples pelo site do GitHub

1. Entre no GitHub.
2. Clique em **New repository**.
3. Nome sugerido: `tropa-da-lan-web`.
4. Deixe o repositório **Public** se estiver usando GitHub Free e quiser usar Pages de forma simples.
5. Crie o repositório.
6. Clique em **Add file > Upload files**.
7. Envie **o conteúdo de dentro da pasta**, incluindo:
   - `index.html`
   - `styles.css`
   - `app.js`
   - `config.js`
   - `supabase.sql`
   - `README.md`
   - `.nojekyll`
   - pasta `assets`
8. Faça o commit.

---

# 4. Ativar o GitHub Pages

1. Entre no repositório.
2. Abra **Settings**.
3. No menu lateral, abra **Pages**.
4. Em **Build and deployment**, em **Source**, escolha **Deploy from a branch**.
5. Em **Branch**, selecione `main`.
6. Em pasta, selecione `/(root)`.
7. Clique em **Save**.

Depois da publicação, o GitHub mostrará o endereço do site. Normalmente será parecido com:

```text
https://SEU-USUARIO.github.io/tropa-da-lan-web/
```

---

# 5. Permissões do navegador

Na primeira chamada, o navegador pedirá permissão para o microfone. Para câmera, pedirá quando você clicar no botão de câmera. Para compartilhar tela, o navegador abre o seletor de tela/janela/aba.

Use o site em **HTTPS** (GitHub Pages já fornece HTTPS) para que câmera, microfone e compartilhamento funcionem corretamente.

---

# 6. TURN: importante para chamadas pela internet

O projeto vem com STUN configurado. Isso permite conexão direta em muitas redes, mas não em todas.

Em algumas combinações de roteador, NAT, rede móvel, escola/empresa ou firewall, dois usuários podem não conseguir conexão direta. Para cobrir esses casos, configure um servidor **TURN** em `config.js`:

```js
ICE_SERVERS: [
  { urls: "stun:stun.l.google.com:19302" },
  {
    urls: "turn:SEU_SERVIDOR:3478",
    username: "USUARIO",
    credential: "SENHA"
  }
]
```

Para testes entre redes domésticas comuns, teste primeiro só com STUN. Se uma chamada conectar na mesma rede mas falhar entre redes diferentes, TURN é o próximo passo.

---

# Limitações deste MVP

- Há um único servidor visual (`Tropa da Lan`) e três canais de texto fixos.
- Há um canal de voz fixo (`Geral`).
- Não há cadastro com senha ainda.
- O modelo de chamada é WebRTC mesh, bom para grupos pequenos. Cada participante envia mídia diretamente para os outros participantes.
- O chat é público para qualquer pessoa que tenha acesso ao endereço e à Publishable Key. Não use informações sensíveis.
- Para grupos grandes, o ideal é migrar voz/vídeo para uma arquitetura SFU (por exemplo LiveKit/mediasoup) em vez de mesh P2P.

---

# Próximas melhorias sugeridas

- Login e contas
- Criar/excluir servidores e canais
- Convites por link
- Avatar/banner/status
- Mensagens privadas
- Envio de imagens e arquivos
- Push-to-talk
- Controle de volume individual
- Compartilhamento de tela com modo cinema
- Moderadores/cargos/permissões
- TURN configurado
- SFU para chamadas maiores
