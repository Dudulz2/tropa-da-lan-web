# Tropa da Lan V7.0.2 — Startup Fix

Correções:
- tela em branco na inicialização;
- fallback de CDN do Supabase;
- timeout seguro ao recuperar sessão;
- tela de carregamento/erro visível;
- cache-busting dos arquivos principais;
- Service Worker atualizado para `tropa-v7-shell-2`;
- timeout de segurança do módulo `v7.js`.

Não exige novo SQL se a `MIGRATION_V7_PRO.sql` já foi executada.
