# Tropa da Lan V7.0.5 — Call UI + transmissão

## Principais mudanças

- Dock da chamada simplificado e minimalista.
- Controles avançados de áudio escondidos em `Áudio e transmissão`.
- Reconectar e Diagnóstico movidos para o painel avançado.
- Qualidade da transmissão agora é aplicada ao `RTCRtpSender`.
- FPS agora é reaplicado à track e ao sender durante a transmissão.
- Troca entre 720p, 1080p e 1440p sem precisar parar a transmissão quando o navegador suporta ajuste dinâmico.
- Troca entre 15, 30 e 60 FPS durante a transmissão.
- Bitrate alvo ajustado conforme resolução e FPS.
- `degradationPreference` ajustada de acordo com modo de transmissão.
- Mudança manual de qualidade/FPS desativa o modo de baixa largura de banda para não limitar silenciosamente a transmissão a 720p/15.
- A barra da call mostra o alvo aproximado da transmissão.

## Observação

O navegador e a rede continuam podendo adaptar a qualidade abaixo do alvo escolhido. Uma tela 1080p também não pode produzir 1440p real de detalhes; o seletor define o alvo máximo de envio.

## Atualização

Substitua os arquivos do site pelos desta versão. Não há SQL novo para a V7.0.5.
