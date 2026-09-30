// TROPA DA LAN - CONFIGURAÇÃO
// A Publishable Key do Supabase pode ficar no frontend quando as políticas/RLS estão configuradas.
// Nunca coloque uma Secret Key / service_role neste arquivo.

window.TROPA_CONFIG = {
  SUPABASE_URL: "https://esbqgdbwduyktpquvkpt.supabase.co",
  SUPABASE_PUBLISHABLE_KEY: "sb_publishable_zq99xttbJ2oVhdyZdMKLVQ_fCVOGrX5",

  // STUN ajuda os navegadores a tentarem conexão direta.
  // Para chamadas funcionarem em redes mais restritas, adicione também um TURN.
  ICE_SERVERS: [
    { urls: [
      "stun:stun.l.google.com:19302",
      "stun:stun1.l.google.com:19302",
      "stun:stun2.l.google.com:19302",
      "stun:stun3.l.google.com:19302",
      "stun:stun4.l.google.com:19302"
    ] }

    // STUN só ajuda a descobrir a rota P2P; ele não retransmite a chamada.
    // Exemplo de TURN, caso algum dia queira cobertura para redes que bloqueiam P2P:
    // ,{
    //   urls: "turn:SEU_SERVIDOR_TURN:3478",
    //   username: "SEU_USUARIO",
    //   credential: "SUA_SENHA"
    // }
  ]
};
