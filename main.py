import os
from fastapi import FastAPI, Request, Form, HTTPException, UploadFile, Depends, Response
from fastapi.responses import HTMLResponse, RedirectResponse, JSONResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
import httpx
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from file_handler import save_upload_file

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

            # 5. Create Fields for propaganda collection
            propaganda_fields = [
                {"field": "comprovante_path", "type": "string"},
                {"field": "whatsapp", "type": "string"},
                {"field": "nome_negocio", "type": "string"},
                {"field": "cidade", "type": "string"},
                {"field": "bairro", "type": "string"},
                {"field": "descricao", "type": "text"},
                {"field": "img_path", "type": "string"},
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
            
    return RedirectResponse(url="/", status_code=303)

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
            
    return RedirectResponse(url="/", status_code=303)

@app.post("/propaganda", response_class=RedirectResponse)
async def create_propaganda(request: Request,
                     comprovante_path: UploadFile = None,
                     whatsapp: str = Form(...),
                     nome_negocio: str = Form(...),
                     cidade: str = Form(...),
                     bairro: str = Form(...),
                     descricao: str = Form(...),
                     img_path: UploadFile = None):
    
    saved_comprovante_path = save_upload_file(comprovante_path)
    saved_img_path = save_upload_file(img_path)

    ip_address = request.client.host
    current_datetime = datetime.now().isoformat()

    propaganda_data = {
        "comprovante_path": saved_comprovante_path,
        "whatsapp": whatsapp,
        "nome_negocio": nome_negocio,
        "cidade": cidade,
        "bairro": bairro,
        "descricao": descricao,
        "img_path": saved_img_path,
        "ip": ip_address,
        "datetime": current_datetime
    }

    async with httpx.AsyncClient() as client:
        try:
            await client.post(f"{DIRECTUS_URL}/items/propaganda", json=propaganda_data)
        except (httpx.RequestError, httpx.HTTPStatusError) as e:
            print(f"Error communicating with Directus: {e}")
            pass
            
    return RedirectResponse(url="/", status_code=303)

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