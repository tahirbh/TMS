import { useEffect, useState } from "react";
import { Wind, Droplets, Thermometer, Loader2, MapPin, Cloud, AlertCircle } from "lucide-react";

const WMO: Record<number, { label: string; icon: string; bg: string }> = {
  0: { label: "Clear Sky", icon: "☀️", bg: "from-amber-500/20 to-orange-500/10" },
  1: { label: "Mainly Clear", icon: "🌤️", bg: "from-amber-400/15 to-yellow-500/10" },
  2: { label: "Partly Cloudy", icon: "⛅", bg: "from-slate-500/20 to-blue-500/10" },
  3: { label: "Overcast", icon: "☁️", bg: "from-slate-600/20 to-slate-500/10" },
  45: { label: "Foggy", icon: "🌫️", bg: "from-slate-600/20 to-slate-500/10" },
  51: { label: "Light Drizzle", icon: "🌦️", bg: "from-blue-500/15 to-cyan-500/10" },
  61: { label: "Rain", icon: "🌧️", bg: "from-blue-600/20 to-blue-500/10" },
  65: { label: "Heavy Rain", icon: "🌧️", bg: "from-blue-700/25 to-blue-600/15" },
  71: { label: "Light Snow", icon: "🌨️", bg: "from-sky-400/20 to-white/5" },
  73: { label: "Snow", icon: "❄️", bg: "from-sky-300/20 to-white/5" },
  80: { label: "Showers", icon: "🌦️", bg: "from-blue-500/15 to-cyan-500/10" },
  95: { label: "Thunderstorm", icon: "⛈️", bg: "from-purple-700/25 to-slate-700/20" },
  99: { label: "Heavy Storm", icon: "⛈️", bg: "from-purple-800/30 to-red-700/15" },
};

function wmo(code: number) {
  if (WMO[code]) return WMO[code];
  const keys = Object.keys(WMO).map(Number).sort((a, b) => b - a);
  for (const k of keys) if (code >= k) return WMO[k];
  return { label: "Unknown", icon: "🌡️", bg: "from-slate-700/20 to-slate-600/10" };
}

function risk(code: number, wind: number, precip: number) {
  if (code >= 95 || wind > 65 || precip > 25) return "high";
  if (code >= 51 || wind > 35 || precip > 5) return "medium";
  return "low";
}

const riskStyle = {
  low: "border-emerald-500/30 text-emerald-400",
  medium: "border-amber-500/30 text-amber-400",
  high: "border-red-500/30 text-red-400",
};
const riskBadge = {
  low: "bg-emerald-500/20 text-emerald-300",
  medium: "bg-amber-500/20 text-amber-300",
  high: "bg-red-500/20 text-red-300",
};

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function fmtDate(str: string) {
  const d = new Date(str + "T12:00:00");
  return `${DAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`;
}
function fmtHour(str: string) {
  const d = new Date(str);
  const h = d.getHours();
  return h === 0 ? "12am" : h < 12 ? `${h}am` : h === 12 ? "12pm" : `${h - 12}pm`;
}

async function geocode(name: string): Promise<[number, number] | null> {
  try {
    const r = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(name)}&format=json&limit=1`, { headers: { "Accept-Language": "en" } });
    const d = await r.json();
    if (d?.length) return [parseFloat(d[0].lat), parseFloat(d[0].lon)];
  } catch {}
  return null;
}

async function fetchWeatherData(lat: number, lng: number) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max,precipitation_probability_max&hourly=temperature_2m,weathercode,precipitation,windspeed_10m,precipitation_probability&timezone=auto&forecast_days=5`;
  const r = await fetch(url);
  const d = await r.json();
  return d;
}

interface WeatherData {
  daily: Array<{
    date: string;
    weathercode: number;
    tempMax: number;
    tempMin: number;
    precipitation: number;
    precipProbability: number;
    windspeed: number;
  }>;
  hourly: Array<{
    time: string;
    temp: number;
    weathercode: number;
    precip: number;
    wind: number;
    precipProb?: number;
  }>;
}

function DayCard({ day, dispatchDay }: { day: WeatherData['daily'][0], dispatchDay: string }) {
  const info = wmo(day.weathercode);
  const r = risk(day.weathercode, day.windspeed, day.precipitation);
  const isDispatch = day.date === dispatchDay;

  return (
    <div className={`flex-shrink-0 w-[88px] sm:w-28 rounded-xl border bg-gradient-to-b ${info.bg} ${riskStyle[r]} ${isDispatch ? "ring-1 ring-blue-400/60" : ""} p-2 text-center relative`}>
      {isDispatch && (
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap">DISPATCH</div>
      )}
      <p className="text-slate-400 text-[9px] font-medium mb-1 leading-tight">{fmtDate(day.date)}</p>
      <div className="text-xl mb-1">{info.icon}</div>
      <p className="text-white text-[9px] font-medium leading-tight mb-1.5">{info.label}</p>
      <div className="space-y-0.5 text-[9px]">
        <div className="flex items-center justify-center gap-0.5 text-slate-300">
          <Thermometer className="w-2 h-2 flex-shrink-0" />
          <span className="truncate">{day.tempMin?.toFixed(0)}°–{day.tempMax?.toFixed(0)}°</span>
        </div>
        <div className="flex items-center justify-center gap-0.5 text-blue-300">
          <Droplets className="w-2 h-2 flex-shrink-0" />
          <span>{day.precipitation?.toFixed(1)}mm</span>
        </div>
        <div className="flex items-center justify-center gap-0.5 text-slate-300">
          <Wind className="w-2 h-2 flex-shrink-0" />
          <span>{day.windspeed?.toFixed(0)}km/h</span>
        </div>
      </div>
      <div className={`mt-1.5 text-[8px] font-bold uppercase px-1 py-0.5 rounded leading-tight ${riskBadge[r]}`}>
        {r === "high" ? "⚠ HIGH" : r === "medium" ? "⚡ MOD" : "✓ OK"}
      </div>
    </div>
  );
}

function HourlyStrip({ hours }: { hours: WeatherData['hourly'] }) {
  return (
    <div className="mt-2">
      <p className="text-slate-500 text-[10px] uppercase tracking-wider mb-1.5">24h Hourly — Dispatch Day</p>
      <div className="flex gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
        {hours.map((h, i) => {
          const info = wmo(h.weathercode);
          return (
            <div key={i} className="flex-shrink-0 w-10 sm:w-12 bg-slate-900/50 border border-slate-700/40 rounded-lg p-1 text-center">
              <p className="text-slate-500 text-[8px] leading-tight">{fmtHour(h.time)}</p>
              <div className="text-sm my-0.5">{info.icon}</div>
              <p className="text-white text-[9px] font-medium">{h.temp?.toFixed(0)}°</p>
              <p className="text-blue-300 text-[8px]">{h.precip > 0 ? `${h.precip?.toFixed(1)}` : "–"}</p>
              <p className="text-slate-400 text-[8px]">{h.wind?.toFixed(0)}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LocationWeatherCard({ location, dispatchDate }: { location: { name: string; lat: number; lng: number }; dispatchDate: string }) {
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchWeatherData(location.lat, location.lng).then(d => {
      if (!d?.daily) { setLoading(false); return; }
      const daily = d.daily.time.map((date: string, i: number) => ({
        date,
        weathercode: d.daily.weathercode[i],
        tempMax: d.daily.temperature_2m_max[i],
        tempMin: d.daily.temperature_2m_min[i],
        precipitation: d.daily.precipitation_sum[i],
        precipProbability: d.daily.precipitation_probability_max[i],
        windspeed: d.daily.windspeed_10m_max[i],
      }));

      const dispatchHours: WeatherData['hourly'] = [];
      if (d.hourly) {
        d.hourly.time.forEach((t: string, i: number) => {
          if (t.startsWith(dispatchDate)) {
            dispatchHours.push({
              time: t,
              temp: d.hourly.temperature_2m[i],
              weathercode: d.hourly.weathercode[i],
              precip: d.hourly.precipitation[i],
              wind: d.hourly.windspeed_10m[i],
              precipProb: d.hourly.precipitation_probability?.[i],
            });
          }
        });
      }

      setData({ daily, hourly: dispatchHours });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [location.lat, location.lng, dispatchDate]);

  if (loading) return (
    <div className="p-3 bg-slate-800/60 border border-slate-700/40 rounded-xl flex items-center gap-2">
      <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
      <span className="text-slate-400 text-xs">Loading weather for {location.name}...</span>
    </div>
  );

  if (!data) return null;

  const overallRisk = data.daily.length
    ? (() => {
        const risks = data.daily.map(d => risk(d.weathercode, d.windspeed, d.precipitation));
        if (risks.includes("high")) return "high";
        if (risks.includes("medium")) return "medium";
        return "low";
      })()
    : "low";

  return (
    <div className={`p-2.5 sm:p-3 bg-slate-900/60 border rounded-xl ${riskStyle[overallRisk]} overflow-hidden`}>
      <div className="flex items-center justify-between mb-2 gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <MapPin className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
          <span className="text-white text-xs sm:text-sm font-semibold truncate">{location.name}</span>
        </div>
        <span className={`text-[9px] sm:text-[10px] font-bold uppercase px-1.5 sm:px-2 py-0.5 rounded-full flex-shrink-0 ${riskBadge[overallRisk]}`}>
          {overallRisk === "high" ? "⚠ HIGH" : overallRisk === "medium" ? "⚡ MOD" : "✓ OK"}
        </span>
      </div>
      <div className="flex gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
        {data.daily.map((day, i) => (
          <DayCard key={i} day={day} dispatchDay={dispatchDate} />
        ))}
      </div>
      {data.hourly?.length > 0 && <HourlyStrip hours={data.hourly} />}
    </div>
  );
}

interface WeatherForecastProps {
  shipment: {
    id: string;
    pickup_lat: number | null;
    pickup_lng: number | null;
    pickup_warehouse?: string | null;
    dest_lat: number | null;
    dest_lng: number | null;
    destination?: string | null;
    dispatch_date?: string | null;
  } | null;
  waypoints?: string[];
}

export default function WeatherForecast({ shipment, waypoints = [] }: WeatherForecastProps) {
  const [locations, setLocations] = useState<Array<{ name: string; lat: number; lng: number; type: string }>>([]);
  const [geocoding, setGeocoding] = useState(false);

  const hasCoords = shipment?.pickup_lat && shipment?.dest_lat;
  const dispatchDate = shipment?.dispatch_date || new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (!hasCoords) return;
    setGeocoding(true);

    const buildLocations = async () => {
      const locs: Array<{ name: string; lat: number; lng: number; type: string }> = [];

      // Pickup
      locs.push({
        name: shipment.pickup_warehouse || "Pickup",
        lat: shipment.pickup_lat!,
        lng: shipment.pickup_lng!,
        type: "pickup",
      });

      // Intermediate waypoints
      const middleWaypoints = waypoints?.length > 2 ? waypoints.slice(1, -1) : [];
      for (const wp of middleWaypoints.slice(0, 4)) {
        const coords = await geocode(wp);
        if (coords) locs.push({ name: wp, lat: coords[0], lng: coords[1], type: "waypoint" });
      }

      // Destination
      locs.push({
        name: shipment.destination || "Destination",
        lat: shipment.dest_lat!,
        lng: shipment.dest_lng!,
        type: "destination",
      });

      setLocations(locs);
      setGeocoding(false);
    };

    buildLocations();
  }, [shipment?.id, JSON.stringify(waypoints), hasCoords]);

  if (!hasCoords) return (
    <div className="p-4 bg-slate-900/40 rounded-2xl border border-slate-800 text-center">
      <AlertCircle className="w-8 h-8 text-slate-700 mx-auto mb-2" />
      <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Incomplete Coordinates</p>
      <p className="text-[10px] text-slate-600 mt-1 uppercase tracking-tight">Mission requires geolocation data for weather intelligence</p>
    </div>
  );

  return (
    <div className="space-y-3 min-w-0">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Cloud className="w-4 h-4 text-blue-400 flex-shrink-0" />
          <span className="text-white font-semibold text-sm truncate">5-Day Route Weather Forecast</span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {geocoding && <Loader2 className="w-3.5 h-3.5 text-blue-400 animate-spin" />}
          <span className="text-slate-500 text-[10px] sm:text-xs whitespace-nowrap">{dispatchDate}</span>
        </div>
      </div>

      <div className="space-y-2">
        {locations.map((loc) => (
          <LocationWeatherCard key={`${loc.lat}-${loc.lng}`} location={loc} dispatchDate={dispatchDate} />
        ))}
      </div>
      
      <p className="text-slate-600 text-[10px] text-right">Powered by Open-Meteo • Real-time forecasts</p>
    </div>
  );
}
