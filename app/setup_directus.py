import os
import httpx
import asyncio
import time

# Configuration from environment variables
DIRECTUS_URL = os.getenv("DIRECTUS_URL", "http://directus:8055")
DIRECTUS_ADMIN_EMAIL = os.getenv("DIRECTUS_ADMIN_EMAIL", "admin@example.com")
DIRECTUS_ADMIN_PASSWORD = os.getenv("DIRECTUS_ADMIN_PASSWORD", "password")

async def authenticate_directus():
    """Authenticate with Directus and return the access token"""
    async with httpx.AsyncClient() as client:
        try:
            auth_response = await client.post(f"{DIRECTUS_URL}/auth/login", json={
                "email": DIRECTUS_ADMIN_EMAIL,
                "password": DIRECTUS_ADMIN_PASSWORD
            })
            auth_response.raise_for_status()
            token = auth_response.json()['data']['access_token']
            return token
        except Exception as e:
            print(f"Error authenticating with Directus: {e}")
            return None

async def wait_for_directus():
    """Wait for Directus to be ready"""
    print("Waiting for Directus to be ready...")
    max_attempts = 30  # Wait up to 5 minutes (30 * 10s)
    attempt = 0
    while attempt < max_attempts:
        token = await authenticate_directus()
        if token:
            print("Directus is ready!")
            return token
        attempt += 1
        print(f"Attempt {attempt}/{max_attempts} failed. Retrying in 10 seconds...")
        await asyncio.sleep(10)
    raise Exception("Directus did not become ready within the timeout period.")

async def create_videos_collection(token):
    """Create the 'videos' collection in Directus"""
    headers = {"Authorization": f"Bearer {token}"}

    async with httpx.AsyncClient() as client:
        try:
            # Check if collection already exists
            check_response = await client.get(f"{DIRECTUS_URL}/collections/videos", headers=headers)
            if check_response.status_code == 200:
                print("Collection 'videos' already exists.")
                return True

            # Create Collection
            collection_response = await client.post(f"{DIRECTUS_URL}/collections", headers=headers, json={
                "collection": "videos",
                "schema": {"name": "videos"}
            })
            if collection_response.status_code == 400:
                print("Collection 'videos' might already exist.")
                return True
            collection_response.raise_for_status()
            print("Collection 'videos' created successfully!")

            # Create Fields
            fields = [
                {"field": "primeiro_nome", "type": "string"},
                {"field": "sobrenome", "type": "string"},
                {"field": "titulo", "type": "string"},
                {"field": "descricao", "type": "text"},
                {"field": "descricao_ia", "type": "text"},
                {"field": "categoria", "type": "string"},
                {"field": "img_path", "type": "string"},
                {"field": "video_path", "type": "string"},
                {"field": "ip", "type": "string"},
                {"field": "datetime", "type": "datetime"}
            ]

            for field in fields:
                field_response = await client.post(f"{DIRECTUS_URL}/fields/videos", headers=headers, json=field)
                field_response.raise_for_status()
                print(f"Field '{field['field']}' created successfully!")

            return True

        except (httpx.RequestError, httpx.HTTPStatusError) as e:
            print(f"Error setting up Directus: {e}")
            return False

async def main():
    print("Starting Directus setup...")
    try:
        token = await wait_for_directus()
        success = await create_videos_collection(token)
        if success:
            print("Directus setup completed successfully!")
        else:
            print("Directus setup failed.")
    except Exception as e:
        print(f"Setup failed: {e}")

if __name__ == "__main__":
    asyncio.run(main())