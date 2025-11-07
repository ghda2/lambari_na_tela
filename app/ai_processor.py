import httpx
import asyncio
import google.generativeai as genai
from datetime import datetime
import os

# Configuration from environment variables
DIRECTUS_URL = os.getenv("DIRECTUS_URL", "http://directus:8055")
DIRECTUS_ADMIN_EMAIL = os.getenv("DIRECTUS_ADMIN_EMAIL", "admin@example.com")
DIRECTUS_ADMIN_PASSWORD = os.getenv("DIRECTUS_ADMIN_PASSWORD", "password")
DIRECTUS_API_TOKEN = os.getenv("DIRECTUS_API_TOKEN")
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY", "AIzaSyBXmW7BWgLuFWATbz8ylmlu6wD-_fXsGgo")

# Configure Google AI
genai.configure(api_key=GOOGLE_API_KEY)

# System prompt for AI text generation
SYSTEM_PROMPT = """
Você é um especialista em jornalismo e comunicação. Sua tarefa é reescrever textos de reportagens de forma mais profissional, objetiva e atrativa para o público.

Regras importantes:
- Mantenha os fatos originais intactos
- Melhore a linguagem e estrutura do texto
- Torne o texto mais envolvente e profissional
- Mantenha o tom jornalístico adequado
- Não adicione informações que não estejam no texto original
- Foque em clareza, concisão e impacto

O texto original é sobre uma reportagem. Reescreva-o de forma jornalística profissional.
"""

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

async def get_unprocessed_videos(token):
    """Get videos that don't have descricao_ia filled"""
    headers = {"Authorization": f"Bearer {token}"}

    async with httpx.AsyncClient() as client:
        try:
            # Filter for records where descricao_ia is null or empty
            response = await client.get(
                f"{DIRECTUS_URL}/items/videos",
                headers=headers,
                params={
                    "filter[descricao_ia][_null]": "true",
                    "limit": 10  # Process in batches
                }
            )
            response.raise_for_status()
            return response.json().get("data", [])
        except Exception as e:
            print(f"Error fetching videos: {e}")
            return []

async def generate_ai_description(original_text, titulo, categoria):
    """Generate AI description using Google Gemini"""
    try:
        model = genai.GenerativeModel('gemini-2.0-flash')

        prompt = f"""
Título da reportagem: {titulo}
Categoria: {categoria}

Texto original da reportagem:
{original_text}

Por favor, reescreva este texto de forma mais profissional e jornalística, mantendo todos os fatos originais.
"""

        response = model.generate_content(
            f"{SYSTEM_PROMPT}\n\n{prompt}",
            generation_config=genai.types.GenerationConfig(
                temperature=0.7,
                max_output_tokens=1000,
            )
        )

        return response.text.strip()

    except Exception as e:
        print(f"Error generating AI description: {e}")
        return None

async def update_video_description(token, video_id, ai_description):
    """Update video record with AI-generated description"""
    headers = {"Authorization": f"Bearer {token}"}

    async with httpx.AsyncClient() as client:
        try:
            response = await client.patch(
                f"{DIRECTUS_URL}/items/videos/{video_id}",
                headers=headers,
                json={
                    "descricao_ia": ai_description,
                    "processed_at": datetime.now().isoformat()
                }
            )
            response.raise_for_status()
            print(f"Updated video {video_id} with AI description")
            return True
        except Exception as e:
            print(f"Error updating video {video_id}: {e}")
            return False

async def process_videos():
    """Main function to process videos with AI"""
    print("Starting AI video processing...")

    # Wait for Directus and authenticate
    try:
        token = await wait_for_directus()
    except Exception as e:
        print(f"Failed to connect to Directus: {e}")
        return

    # Get unprocessed videos
    videos = await get_unprocessed_videos(token)
    print(f"Found {len(videos)} videos to process")

    if not videos:
        print("No videos to process")
        return

    # Process each video
    for video in videos:
        video_id = video['id']
        original_description = video.get('descricao', '')
        titulo = video.get('titulo', '')
        categoria = video.get('categoria', '')

        if not original_description:
            print(f"Skipping video {video_id} - no description")
            continue

        print(f"Processing video {video_id}: {titulo}")

        # Generate AI description
        ai_description = await generate_ai_description(
            original_description,
            titulo,
            categoria
        )

        if ai_description:
            # Update the record
            success = await update_video_description(token, video_id, ai_description)
            if success:
                print(f"Successfully processed video {video_id}")
            else:
                print(f"Failed to update video {video_id}")
        else:
            print(f"Failed to generate AI description for video {video_id}")

        # Small delay to avoid rate limits
        await asyncio.sleep(1)

    print("AI video processing completed")

if __name__ == "__main__":
    asyncio.run(process_videos())