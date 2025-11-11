import os
import httpx
from fastapi import HTTPException
from fastapi.responses import JSONResponse

# Directus Configuration
DIRECTUS_URL = "http://directus:8055"
DIRECTUS_ADMIN_EMAIL = "admin@example.com"
DIRECTUS_ADMIN_PASSWORD = "admin123"

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
                {"collection": "videos", "schema": {"name": "videos"}, "meta": {"singleton": False}},
                {"collection": "pet_perdido", "schema": {"name": "pet_perdido"}, "meta": {"singleton": False}},
                {"collection": "objeto_perdido", "schema": {"name": "objeto_perdido"}, "meta": {"singleton": False}},
                {"collection": "propaganda", "schema": {"name": "propaganda"}, "meta": {"singleton": False}}
            ]

            for coll in collections:
                try:
                    await client.post(f"{DIRECTUS_URL}/collections", headers=headers, json=coll)
                    print(f"Collection {coll['collection']} created successfully")
                except httpx.HTTPStatusError as e:
                    if e.response.status_code == 400:
                        print(f"Collection {coll['collection']} already exists")
                    else:
                        raise

            # 3. Create Fields for videos collection
            videos_fields = [
                {"field": "whatsapp", "type": "string", "meta": {"required": True}},
                {"field": "cidade", "type": "string", "meta": {"required": True}},
                {"field": "bairro", "type": "string", "meta": {"required": True}},
                {"field": "problema", "type": "text", "meta": {"required": True}},
                {"field": "img_path", "type": "file"},
                {"field": "video_path", "type": "file"},
                {"field": "ip", "type": "string"},
                {"field": "datetime", "type": "datetime"}
            ]

            for field in videos_fields:
                try:
                    await client.post(f"{DIRECTUS_URL}/fields/videos", headers=headers, json=field)
                except httpx.HTTPStatusError as e:
                    if e.response.status_code == 400:
                        pass  # Field already exists
                    else:
                        raise

            # 4. Create Fields for pet_perdido collection
            pet_perdido_fields = [
                {"field": "comprovante_path", "type": "string"},
                {"field": "whatsapp", "type": "string", "meta": {"required": True}},
                {"field": "nome_pet", "type": "string", "meta": {"required": True}},
                {"field": "tipo_pet", "type": "string", "meta": {"required": True}},
                {"field": "raca", "type": "string", "meta": {"required": True}},
                {"field": "cidade", "type": "string", "meta": {"required": True}},
                {"field": "bairro", "type": "string", "meta": {"required": True}},
                {"field": "descricao", "type": "text", "meta": {"required": True}},
                {"field": "img_path", "type": "file"},
                {"field": "ip", "type": "string"},
                {"field": "datetime", "type": "datetime"}
            ]

            for field in pet_perdido_fields:
                try:
                    await client.post(f"{DIRECTUS_URL}/fields/pet_perdido", headers=headers, json=field)
                except httpx.HTTPStatusError as e:
                    if e.response.status_code == 400:
                        pass  # Field already exists
                    else:
                        raise

            # 5. Create Fields for objeto_perdido collection
            objeto_perdido_fields = [
                {"field": "nome_responsavel", "type": "string", "meta": {"required": True}},
                {"field": "objeto_perdido", "type": "string", "meta": {"required": True}},
                {"field": "descricao_detalhada", "type": "text", "meta": {"required": True}},
                {"field": "data_horario", "type": "string", "meta": {"required": True}},
                {"field": "local_perdido", "type": "text", "meta": {"required": True}},
                {"field": "possibilidade_levado", "type": "text", "meta": {"required": True}},
                {"field": "nome_telefone_contato", "type": "string", "meta": {"required": True}},
                {"field": "recompensa", "type": "string", "meta": {"required": True}},
                {"field": "observacao", "type": "text"},
                {"field": "fotos", "type": "file"},
                {"field": "ip", "type": "string"},
                {"field": "datetime", "type": "datetime"}
            ]

            for field in objeto_perdido_fields:
                try:
                    await client.post(f"{DIRECTUS_URL}/fields/objeto_perdido", headers=headers, json=field)
                except httpx.HTTPStatusError as e:
                    if e.response.status_code == 400:
                        pass  # Field already exists
                    else:
                        raise

            # 6. Create Fields for propaganda collection
            propaganda_fields = [
                {"field": "nome_empresa", "type": "string", "meta": {"required": True}},
                {"field": "nome_responsavel", "type": "string", "meta": {"required": True}},
                {"field": "telefone_contato_equipe", "type": "string", "meta": {"required": True}},
                {"field": "telefone_empresa", "type": "string", "meta": {"required": True}},
                {"field": "endereco", "type": "string", "meta": {"required": True}},
                {"field": "tipo_negocio", "type": "string", "meta": {"required": True}},
                {"field": "descricao_oferta", "type": "text", "meta": {"required": True}},
                {"field": "formas_pagamento", "type": "string", "meta": {"required": True}},
                {"field": "desconto_vista", "type": "string", "meta": {"required": True}},
                {"field": "parcelas_cartao", "type": "string", "meta": {"required": True}},
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
                try:
                    await client.post(f"{DIRECTUS_URL}/fields/propaganda", headers=headers, json=field)
                except httpx.HTTPStatusError as e:
                    if e.response.status_code == 400:
                        pass  # Field already exists
                    else:
                        raise

            # 7. Set Public Permissions for Collections (read, create, update, delete)
            collections_list = ["videos", "pet_perdido", "objeto_perdido", "propaganda"]
            actions = ["create", "read", "update", "delete"]

            for collection in collections_list:
                for action in actions:
                    permission = {
                        "collection": collection,
                        "action": action,
                        "role": None  # Public access
                    }
                    try:
                        await client.post(f"{DIRECTUS_URL}/permissions", headers=headers, json=permission)
                        print(f"Permission {action} for {collection} created successfully")
                    except httpx.HTTPStatusError as e:
                        if e.response.status_code == 400:
                            print(f"Permission {action} for {collection} already exists")
                        else:
                            raise

            return JSONResponse(content={"message": "Directus collections, fields and permissions configured successfully!"})

        except (httpx.RequestError, httpx.HTTPStatusError) as e:
            error_detail = f"Error setting up Directus: {e}"
            if hasattr(e, 'response') and e.response:
                error_detail += f" - Status: {e.response.status_code} - Response: {e.response.text}"
            print(error_detail)
            raise HTTPException(status_code=500, detail=error_detail)