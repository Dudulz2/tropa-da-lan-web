# Auditoria V4.1 — login e identidade visual

- Removido o e-mail técnico `@tropadalan.invalid`.
- Login agora usa e-mail real + senha via Supabase Auth.
- Cadastro coleta e-mail, username público e senha.
- Fluxo trata tanto confirmação de e-mail ligada quanto desligada.
- Mensagens de erro de login/cadastro foram deixadas mais claras.
- Nova identidade visual em SVG, favicon e ícones PWA.
- Manifest adicionado para instalação no celular/desktop.
- Nenhuma Secret Key foi adicionada ao frontend.
