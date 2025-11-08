import os
from fastapi import FastAPI, Request, Form, HTTPException, UploadFile, Depends, Response, File
from fastapi.responses import HTMLResponse, RedirectResponse, JSONResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
import httpx
from datetime import datetime, timedelta
from typing import Optional, List
from jose import JWTError, jwt
from passlib.context import CryptContext
from .file_handler import save_upload_file

# --- Configuration ---
SECRET_KEY = os.environ.get("SECRET_KEY", os.urandom(24).hex())
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

ADMIN_USERNAME = os.environ.get("ADMIN_USERNAME", "admin")
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "secret")

app = FastAPI()

# --- Static Files and Templates ---
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")
app.mount("/static", StaticFiles(directory="static"), name="static")

def static_url_for(request: Request, filename: str):
    return request.url_for("static", path=filename)

templates = Jinja2Templates(directory="templates")
templates.env.globals["static_url_for"] = static_url_for

# --- Security ---
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    # Truncate password to 72 bytes for bcrypt
    return pwd_context.hash(password[:72])

HASHED_ADMIN_PASSWORD = get_password_hash(ADMIN_PASSWORD)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(request: Request):
    token = request.cookies.get("access_token")
    if not token:
        return None
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            return None
        return username
    except JWTError:
        return None

# --- Directus Setup ---
DIRECTUS_URL = "http://directus:8055"
DIRECTUS_ADMIN_EMAIL = "admin@example.com"
DIRECTUS_ADMIN_PASSWORD = "password"

@app.get("/setup")
async def setup_directus():
    async with httpx.AsyncClient() as client:
        try:
            # 1. Authenticate
            auth_response = await client.post(f"{DIRECTUS_URL}/auth/login", json={
                "email": DIRECTUS_ADMIN_EMAIL,
                "password": DIRECTUS_ADMIN_PASSWORD
            })
            auth_response.raise_for_status()
            token = auth_response.json()['data']['access_token']
            headers = {"Authorization": f"Bearer {token}"}

            # 2. Create Collections
            collections = [
                {"collection": "videos", "schema": {"name": "videos"}},
                {"collection": "pet_perdido", "schema": {"name": "pet_perdido"}},
                {"collection": "objeto_perdido", "schema": {"name": "objeto_perdido"}},
                {"collection": "propaganda", "schema": {"name": "propaganda"}}
            ]
            
            for coll in collections:
                await client.post(f"{DIRECTUS_URL}/collections", headers=headers, json=coll)

            # 3. Create Fields for videos collection
            videos_fields = [
                {"field": "whatsapp", "type": "string"},
                {"field": "cidade", "type": "string"},
                {"field": "bairro", "type": "string"},
                {"field": "problema", "type": "text"},
                {"field": "img_path", "type": "string"},
                {"field": "video_path", "type": "string"},
                {"field": "ip", "type": "string"},
                {"field": "datetime", "type": "datetime"}
            ]

            for field in videos_fields:
                await client.post(f"{DIRECTUS_URL}/fields/videos", headers=headers, json=field)

            # 4. Create Fields for pet_perdido collection
            pet_perdido_fields = [
                {"field": "comprovante_path", "type": "string"},
                {"field": "whatsapp", "type": "string"},
                {"field": "nome_pet", "type": "string"},
                {"field": "tipo_pet", "type": "string"},
                {"field": "raca", "type": "string"},
                {"field": "cidade", "type": "string"},
                {"field": "bairro", "type": "string"},
                {"field": "descricao", "type": "text"},
                {"field": "img_path", "type": "string"},
                {"field": "ip", "type": "string"},
                {"field": "datetime", "type": "datetime"}
            ]

            for field in pet_perdido_fields:
                await client.post(f"{DIRECTUS_URL}/fields/pet_perdido", headers=headers, json=field)

            # 4. Create Fields for objeto_perdido collection
            objeto_perdido_fields = [
                {"field": "nome_responsavel", "type": "string"},
                {"field": "objeto_perdido", "type": "string"},
                {"field": "descricao_detalhada", "type": "text"},
                {"field": "data_horario", "type": "string"},
                {"field": "local_perdido", "type": "text"},
                {"field": "possibilidade_levado", "type": "text"},
                {"field": "nome_telefone_contato", "type": "string"},
                {"field": "recompensa", "type": "string"},
                {"field": "observacao", "type": "text"},
                {"field": "fotos", "type": "string"},
                {"field": "ip", "type": "string"},
                {"field": "datetime", "type": "datetime"}
            ]

            for field in objeto_perdido_fields:
                await client.post(f"{DIRECTUS_URL}/fields/objeto_perdido", headers=headers, json=field)

            # 5. Create Fields for propaganda collection
            propaganda_fields = [
                {"field": "nome_empresa", "type": "string"},
                {"field": "nome_responsavel", "type": "string"},
                {"field": "telefone_contato_equipe", "type": "string"},
                {"field": "telefone_empresa", "type": "string"},
                {"field": "endereco", "type": "string"},
                {"field": "tipo_negocio", "type": "string"},
                {"field": "descricao_oferta", "type": "text"},
                {"field": "formas_pagamento", "type": "string"},
                {"field": "desconto_vista", "type": "string"},
                {"field": "parcelas_cartao", "type": "string"},
                {"field": "promocoes", "type": "text"},
                {"field": "frase_destaque", "type": "string"},
                {"field": "produto_destaque", "type": "string"},
                {"field": "links_redes", "type": "string"},
                {"field": "outras_informacoes", "type": "text"},
                {"field": "materiais_divulgacao", "type": "json"},
                {"field": "ip", "type": "string"},
                {"field": "datetime", "type": "datetime"}
            ]

            for field in propaganda_fields:
                await client.post(f"{DIRECTUS_URL}/fields/propaganda", headers=headers, json=field)

            return JSONResponse(content={"message": "Directus collections created successfully!"})

        except (httpx.RequestError, httpx.HTTPStatusError) as e:
            if e.response and e.response.status_code == 400:
                 return JSONResponse(content={"message": "Collections might already exist."}, status_code=400)
            raise HTTPException(status_code=500, detail=f"Error setting up Directus: {e}")

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
                     video_path: UploadFile = None):
    
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
                     img_path: UploadFile = None):
    
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
                     fotos: UploadFile = File(None)):
    
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
                     materiais_divulgacao: List[UploadFile] = File(None)):
    
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

# --- Admin Panel ---
@app.get("/login", response_class=HTMLResponse)
async def login_get(request: Request):
    return templates.TemplateResponse("login.html", {"request": request, "error": None})

@app.post("/login")
async def login_post(request: Request, username: str = Form(...), password: str = Form(...)):
    if username == ADMIN_USERNAME and verify_password(password, HASHED_ADMIN_PASSWORD):
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": username}, expires_delta=access_token_expires
        )
        response = RedirectResponse(url="/admin", status_code=303)
        response.set_cookie(key="access_token", value=access_token, httponly=True)
        return response
    return templates.TemplateResponse("login.html", {"request": request, "error": "Invalid credentials"})

@app.get("/admin", response_class=HTMLResponse)
async def admin_panel(request: Request, user: str = Depends(get_current_user)):
    if not user:
        return RedirectResponse(url="/login")

    videos = []
    async with httpx.AsyncClient() as client:
        try:
            # We need to authenticate to get data from Directus if it's not public
            auth_response = await client.post(f"{DIRECTUS_URL}/auth/login", json={
                "email": DIRECTUS_ADMIN_EMAIL,
                "password": DIRECTUS_ADMIN_PASSWORD
            })
            auth_response.raise_for_status()
            token = auth_response.json()['data']['access_token']
            headers = {"Authorization": f"Bearer {token}"}

            response = await client.get(f"{DIRECTUS_URL}/items/videos", headers=headers)
            response.raise_for_status()
            videos = response.json().get("data", [])
            
            # Format datetime for display
            for video in videos:
                if 'datetime' in video and video['datetime']:
                    try:
                        # Parse the datetime string and format it
                        from datetime import datetime
                        dt = datetime.fromisoformat(video['datetime'].replace('Z', '+00:00'))
                        video['formatted_datetime'] = dt.strftime('%d/%m/%Y %H:%M')
                    except:
                        video['formatted_datetime'] = video['datetime']
                else:
                    video['formatted_datetime'] = 'N/A'
        except (httpx.RequestError, httpx.HTTPStatusError) as e:
            print(f"Error fetching videos from Directus: {e}")
            pass

    return templates.TemplateResponse("admin.html", {"request": request, "videos": videos})

@app.get("/admin/video/{video_id}", response_class=HTMLResponse)
async def video_detail(request: Request, video_id: int, user: str = Depends(get_current_user)):
    if not user:
        return RedirectResponse(url="/login")

    video = None
    async with httpx.AsyncClient() as client:
        try:
            # Authenticate with Directus
            auth_response = await client.post(f"{DIRECTUS_URL}/auth/login", json={
                "email": DIRECTUS_ADMIN_EMAIL,
                "password": DIRECTUS_ADMIN_PASSWORD
            })
            auth_response.raise_for_status()
            token = auth_response.json()['data']['access_token']
            headers = {"Authorization": f"Bearer {token}"}

            # Get specific video
            response = await client.get(f"{DIRECTUS_URL}/items/videos/{video_id}", headers=headers)
            response.raise_for_status()
            video = response.json().get("data", {})

            # Format datetime for display
            if 'datetime' in video and video['datetime']:
                try:
                    from datetime import datetime
                    dt = datetime.fromisoformat(video['datetime'].replace('Z', '+00:00'))
                    video['formatted_datetime'] = dt.strftime('%d/%m/%Y %H:%M')
                except:
                    video['formatted_datetime'] = video['datetime']
            else:
                video['formatted_datetime'] = 'N/A'

        except (httpx.RequestError, httpx.HTTPStatusError) as e:
            print(f"Error fetching video {video_id}: {e}")
            pass

    if not video:
        return templates.TemplateResponse("404.html", {"request": request, "message": "Vídeo não encontrado"})

    return templates.TemplateResponse("video_detail.html", {"request": request, "video": video})

@app.get("/logout")
async def logout(request: Request):
    response = RedirectResponse(url="/login")
    response.delete_cookie("access_token")
    return response