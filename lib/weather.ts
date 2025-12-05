const WEATHER_CODES: Record<number, string> = {
  0: 'Clear',
  1: 'Mainly Clear',
  2: 'Partly Cloudy',
  3: 'Overcast',
  45: 'Foggy',
  48: 'Depositing Rime Fog',
  51: 'Light Drizzle',
  53: 'Drizzle',
  55: 'Heavy Drizzle',
  56: 'Light Freezing Drizzle',
  57: 'Freezing Drizzle',
  61: 'Light Rain',
  63: 'Rain',
  65: 'Heavy Rain',
  66: 'Light Freezing Rain',
  67: 'Freezing Rain',
  71: 'Light Snow',
  73: 'Snow',
  75: 'Heavy Snow',
  77: 'Snow Grains',
  80: 'Light Showers',
  81: 'Showers',
  82: 'Heavy Showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm with Hail',
  99: 'Severe Thunderstorm'
};

export interface LiveWeather {
  temp: number;
  wind: number;
  condition: string;
}

function parseCoordinates(coords: string): { lat: number; lon: number } | null {
  if (!coords) {
    return null;
  }

  const [latRaw, lonRaw] = coords.split(',').map((part) => part.trim());
  const lat = Number(latRaw);
  const lon = Number(lonRaw);

  if (Number.isNaN(lat) || Number.isNaN(lon)) {
    return null;
  }

  return { lat, lon };
}

function mapWeatherCode(code?: number): string {
  if (code === undefined || Number.isNaN(code)) {
    return 'Clear';
  }

  return WEATHER_CODES[code] ?? 'Clear';
}

export async function fetchWeatherForCoordinates(coordinates: string): Promise<LiveWeather | null> {
  const parsed = parseCoordinates(coordinates);
  if (!parsed) {
    return null;
  }

  const params = new URLSearchParams({
    latitude: parsed.lat.toString(),
    longitude: parsed.lon.toString(),
    current_weather: 'true',
    timezone: 'UTC'
  });

  try {
    const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`, {
      headers: {
        'Content-Type': 'application/json'
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const current = data?.current_weather;
    if (!current) {
      return null;
    }

    return {
      temp: Math.round(current.temperature),
      wind: Math.round(current.windspeed),
      condition: mapWeatherCode(current.weathercode)
    };
  } catch (error) {
    console.error('Weather fetch failed', error);
    return null;
  }
}
