# Auditoria técnica — Tropa da Lan Web V6 Ultimate

## Escopo revisado

Foram revisados `index.html`, `styles.css`, `app.js`, manifesto/PWA, configuração do cliente, schema base e migração V6.

## Verificações executadas

- `node --check app.js`: aprovado, sem erro de sintaxe JavaScript.
- CSS: número de `{` e `}` consistente após a consolidação.
- HTML: nenhum `id` duplicado.
- referências estáticas `$("#id")` do JavaScript: todas existem no HTML.
- funções JavaScript nomeadas: nenhuma declaração duplicada detectada.
- teste Chromium headless com Supabase simulado em 1440×900 e 390×844:
  - app inicializou autenticado;
  - servidor foi carregado;
  - mensagem foi renderizada;
  - sem erros de página ou console;
  - sem overflow horizontal;
  - Home/Social abriu;
  - Preferências abriu.
- teste de interações em Chromium headless:
  - configurações do servidor abriram;
  - abas Eventos e Moderação presentes;
  - diálogo de enquete abriu;
  - ações Responder e Editar ativaram seus estados;
  - pesquisa de mensagem funcionou no mock;
  - edição de perfil abriu;
  - Home/Social e Adicionar amigo abriram;
  - sem `pageerror` ou erro JavaScript no console durante os fluxos testados.

## Correções adicionais feitas na auditoria

- recuperação de senha: `detectSessionInUrl` foi ativado para o Supabase reconhecer o retorno do link de recuperação;
- DMs: remetente, destinatário e data foram protegidos contra alteração depois da criação;
- eventos: política UPDATE recebeu `WITH CHECK` para impedir mudança indevida de contexto;
- RSVP: inserção/edição agora também verifica participação no servidor do evento;
- convite: usuário que já é membro não consome novamente o contador de usos do convite;
- função `create_tropa_server(text)` está incluída na migração V6 e a migração força recarga do schema PostgREST.

## Pontos que precisam ser validados no ambiente real

Uma auditoria local não consegue garantir comportamento de todos os provedores externos. Depois de executar a migração no Supabase, teste com duas contas reais:

1. cadastro/login;
2. criar servidor;
3. gerar convite e entrar com a segunda conta;
4. criar/editar canal;
5. mensagens, resposta, edição, reação, pin, enquete e anexo;
6. amizade e DM;
7. evento e RSVP;
8. call em dois dispositivos e em redes diferentes;
9. câmera e compartilhamento de tela;
10. perfil/avatar/banner;
11. cargos e permissões.

## Limitações conhecidas

- Sem TURN dedicado, WebRTC pode falhar entre redes/NATs restritivos mesmo quando o código está correto.
- A arquitetura atual é mesh/P2P; chamadas com muitas pessoas não escalam como uma infraestrutura SFU profissional.
- Safari/iOS e Android possuem diferenças de suporte para compartilhamento de tela/dispositivos.
- O bucket `message-files` é público por URL nesta versão; não é indicado para anexos confidenciais.
- PWA oferece cache do shell, mas o app não é totalmente funcional offline porque Supabase e o módulo Supabase CDN dependem de rede.
- Recursos que exigem IA, bots persistentes, integrações de terceiros, TURN/SFU e processamento no servidor exigem infraestrutura adicional.

## Resultado

A V6 foi consolidada e os testes estáticos/runtime acima passaram. Isso reduz bastante a chance de regressões comuns, mas não é correto prometer “zero bugs” em todos os navegadores, redes e estados do Supabase. O próximo teste importante é o teste integrado no projeto Supabase real depois de aplicar a migração.
