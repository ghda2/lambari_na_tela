# AI Video Description Processor

Este sistema processa automaticamente as descrições de reportagens usando Inteligência Artificial para gerar versões mais profissionais e jornalísticas.

## Funcionalidades

- Processa descrições de reportagens automaticamente
- Gera versões melhoradas usando OpenAI GPT
- Mantém os fatos originais intactos
- Executa como processo em background (cron job)

## Configuração

### 1. Instalar dependências

```bash
pip install -r requirements.txt
```

### 2. Configurar variáveis de ambiente

Copie o arquivo `.env.example` para `.env` e configure:

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:

```env
# Directus Configuration
DIRECTUS_URL=http://localhost:8055
DIRECTUS_ADMIN_EMAIL=admin@example.com
DIRECTUS_ADMIN_PASSWORD=password

# OpenAI Configuration
OPENAI_API_KEY=your-openai-api-key-here
```

### 3. Obter API Key do OpenAI

1. Acesse [OpenAI Platform](https://platform.openai.com/)
2. Crie uma conta ou faça login
3. Vá para API Keys e gere uma nova chave
4. Adicione a chave no arquivo `.env`

## Como funciona

1. **Campo novo**: Adicionado `descricao_ia` na coleção `videos` do Directus
2. **Processamento**: O script busca registros sem `descricao_ia` preenchida
3. **IA**: Usa GPT-3.5-turbo para reescrever o texto de forma jornalística
4. **Atualização**: Salva o texto gerado pela IA no campo `descricao_ia`

## Executar manualmente

Para testar o processamento:

```bash
python ai_processor.py
```

## Configurar Cron Job

### No Linux/Mac:

1. Abra o crontab:
```bash
crontab -e
```

2. Adicione uma linha para executar a cada hora:
```bash
0 * * * * /caminho/para/seu/projeto/ai_processor_cron.sh
```

### No Windows (Task Scheduler):

1. Abra o Task Scheduler
2. Crie uma nova tarefa básica
3. Configure para executar diariamente
4. Aponte para o script `ai_processor_cron.sh`
5. Configure a frequência desejada (ex: a cada 1 hora)

## Monitoramento

O script gera logs no console. Para logs persistentes, descomente a linha no `ai_processor_cron.sh`:

```bash
echo "$(date): AI processing completed" >> ai_processor.log
```

## Personalização

### Modificar o prompt do sistema

Edite a constante `SYSTEM_PROMPT` no arquivo `ai_processor.py` para alterar como a IA processa os textos.

### Ajustar frequência

Modifique o cron job para executar com a frequência desejada:
- `*/30 * * * *` - a cada 30 minutos
- `0 */2 * * *` - a cada 2 horas
- `0 9 * * *` - diariamente às 9h

## Estrutura dos dados

Após o processamento, cada registro terá:
- `descricao`: Texto original do usuário
- `descricao_ia`: Versão melhorada pela IA
- `processed_at`: Timestamp do processamento

## Troubleshooting

### Erro de autenticação no Directus
- Verifique as credenciais no `.env`
- Certifique-se que o Directus está rodando

### Erro na API do OpenAI
- Verifique se a API key é válida
- Confirme se há saldo na conta OpenAI
- Verifique limites de rate limiting

### Nenhum vídeo processado
- Verifique se há registros na coleção `videos`
- Confirme se os registros têm o campo `descricao` preenchido
- Verifique se já não foram processados (campo `descricao_ia` vazio)