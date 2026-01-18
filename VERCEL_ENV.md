# Variáveis de Ambiente para Vercel

Configure estas variáveis no dashboard da Vercel (Settings > Environment Variables):

## Obrigatórias

```
VITE_SUPABASE_URL=https://utwohjqwuxousqpexrvd.supabase.co
VITE_SUPABASE_ANON_KEY=sua_anon_key_aqui
VITE_STRAVA_CLIENT_ID=seu_strava_client_id
```

## Notas

- As variáveis do Strava (`STRAVA_CLIENT_ID` e `STRAVA_CLIENT_SECRET`) devem ser configuradas no **Supabase Edge Functions**, não na Vercel
- Não esqueça de adicionar a URL de produção da Vercel no Supabase Auth (Redirect URLs)
- Configure também no Strava API Settings o domínio de callback
