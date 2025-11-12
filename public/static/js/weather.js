async function fetchWeather() {
    try {
        console.log('Tentando buscar dados do tempo...');
        const response = await fetch('https://api.open-meteo.com/v1/forecast?latitude=-23.3833&longitude=-50.1167&current_weather=true&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m&timezone=America/Sao_Paulo');

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Dados recebidos:', data);

        if (!data.current_weather) {
            throw new Error('Dados de tempo atual não encontrados');
        }

        const current = data.current_weather;
        const temperature = current.temperature;
        const windSpeed = current.windspeed;
        const weatherCode = current.weathercode;

        // Mapeamento de códigos de tempo para ícones e descrições
        const weatherMap = {
            0: { icon: '☀️', desc: 'Céu limpo' },
            1: { icon: '🌤️', desc: 'Parcialmente nublado' },
            2: { icon: '⛅', desc: 'Nublado' },
            3: { icon: '☁️', desc: 'Muito nublado' },
            45: { icon: '🌫️', desc: 'Neblina' },
            48: { icon: '🌫️', desc: 'Neblina congelante' },
            51: { icon: '🌦️', desc: 'Garoa leve' },
            53: { icon: '🌦️', desc: 'Garoa moderada' },
            55: { icon: '🌦️', desc: 'Garoa intensa' },
            56: { icon: '🌨️', desc: 'Garoa congelante leve' },
            57: { icon: '🌨️', desc: 'Garoa congelante intensa' },
            61: { icon: '🌧️', desc: 'Chuva leve' },
            63: { icon: '🌧️', desc: 'Chuva moderada' },
            65: { icon: '🌧️', desc: 'Chuva forte' },
            66: { icon: '🌨️', desc: 'Chuva congelante leve' },
            67: { icon: '🌨️', desc: 'Chuva congelante forte' },
            71: { icon: '❄️', desc: 'Neve leve' },
            73: { icon: '❄️', desc: 'Neve moderada' },
            75: { icon: '❄️', desc: 'Neve forte' },
            77: { icon: '❄️', desc: 'Grãos de neve' },
            80: { icon: '🌧️', desc: 'Chuva leve intermitente' },
            81: { icon: '🌧️', desc: 'Chuva moderada intermitente' },
            82: { icon: '🌧️', desc: 'Chuva forte intermitente' },
            85: { icon: '❄️', desc: 'Neve leve intermitente' },
            86: { icon: '❄️', desc: 'Neve forte intermitente' },
            95: { icon: '⛈️', desc: 'Tempestade' },
            96: { icon: '⛈️', desc: 'Tempestade com granizo leve' },
            99: { icon: '⛈️', desc: 'Tempestade com granizo forte' }
        };

        const weather = weatherMap[weatherCode] || { icon: '❓', desc: 'Desconhecido' };

        document.getElementById('weather-icon').textContent = weather.icon;
        document.getElementById('temperature').textContent = `Temperatura: ${temperature}°C`;
        document.getElementById('description').textContent = `Condição: ${weather.desc}`;
        document.getElementById('wind').textContent = `Vento: ${windSpeed} km/h`;

        console.log('Previsão do tempo atualizada com sucesso');
    } catch (error) {
        console.error('Erro ao buscar previsão:', error);
        document.getElementById('temperature').textContent = 'Erro ao carregar';
        document.getElementById('description').textContent = 'Tente novamente mais tarde';
        document.getElementById('wind').textContent = '';

        // Tentar novamente em 30 segundos
        setTimeout(fetchWeather, 30000);
    }
}

document.addEventListener('DOMContentLoaded', fetchWeather);
