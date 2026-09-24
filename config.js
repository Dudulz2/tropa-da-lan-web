// TROPA DA LAN - CONFIGURAÇÃO
// Cole aqui os dados do seu projeto Supabase.
// IMPORTANTE: use a Publishable Key (sb_publishable_...), nunca uma Secret Key.

window.TROPA_CONFIG = {
  SUPABASE_URL: "https://SEU-PROJETO.supabase.co",
  SUPABASE_PUBLISHABLE_KEY: "sb_publishable_COLE_SUA_CHAVE_AQUI",

  // STUN público usado para tentar conexão direta entre os navegadores.
  // Para melhorar a compatibilidade em redes restritas, adicione também um TURN.
  ICE_SERVERS: [
    { urls: "stun:stun.l.google.com:19302" }

    // Exemplo de TURN (preencha com um serviço de sua escolha):
    // {
    //   urls: "turn:SEU_SERVIDOR_TURN:3478",
    //   username: "SEU_USUARIO",
    //   credential: "SUA_SENHA"
    // }
  ]
};
