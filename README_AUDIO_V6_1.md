# Tropa da Lan V6.1 — Voice Quality

Atualização focada em chamadas de voz e seleção de microfone.

## Melhorias
- captura de voz otimizada com echo cancellation, noise suppression e automatic gain control;
- preferência por áudio mono a 48 kHz/16-bit quando suportado pelo navegador;
- `contentHint = speech` para otimização de fala;
- codec Opus priorizado quando a API do navegador permite;
- bitrate de envio de voz ajustado até 128 kbps quando suportado;
- seletor rápido de microfone dentro da call;
- troca de microfone durante a chamada sem desconectar;
- preservação do estado de mute durante a troca;
- fallback automático para o microfone padrão quando o dispositivo salvo não existe mais;
- atualização automática da lista quando um dispositivo é conectado/removido;
- teste de microfone com medidor RMS mais estável;
- correção da lista de dispositivos para não voltar indevidamente à seleção anterior;
- Service Worker atualizado para forçar os novos arquivos.

## Banco de dados
Nenhum SQL novo é necessário. A coluna `audio_input_id` já existe na migração V6.
