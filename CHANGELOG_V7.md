
## V7.0.5
- Interface de chamada minimalista.
- Controles avançados recolhíveis.
- Qualidade e FPS da transmissão aplicados dinamicamente ao WebRTC.
- Bitrate e resolução alvo ajustados conforme seleção.
# Changelog — V7.0.1

- Diagnóstico de chamadas WebRTC.
- Push-to-Talk e sensibilidade configurável.
- Reconexão rápida de áudio e monitor local de microfone.
- Qualidade/FPS/modo de transmissão configuráveis.
- Modo baixa largura de banda.
- Categorias, canais privados, somente leitura e slowmode.
- RLS reforçado para canais privados e hierarquia de cargos.
- Reorganização de canais e cargos.
- Advertências e timeout de membros.
- Chat com drag-and-drop, colar anexos, histórico incremental, não lidas e links profundos.
- Busca avançada e command palette Ctrl+K.
- Comandos slash internos.
- Enquetes com prazo, múltipla escolha e modo anônimo.
- Templates, banner e cor por servidor.
- Preferências de notificação por servidor.
- Barra inferior mobile.
- Instalação/atualização PWA.
- Relatório técnico e versão visível.


## Correções V7.0.1
- removidos IDs duplicados e controles conflitantes;
- controles rápidos da call conectados às preferências reais;
- migração V7 alinhada com canais privados, categorias, slowmode, timeout, hierarquia de cargos e preferências avançadas;
- enquetes de múltipla escolha passam a usar chave composta por opção;
- validação estática refeita após a consolidação.

## V7.0.6 — Audit Fix
- Correção da versão de registro do Service Worker.
- Correção do bitrate no modo baixa largura de banda.
- Hard mute separado do Push-to-Talk.
- Proteção de hierarquia de moderação reforçada no frontend e banco.
- Novo `AUDIT_FIX_V7_0_6.sql` para instalações V7 existentes.
- Auditoria atualizada com testes simulados de call e transmissão.
