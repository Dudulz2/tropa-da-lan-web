# Tropa da Lan V7.0.6 — Audit Fix

Esta versão mantém os recursos da V7.0.5 e corrige pontos encontrados em auditoria.

## Frontend
- Service Worker/cache alinhados com V7.0.6.
- Baixa largura de banda limita 720p / 15 FPS / 2.5 Mbps.
- Hard mute não pode ser contornado pelo Push-to-Talk.
- Moderação respeita hierarquia também na interface.
- Sensibilidade foi descrita corretamente como sensibilidade do indicador de voz.

## Supabase
Se a V7 já está instalada, execute somente:

`AUDIT_FIX_V7_0_6.sql`

Não execute novamente V4/V6/V7 só por causa desta atualização.

O SQL reforça a hierarquia para kick, ban, timeout e advertência e atualiza o schema cache do PostgREST.
