import os
import httpx
from fastapi import HTTPException
from fastapi.responses import JSONResponse

# Directus Configuration
DIRECTUS_URL = "http://directus:8055"
DIRECTUS_ADMIN_EMAIL = "admin@example.com"
DIRECTUS_ADMIN_PASSWORD = "password"

async def setup_directus():
    """
    Configura as collections, fields e permissões públicas no Directus.
    """
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

            # 5. Create Fields for objeto_perdido collection
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

            # 6. Create Fields for propaganda collection
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

            # 7. Set Public Permissions for Collections
            permissions = [
                {
                    "collection": "videos",
                    "action": "create",
                    "role": None  # Public
                },
                {
                    "collection": "pet_perdido",
                    "action": "create",
                    "role": None
                },
                {
                    "collection": "objeto_perdido",
                    "action": "create",
                    "role": None
                },
                {
                    "collection": "propaganda",
                    "action": "create",
                    "role": None
                }
            ]

            for perm in permissions:
                try:
                    await client.post(f"{DIRECTUS_URL}/permissions", headers=headers, json=perm)
                except httpx.HTTPStatusError as e:
                    if e.response.status_code != 400:  # Ignore if already exists
                        raise

            return JSONResponse(content={"message": "Directus collections and permissions created successfully!"})

        except (httpx.RequestError, httpx.HTTPStatusError) as e:
            if e.response and e.response.status_code == 400:
                 return JSONResponse(content={"message": "Collections might already exist."}, status_code=400)
            raise HTTPException(status_code=500, detail=f"Error setting up Directus: {e}")