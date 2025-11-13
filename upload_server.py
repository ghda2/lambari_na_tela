#!/usr/bin/env python3
"""
Servidor simples para upload de arquivos
Executar com: python upload_server.py
"""

import os
import json
import re
import uuid
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename

app = Flask(__name__)
CORS(app)  # Habilitar CORS para todas as rotas

UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), 'public', 'uploads')
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'mp4', 'mov', 'avi', 'webp'}

# Criar pasta de uploads se não existir
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  # 50MB max

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def slugify(text):
    """
    Converte um texto em um formato 'slug' amigável para URLs.
    Ex: "Olá Mundo!" -> "ola-mundo"
    """
    if not text:
        return ''
    # Remove acentos e caracteres especiais
    text = text.lower()
    text = re.sub(r'[àáâãäå]', 'a', text)
    text = re.sub(r'[èéêë]', 'e', text)
    text = re.sub(r'[ìíîï]', 'i', text)
    text = re.sub(r'[òóôõö]', 'o', text)
    text = re.sub(r'[ùúûü]', 'u', text)
    text = re.sub(r'[ç]', 'c', text)
    # Remove caracteres não alfanuméricos e substitui espaços por hífen
    text = re.sub(r'[^a-z0-9\s-]', '', text).strip()
    text = re.sub(r'\s+', '-', text)
    # Limita o comprimento para evitar nomes de arquivo excessivamente longos
    return text[:80]

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'Nenhum arquivo enviado'}), 400

    file = request.files['file']
    base_name = request.form.get('baseName', '')

    if file.filename == '':
        return jsonify({'error': 'Nome de arquivo vazio'}), 400

    if file and allowed_file(file.filename):
        original_filename = secure_filename(file.filename)
        ext = original_filename.rsplit('.', 1)[1].lower()
        
        if base_name:
            slug = slugify(base_name)
            short_id = uuid.uuid4().hex[:6]
            unique_filename = f"{slug}-{short_id}.{ext}"
        else:
            # Fallback para o método antigo se nenhum nome base for fornecido
            unique_filename = f"{uuid.uuid4().hex}.{ext}"

        filepath = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
        file.save(filepath)

        # Retornar caminho relativo para o arquivo
        relative_path = f"/uploads/{unique_filename}"

        return jsonify({
            'success': True,
            'filepath': relative_path,
            'filename': unique_filename
        })

    return jsonify({'error': 'Tipo de arquivo não permitido'}), 400

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'OK'})

if __name__ == '__main__':
    print("🚀 Servidor de upload iniciado na porta 5000")
    print(f"📁 Arquivos salvos em: {UPLOAD_FOLDER}")
    app.run(host='0.0.0.0', port=5000, debug=True)