# Dockerfile para o servidor de upload
FROM python:3.9-slim

WORKDIR /app

# Instalar dependências
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar código
COPY upload_server.py .

# Criar volume para uploads
VOLUME ["/app/public"]

EXPOSE 5000

CMD ["python", "upload_server.py"]
