# Lambari Na Tela – Execução com Docker

Este projeto roda com dois serviços Docker:

- Caddy (porta pública `80`/`443`): proxy reverso
- App Node (porta interna `3000`): servidor Express que atende `public/` e `admin/` (em `/admin`)

Admin não usa servidor separado; é servido pelo próprio Express em `/admin`.

## Configuração Inicial

### 1. Configurar variáveis de ambiente

Copie o arquivo `.env.example` para `.env`:

```powershell
copy .env.example .env
```

Edite o arquivo `.env` e configure suas credenciais de administrador:

```env
ADMIN_USERNAME=seu_usuario
ADMIN_PASSWORD=sua_senha_segura
SESSION_SECRET=uma_chave_secreta_aleatoria
PORT=3000
```

**IMPORTANTE:** 
- Nunca commit o arquivo `.env` no Git (já está no `.gitignore`)
- Use uma senha forte para o administrador
- Altere o `SESSION_SECRET` para uma string aleatória e única

### 2. Instalar dependências

```powershell
npm install
```

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

## Acesso Administrativo

O painel administrativo possui autenticação protegida por login:

- **URL:** http://localhost/admin
- **Login:** Use as credenciais configuradas no arquivo `.env`
- **Sessão:** A sessão dura 24 horas

Ao acessar `/admin` sem estar autenticado, você será redirecionado para a tela de login.

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
