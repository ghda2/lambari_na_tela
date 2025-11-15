# Configuração para Produção - lambarinatela.com.br

## 📋 Checklist de Deploy

### 1. DNS Configuration
Configure os registros DNS do seu domínio:

```
Tipo: A
Nome: @
Valor: [IP do seu servidor]

Tipo: A
Nome: www
Valor: [IP do seu servidor]
```

### 2. Servidor de Produção

#### Requisitos:
- Docker e Docker Compose instalados
- Portas 80 e 443 abertas no firewall
- Domínio apontando para o servidor

#### Variáveis de Ambiente (.env)
Crie o arquivo `.env` no servidor com credenciais seguras:

```bash
# NÃO USE AS CREDENCIAIS PADRÃO EM PRODUÇÃO!
ADMIN_USERNAME=seu_usuario_seguro
ADMIN_PASSWORD=sua_senha_forte_aqui
SESSION_SECRET=chave_secreta_aleatoria_longa
PORT=3000
NODE_ENV=production
```

**Gere uma senha forte:**
```bash
# Linux/Mac
openssl rand -base64 32

# PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

### 3. Deploy

```bash
# 1. Clone o repositório
git clone https://github.com/ghda2/lambari_na_tela.git
cd lambari_na_tela

# 2. Configure o .env
nano .env  # ou vim .env

# 3. Inicie os containers
docker compose up -d --build

# 4. Verifique os logs
docker logs lambari-app
docker logs lambari-caddy
```

### 4. HTTPS Automático

O Caddy irá automaticamente:
- ✅ Obter certificados SSL do Let's Encrypt
- ✅ Renovar certificados automaticamente
- ✅ Redirecionar HTTP para HTTPS
- ✅ Redirecionar www para domínio principal

**Primeira vez pode demorar alguns minutos para obter os certificados.**

### 5. Verificação

Após o deploy, acesse:
- https://lambarinatela.com.br (deve funcionar)
- http://lambarinatela.com.br (deve redirecionar para HTTPS)
- https://www.lambarinatela.com.br (deve redirecionar para lambarinatela.com.br)

### 6. Painel Administrativo

- **URL:** https://lambarinatela.com.br/admin
- **Login:** Use as credenciais configuradas no `.env`

### 7. Manutenção

```bash
# Ver logs
docker compose logs -f

# Reiniciar
docker compose restart

# Parar
docker compose down

# Atualizar código
git pull origin main
docker compose up -d --build
```

### 8. Backup

Faça backup regular dos seguintes dados:
- Banco de dados Supabase
- Arquivo `.env`
- Pasta `uploads/` (se houver)

### 9. Segurança

- ✅ `.env` está no `.gitignore` (não vai para o Git)
- ✅ Senhas fortes configuradas
- ✅ HTTPS habilitado
- ✅ Cookies seguros (httpOnly)
- ✅ Sessões com timeout de 24h

### 10. Monitoramento

Verifique regularmente:
```bash
# Status dos containers
docker ps

# Uso de recursos
docker stats

# Logs de erro
docker compose logs --tail=100
```

## 🔧 Troubleshooting

### Problema: Certificado SSL não é obtido
**Solução:** Verifique se:
- DNS está apontando corretamente
- Portas 80 e 443 estão abertas
- Aguarde alguns minutos (Let's Encrypt tem rate limits)

### Problema: Site não carrega
**Solução:**
```bash
docker compose logs lambari-app
docker compose logs lambari-caddy
```

### Problema: Login não funciona
**Solução:**
- Verifique as credenciais no `.env`
- Reinicie o container: `docker compose restart`
- Verifique os logs: `docker logs lambari-app`

## 📞 Suporte

Em caso de problemas, verifique os logs e a documentação do Docker e Caddy.
