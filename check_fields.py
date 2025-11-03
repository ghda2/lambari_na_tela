import asyncio
import httpx

async def check_fields():
    try:
        # Authenticate
        async with httpx.AsyncClient() as client:
            response = await client.post('http://directus:8055/auth/login', json={
                'email': 'admin@example.com',
                'password': 'password'
            })
            token = response.json()['data']['access_token']

            # Get fields
            headers = {'Authorization': f'Bearer {token}'}
            response = await client.get('http://directus:8055/fields/videos', headers=headers)
            fields = response.json()['data']
            print('Fields in videos collection:')
            for field in fields:
                print(f'  - {field["field"]}: {field["type"]}')
    except Exception as e:
        print(f'Error: {e}')

asyncio.run(check_fields())