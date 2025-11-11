import os
from fastapi import FastAPI, Request, Form, HTTPException, UploadFile, File
from fastapi.responses import HTMLResponse, RedirectResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
import httpx
from datetime import datetime
from typing import List
from .file_handler import save_upload_file
from .dependencies import templates
from .directus_setup import setup_directus, DIRECTUS_URL

app = FastAPI()

# --- Idempotency (in-memory) ---
# Conjunto simples para bloquear dupla submissão baseada em token. Em produção, usar armazenamento persistente
# ou TTL (Redis, banco) para evitar crescimento ilimitado.
IDEMPOTENCY_TOKENS = set()

# --- Static Files and Templates ---
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")
app.mount("/static", StaticFiles(directory="static"), name="static")

def static_url_for(request: Request, filename: str):
    return request.url_for("static", path=filename)

templates.env.globals["static_url_for"] = static_url_for

# --- Directus Setup ---

@app.get("/setup")
async def setup_directus_endpoint():
    return await setup_directus()

# --- Public Endpoints ---
@app.get("/", response_class=HTMLResponse)
async def read_root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.get("/forms", response_class=HTMLResponse)
async def forms_page(request: Request):
    return templates.TemplateResponse("forms.html", {"request": request})

@app.get("/pet-perdido", response_class=HTMLResponse)
async def pet_perdido_page(request: Request):
    return templates.TemplateResponse("pet_perdido.html", {"request": request})

@app.get("/objeto-perdido", response_class=HTMLResponse)
async def objeto_perdido_page(request: Request):
    return templates.TemplateResponse("objeto_perdido.html", {"request": request})

@app.get("/thank-you", response_class=HTMLResponse)
async def thank_you_page(request: Request):
    return templates.TemplateResponse("thank_you.html", {"request": request})

@app.get("/propaganda", response_class=HTMLResponse)
async def propaganda_page(request: Request):
    return templates.TemplateResponse("propaganda.html", {"request": request})

@app.post("/videos", response_class=RedirectResponse)
async def create_video(request: Request,
                     whatsapp: str = Form(...),
                     cidade: str = Form(...),
                     bairro: str = Form(...),
                     problema: str = Form(...),
                     img_path: UploadFile = None,
                     video_path: UploadFile = None,
                     idempotency_token: str = Form(None)):
    # Checagem de idempotência
    if idempotency_token:
        if idempotency_token in IDEMPOTENCY_TOKENS:
            return RedirectResponse(url="/thank-you", status_code=303)
        IDEMPOTENCY_TOKENS.add(idempotency_token)
    
    saved_img_path = save_upload_file(img_path)
    saved_video_path = save_upload_file(video_path)

    ip_address = request.client.host
    current_datetime = datetime.now().isoformat()

    video_data = {
        "whatsapp": whatsapp,
        "cidade": cidade,
        "bairro": bairro,
        "problema": problema,
        "img_path": saved_img_path,
        "video_path": saved_video_path,
        "ip": ip_address,
        "datetime": current_datetime
    }

    async with httpx.AsyncClient() as client:
        try:
            await client.post(f"{DIRECTUS_URL}/items/videos", json=video_data)
        except (httpx.RequestError, httpx.HTTPStatusError) as e:
            print(f"Error communicating with Directus: {e}")
            pass
            
    return RedirectResponse(url="/thank-you", status_code=303)

@app.post("/pet-perdido", response_class=RedirectResponse)
async def create_pet_perdido(request: Request,
                     comprovante_path: UploadFile = None,
                     whatsapp: str = Form(...),
                     nome_pet: str = Form(...),
                     tipo_pet: str = Form(...),
                     raca: str = Form(...),
                     cidade: str = Form(...),
                     bairro: str = Form(...),
                     descricao: str = Form(...),
                     img_path: UploadFile = None,
                     idempotency_token: str = Form(None)):
    if idempotency_token:
        if idempotency_token in IDEMPOTENCY_TOKENS:
            return RedirectResponse(url="/thank-you", status_code=303)
        IDEMPOTENCY_TOKENS.add(idempotency_token)
    
    saved_comprovante_path = save_upload_file(comprovante_path)
    saved_img_path = save_upload_file(img_path)

    ip_address = request.client.host
    current_datetime = datetime.now().isoformat()

    pet_data = {
        "comprovante_path": saved_comprovante_path,
        "whatsapp": whatsapp,
        "nome_pet": nome_pet,
        "tipo_pet": tipo_pet,
        "raca": raca,
        "cidade": cidade,
        "bairro": bairro,
        "descricao": descricao,
        "img_path": saved_img_path,
        "ip": ip_address,
        "datetime": current_datetime
    }

    async with httpx.AsyncClient() as client:
        try:
            await client.post(f"{DIRECTUS_URL}/items/pet_perdido", json=pet_data)
        except (httpx.RequestError, httpx.HTTPStatusError) as e:
            print(f"Error communicating with Directus: {e}")
            pass
            
    return RedirectResponse(url="/thank-you", status_code=303)

@app.post("/objeto-perdido", response_class=RedirectResponse)
async def create_objeto_perdido(request: Request,
                     nome_responsavel: str = Form(...),
                     objeto_perdido: str = Form(...),
                     descricao_detalhada: str = Form(...),
                     data_horario: str = Form(...),
                     local_perdido: str = Form(...),
                     possibilidade_levado: str = Form(...),
                     nome_telefone_contato: str = Form(...),
                     recompensa: str = Form(...),
                     observacao: str = Form(""),
                     fotos: UploadFile = File(None),
                     idempotency_token: str = Form(None)):
    if idempotency_token:
        if idempotency_token in IDEMPOTENCY_TOKENS:
            return RedirectResponse(url="/thank-you", status_code=303)
        IDEMPOTENCY_TOKENS.add(idempotency_token)
    
    saved_fotos_path = save_upload_file(fotos)

    ip_address = request.client.host
    current_datetime = datetime.now().isoformat()

    objeto_data = {
        "nome_responsavel": nome_responsavel,
        "objeto_perdido": objeto_perdido,
        "descricao_detalhada": descricao_detalhada,
        "data_horario": data_horario,
        "local_perdido": local_perdido,
        "possibilidade_levado": possibilidade_levado,
        "nome_telefone_contato": nome_telefone_contato,
        "recompensa": recompensa,
        "observacao": observacao,
        "fotos": saved_fotos_path,
        "ip": ip_address,
        "datetime": current_datetime
    }

    async with httpx.AsyncClient() as client:
        try:
            await client.post(f"{DIRECTUS_URL}/items/objeto_perdido", json=objeto_data)
        except (httpx.RequestError, httpx.HTTPStatusError) as e:
            print(f"Error communicating with Directus: {e}")
            pass
            
    return RedirectResponse(url="/thank-you", status_code=303)

@app.post("/propaganda", response_class=RedirectResponse)
async def create_propaganda(request: Request,
                     nome_empresa: str = Form(...),
                     nome_responsavel: str = Form(...),
                     telefone_contato_equipe: str = Form(...),
                     telefone_empresa: str = Form(...),
                     endereco: str = Form(...),
                     tipo_negocio: str = Form(...),
                     descricao_oferta: str = Form(...),
                     formas_pagamento: str = Form(...),
                     desconto_vista: str = Form(...),
                     parcelas_cartao: str = Form(...),
                     promocoes: str = Form(""),
                     frase_destaque: str = Form(""),
                     produto_destaque: str = Form(""),
                     links_redes: str = Form(""),
                     outras_informacoes: str = Form(""),
                     materiais_divulgacao: List[UploadFile] = File(None),
                     idempotency_token: str = Form(None)):
    if idempotency_token:
        if idempotency_token in IDEMPOTENCY_TOKENS:
            return RedirectResponse(url="/thank-you", status_code=303)
        IDEMPOTENCY_TOKENS.add(idempotency_token)
    
    saved_materiais_paths = []
    if materiais_divulgacao:
        for file in materiais_divulgacao:
            path = save_upload_file(file)
            if path:
                saved_materiais_paths.append(path)

    ip_address = request.client.host
    current_datetime = datetime.now().isoformat()

    propaganda_data = {
        "nome_empresa": nome_empresa,
        "nome_responsavel": nome_responsavel,
        "telefone_contato_equipe": telefone_contato_equipe,
        "telefone_empresa": telefone_empresa,
        "endereco": endereco,
        "tipo_negocio": tipo_negocio,
        "descricao_oferta": descricao_oferta,
        "formas_pagamento": formas_pagamento,
        "desconto_vista": desconto_vista,
        "parcelas_cartao": parcelas_cartao,
        "promocoes": promocoes,
        "frase_destaque": frase_destaque,
        "produto_destaque": produto_destaque,
        "links_redes": links_redes,
        "outras_informacoes": outras_informacoes,
        "materiais_divulgacao": saved_materiais_paths,
        "ip": ip_address,
        "datetime": current_datetime
    }

    async with httpx.AsyncClient() as client:
        try:
            await client.post(f"{DIRECTUS_URL}/items/propaganda", json=propaganda_data)
        except (httpx.RequestError, httpx.HTTPStatusError) as e:
            print(f"Error communicating with Directus: {e}")
            pass
            
    return RedirectResponse(url="/thank-you", status_code=303)
