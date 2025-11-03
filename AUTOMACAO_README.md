# Configuração Automática do Processamento de IA

## 🚀 Como Tornar o Script Automático

### Opção 1: Linux/Mac (Cron Job)

1. **Abra o terminal e edite o crontab:**
   ```bash
   crontab -e
   ```

2. **Adicione uma linha no final do arquivo:**
   ```bash
   # Executar a cada 1 hora
   0 * * * * /caminho/completo/para/ai_processor_cron.sh

   # Ou a cada 30 minutos
   */30 * * * * /caminho/completo/para/ai_processor_cron.sh
   ```

3. **Salve e saia** (no vim: `:wq`)

4. **Verifique se foi configurado:**
   ```bash
   crontab -l
   ```

### Opção 2: Windows (Task Scheduler)

1. **Abra o Task Scheduler:**
   - Pressione `Win + R`
   - Digite `taskschd.msc`
   - Clique em "OK"

2. **Crie uma nova tarefa:**
   - Clique em "Create Task..." no painel direito
   - **Nome:** "AI Video Processor"
   - **Descrição:** "Processa descrições de vídeos com IA automaticamente"

3. **Na aba "Triggers":**
   - Clique em "New..."
   - **Settings:** "Daily" ou "Weekly"
   - Configure a frequência desejada (ex: a cada 1 hora)
   - Clique em "OK"

4. **Na aba "Actions":**
   - Clique em "New..."
   - **Action:** "Start a program"
   - **Program/script:** `C:\Windows\System32\cmd.exe`
   - **Add arguments:** `/c "C:\caminho\para\ai_processor_cron.sh"`
   - Clique em "OK"

5. **Na aba "Conditions":**
   - Desmarque "Start the task only if the computer is on AC power"
   - Marque "Wake the computer to run this task" (opcional)

6. **Clique em "OK" para salvar**

### Opção 3: Docker (Recomendado)

Adicione ao seu `docker-compose.yml`:

```yaml
services:
  ai-processor:
    build: .
    command: ["sh", "-c", "while true; do python ai_processor.py; sleep 3600; done"]
    depends_on:
      - directus
    networks:
      - lambari_network
```

### 📊 Frequências Sugeridas

- **Produção:** A cada 1-2 horas
- **Desenvolvimento:** A cada 30 minutos
- **Teste:** A cada 5 minutos (para debug)

### 🔍 Monitoramento

Para ver se está funcionando:

```bash
# Linux/Mac - ver logs do cron
grep CRON /var/log/syslog

# Ou verificar processos em execução
ps aux | grep ai_processor

# Windows - ver histórico do Task Scheduler
# Abra Task Scheduler → Task Scheduler Library → AI Video Processor → History
```

### 🛠️ Troubleshooting

**Script não executa:**
- Verifique permissões: `chmod +x ai_processor_cron.sh`
- Caminhos absolutos no cron
- Logs: descomente a linha de log no script

**Erro de autenticação:**
- Verifique se os containers estão rodando
- Teste manual: `docker exec lambari_fastapi python ai_processor.py`

**IA não funciona:**
- Verifique quota da API do Google
- Teste manual da API