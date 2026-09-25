# Tropa da Lan V7.0.3 — Runtime Fix

Correção de inicialização da V7.

## Corrigido
- adicionada `formatDateTime()` que estava referenciada mas não declarada;
- conferidos todos os símbolos exportados em `window.TROPA_RUNTIME`;
- versão atualizada para 7.0.3;
- cache PWA atualizado para `tropa-v7-shell-3`;
- query strings de assets atualizadas para `?v=7.0.3`.

Não exige nova migração SQL se a MIGRATION_V7_PRO.sql já foi executada.
