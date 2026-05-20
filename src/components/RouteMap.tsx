import { useEffect, useRef, useState } from "react";
import { MapPin, Navigation, Loader2 } from "lucide-react";

// Use the global Leaflet instance from index.html
declare const L: any;

async function fetchOSRMRoute(coords: [number, number][]) {
  // coords: array of [lat, lng]
  const waypoints = coords.map(([lat, lng]) => `${lng},${lat}`).join(";");
  const url = `https://router.project-osrm.org/route/v1/driving/${waypoints}?overview=full&geometries=geojson&alternatives=true`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.code !== "Ok" || !data.routes?.length) return null;
  return data.routes; // array of route objects, each with geometry.coordinates ([lng,lat])
}

async function geocodeCity(name: string): Promise<[number, number] | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(name)}&format=json&limit=1`,
      { headers: { "Accept-Language": "en" } }
    );
    const data = await res.json();
    if (data?.length) return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
    return null;
  } catch { return null; }
}

interface RouteMapProps {
  shipment: {
    id: string;
    pickup_lat: number | null;
    pickup_lng: number | null;
    pickup_warehouse?: string | null;
    dest_lat: number | null;
    dest_lng: number | null;
    destination?: string | null;
  } | null;
  waypoints?: string[];
}

export default function RouteMap({ shipment, waypoints = [] }: RouteMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [loadingRoute, setLoadingRoute] = useState(false);

  const pickup = { lat: shipment?.pickup_lat, lng: shipment?.pickup_lng, label: shipment?.pickup_warehouse };
  const dest   = { lat: shipment?.dest_lat,   lng: shipment?.dest_lng,   label: shipment?.destination };
  const hasCoords = pickup.lat && pickup.lng && dest.lat && dest.lng;

  useEffect(() => {
    if (!hasCoords || !mapRef.current) return;

    let mounted = true;
    setLoadingRoute(true);

    const initMap = async () => {
      if (typeof L === 'undefined') {
        // Wait a bit if L is not yet loaded (though it should be from index.html)
        await new Promise(resolve => setTimeout(resolve, 200));
        if (typeof L === 'undefined') {
          if (mounted) setLoadingRoute(false);
          return;
        }
      }

      if (!mounted) return;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const map = L.map(mapRef.current!, { zoomControl: true, scrollWheelZoom: false });
      mapInstanceRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap",
      }).addTo(map);

      const mkIcon = (color: string, size = 14) => L.divIcon({
        className: "",
        html: `<div style="width:${size}px;height:${size}px;background:${color};border:2.5px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.5)"></div>`,
        iconAnchor: [size / 2, size / 2],
      });

      L.marker([pickup.lat, pickup.lng], { icon: mkIcon("#10B981", 16) })
        .addTo(map).bindPopup(`<b>Pickup</b><br/>${pickup.label || ""}`);

      L.marker([dest.lat, dest.lng], { icon: mkIcon("#EF4444", 16) })
        .addTo(map).bindPopup(`<b>Destination</b><br/>${dest.label || ""}`);

      // Build coordinate list: pickup → geocoded waypoints → dest
      let routeCoords: [number, number][] = [[pickup.lat!, pickup.lng!]];

      if (waypoints?.length > 0) {
        // Geocode intermediate waypoints (skip first/last if they match pickup/dest)
        const middle = waypoints.slice(1, -1);
        for (const wp of middle) {
          const coords = await geocodeCity(wp);
          if (coords) routeCoords.push(coords);
        }
      }

      routeCoords.push([dest.lat!, dest.lng!]);

      // Deduplicate consecutive identical points
      routeCoords = routeCoords.filter((c, i) =>
        i === 0 || (c[0] !== routeCoords[i - 1][0] || c[1] !== routeCoords[i - 1][1])
      );

      let bounds;

      try {
        const routes = await fetchOSRMRoute(routeCoords);
        if (routes && mounted) {
          // Primary route — solid blue
          const primary = routes[0];
          const primaryLatLngs = primary.geometry.coordinates.map(([lng, lat]: [number, number]) => [lat, lng]);

          L.polyline(primaryLatLngs, {
            color: "#3B82F6",
            weight: 4,
            opacity: 0.9,
          }).addTo(map).bindTooltip(
            `Main route · ${Math.round(primary.distance / 1000)} km · ${(primary.duration / 3600).toFixed(1)} hrs`,
            { sticky: true }
          );

          // Alternative route — dashed purple (if exists)
          if (routes[1]) {
            const alt = routes[1];
            const altLatLngs = alt.geometry.coordinates.map(([lng, lat]: [number, number]) => [lat, lng]);
            L.polyline(altLatLngs, {
              color: "#8B5CF6",
              weight: 3,
              opacity: 0.65,
              dashArray: "10, 7",
            }).addTo(map).bindTooltip(
              `Alt route · ${Math.round(alt.distance / 1000)} km · ${(alt.duration / 3600).toFixed(1)} hrs`,
              { sticky: true }
            );
          }

          // Waypoint markers (intermediate)
          if (waypoints?.length > 2) {
            const middle = waypoints.slice(1, -1);
            const geocoded = routeCoords.slice(1, -1);
            geocoded.forEach((c, i) => {
              L.marker(c, { icon: mkIcon("#60A5FA", 10) })
                .addTo(map)
                .bindTooltip(middle[i] || "", { permanent: false });
            });
          }

          // Fit to primary route bounds
          bounds = L.latLngBounds(primaryLatLngs);
        }
      } catch (e) {
        // Fallback: straight line
        const pts: [number, number][] = [[pickup.lat!, pickup.lng!], [dest.lat!, dest.lng!]];
        L.polyline(pts, { color: "#3B82F6", weight: 4, opacity: 0.8 }).addTo(map);
        bounds = L.latLngBounds(pts);
      }

      if (bounds && mounted) map.fitBounds(bounds, { padding: [40, 40] });
      if (mounted) setLoadingRoute(false);
    };

    initMap();

    return () => {
      mounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [shipment?.id, hasCoords, JSON.stringify(waypoints)]);

  if (!hasCoords) {
    return (
      <div className="p-4 bg-slate-800/60 border border-slate-700/40 rounded-xl">
        <div className="flex items-center gap-2 mb-3">
          <Navigation className="w-4 h-4 text-blue-400" />
          <span className="text-white font-semibold text-sm">Route Map</span>
        </div>
        <div className="h-48 flex flex-col items-center justify-center text-slate-500 bg-slate-900/40 rounded-lg border border-slate-700/30 border-dashed">
          <MapPin className="w-8 h-8 mb-2 opacity-40" />
          <p className="text-xs text-center">No coordinates available.<br />Add lat/lng to the shipment to view the route map.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-slate-800/60 border border-slate-700/40 rounded-xl">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Navigation className="w-4 h-4 text-blue-400" />
          <span className="text-white font-semibold text-sm">Route Map</span>
          {loadingRoute && <Loader2 className="w-3.5 h-3.5 text-blue-400 animate-spin" />}
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
            <span className="text-slate-400">Pickup</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
            <span className="text-slate-400">Destination</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-6 h-0.5 bg-blue-500 rounded" />
            <span className="text-slate-400">Main</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-6 h-0.5 opacity-70" style={{ borderTop: "2px dashed #8B5CF6", background: "none" }} />
            <span className="text-slate-400">Alt</span>
          </span>
        </div>
      </div>
      <div ref={mapRef} className="h-64 w-full rounded-lg overflow-hidden" style={{ zIndex: 0 }} />
      <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
        <span className="truncate max-w-[45%]">📍 {pickup.label}</span>
        <span className="text-slate-600 mx-1">→</span>
        <span className="truncate max-w-[45%] text-right">🏁 {dest.label}</span>
      </div>
    </div>
  );
}
