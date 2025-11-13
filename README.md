# Lambari Na Tela – Execução com Docker

Este projeto roda com dois serviços Docker:

- Caddy (porta pública `80`/`443`): proxy reverso
- App Node (porta interna `3000`): servidor Express que atende `public/` e `admin/` (em `/admin`)

Admin não usa servidor separado; é servido pelo próprio Express em `/admin`.

## Como iniciar

Primeira vez:

```powershell
docker compose up -d --build
```

Próximas vezes:

```powershell
docker compose up -d
```

Acesse em: http://localhost

## Parar e reiniciar

```powershell
npm run compose:down
npm run compose:up
```

## Inicialização automática

- Os serviços usam `restart: unless-stopped`. Assim, quando o Docker Desktop iniciar (e o daemon subir), os containers são retomados automaticamente.
- Habilite no Docker Desktop: Settings → General → “Start Docker Desktop when you log in”.
- Após um primeiro `docker compose up -d`, os containers serão recriados automaticamente nos próximos boots enquanto não forem parados manualmente (`docker compose down`).

## Healthcheck

O app expõe `GET /healthz` e o compose verifica a saúde antes de liberar o Caddy. Isso evita erros de proxy enquanto o Node inicia.

## Desenvolvimento

Se quiser rodar localmente fora do Docker:

```powershell
npm install
npm run dev
```

O servidor sobe em `http://localhost:3000` (sem Caddy). Para produção, mantenha o fluxo via Docker.
