// Supabase Edge Function: weather-forecast
// Deploy with: supabase functions deploy weather-forecast
// Uses Open-Meteo (free, no API key needed)

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RequestBody {
  origin_lat: number;
  origin_lng: number;
  dest_lat: number;
  dest_lng: number;
}

interface ForecastDay {
  date: string;
  temp_max: number;
  temp_min: number;
  condition: string;
  icon: string;
  wind_speed: number;
  precipitation: number;
}

interface CityForecast {
  city: string;
  lat: number;
  lng: number;
  forecast: ForecastDay[];
}

// Interpolate N waypoints between origin and destination
function interpolatePoints(
  lat1: number, lng1: number,
  lat2: number, lng2: number,
  steps: number,
): { lat: number; lng: number }[] {
  const points = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    points.push({
      lat: lat1 + (lat2 - lat1) * t,
      lng: lng1 + (lng2 - lng1) * t,
    });
  }
  return points;
}

// WMO weather code to human-readable condition
function wmoCondition(code: number): { label: string; icon: string } {
  if (code === 0) return { label: 'Clear', icon: '☀️' };
  if (code <= 3) return { label: 'Partly cloudy', icon: '⛅' };
  if (code <= 48) return { label: 'Foggy', icon: '🌫️' };
  if (code <= 57) return { label: 'Drizzle', icon: '🌦️' };
  if (code <= 67) return { label: 'Rain', icon: '🌧️' };
  if (code <= 77) return { label: 'Snow', icon: '❄️' };
  if (code <= 82) return { label: 'Rain showers', icon: '🌦️' };
  if (code <= 86) return { label: 'Snow showers', icon: '🌨️' };
  if (code <= 99) return { label: 'Thunderstorm', icon: '⛈️' };
  return { label: 'Unknown', icon: '🌡️' };
}

// Reverse geocode using Open-Meteo geocoding (approximate city name)
async function getCityName(lat: number, lng: number): Promise<string> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'TMS-FleetCore/1.0' },
    });
    const data = await res.json();
    return (
      data.address?.city ||
      data.address?.town ||
      data.address?.village ||
      data.address?.county ||
      `${lat.toFixed(2)},${lng.toFixed(2)}`
    );
  } catch {
    return `${lat.toFixed(2)},${lng.toFixed(2)}`;
  }
}

// Fetch 5-day forecast from Open-Meteo
async function getForecast(lat: number, lng: number): Promise<ForecastDay[]> {
  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lng.toString(),
    daily: 'temperature_2m_max,temperature_2m_min,weathercode,windspeed_10m_max,precipitation_sum',
    forecast_days: '5',
    timezone: 'auto',
  });
  const url = `https://api.open-meteo.com/v1/forecast?${params}`;
  const res = await fetch(url);
  const data = await res.json();

  if (!data.daily) return [];

  return data.daily.time.map((date: string, i: number) => {
    const code = data.daily.weathercode[i] ?? 0;
    const { label, icon } = wmoCondition(code);
    return {
      date,
      temp_max: Math.round(data.daily.temperature_2m_max[i] ?? 0),
      temp_min: Math.round(data.daily.temperature_2m_min[i] ?? 0),
      condition: label,
      icon,
      wind_speed: Math.round(data.daily.windspeed_10m_max[i] ?? 0),
      precipitation: Math.round(data.daily.precipitation_sum[i] ?? 0),
    };
  });
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body: RequestBody = await req.json();
    const { origin_lat, origin_lng, dest_lat, dest_lng } = body;

    if (!origin_lat || !origin_lng || !dest_lat || !dest_lng) {
      return new Response(
        JSON.stringify({ error: 'Missing coordinates' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // Get 3 waypoints: origin, midpoint, destination
    const points = interpolatePoints(origin_lat, origin_lng, dest_lat, dest_lng, 2);

    const forecasts: CityForecast[] = await Promise.all(
      points.map(async (pt) => {
        const [city, forecast] = await Promise.all([
          getCityName(pt.lat, pt.lng),
          getForecast(pt.lat, pt.lng),
        ]);
        return { city, lat: pt.lat, lng: pt.lng, forecast };
      }),
    );

    return new Response(
      JSON.stringify({ forecasts }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
