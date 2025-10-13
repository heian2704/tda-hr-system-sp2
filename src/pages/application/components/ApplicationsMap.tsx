import React, { useEffect, useMemo, useRef, useState } from "react";

export type AppItem = {
  _id: string;
  name: string;
  phoneNumber?: string;
  address?: string;
  information?: string;
  position?: string;
  status?: string;
  attendanceStatus?: string;
  date: string;
};

export type GeoPoint = { lat: number; lon: number };

declare global {
  interface Window {
    google: typeof google;
  }
}

const GMAPS_API_KEY = (import.meta as ImportMeta).env?.VITE_GOOGLE_MAPS_API_KEY as string | undefined;

function loadGoogleMaps(apiKey?: string): Promise<typeof google> {
  return new Promise((resolve, reject) => {
    if (typeof window !== 'undefined' && window.google && window.google.maps) {
      resolve(window.google);
      return;
    }
    if (!apiKey) {
      reject(new Error('Google Maps API key is not configured. Set VITE_GOOGLE_MAPS_API_KEY.'));
      return;
    }
    const existing = document.querySelector('script[data-gmaps-loader]') as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener('load', () => resolve(window.google));
      existing.addEventListener('error', reject);
      return;
    }
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.defer = true;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
    script.setAttribute('data-gmaps-loader', 'true');
    script.onload = () => resolve(window.google);
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

// Simple localStorage cache for geocoding results
const loadGeoCache = (): Record<string, GeoPoint> => {
  try {
    const raw = localStorage.getItem('geoCache:gmap:v1');
    return raw ? JSON.parse(raw) : {};
  } catch {
    // ignore read errors (e.g., private mode)
    return {};
  }
};

const saveGeoCache = (cache: Record<string, GeoPoint>) => {
  try {
    localStorage.setItem('geoCache:gmap:v1', JSON.stringify(cache));
  } catch {
    // ignore write errors (e.g., private mode/quota)
  }
};

// Geocode using Google Maps Geocoder Service
async function geocodeAddressGMap(geocoder: google.maps.Geocoder, address: string): Promise<GeoPoint | null> {
  return new Promise((resolve) => {
    geocoder.geocode({ address }, (results, status) => {
      if (status === 'OK' && results && results[0] && results[0].geometry) {
        const loc = results[0].geometry.location as google.maps.LatLng;
        resolve({ lat: loc.lat(), lon: loc.lng() });
      } else {
        resolve(null);
      }
    });
  });
}

const ApplicationsMap: React.FC<{ applications: AppItem[]; active?: boolean }> = ({ applications, active = false }) => {
  const [cache, setCache] = useState<Record<string, GeoPoint>>(() => loadGeoCache());
  const [loadingGeo, setLoadingGeo] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const mapElRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[] | null>(null);
  const boundsRef = useRef<google.maps.LatLngBounds | null>(null);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);

  const addresses = useMemo(() =>
    Array.from(new Set((applications || []).map(a => (a.address || '').trim()).filter(a => a.length > 0))),
    [applications]
  );

  useEffect(() => {
    let mounted = true;
    async function run() {
      setLoadingGeo(true);
      try {
  const google = await loadGoogleMaps(GMAPS_API_KEY);
        if (!mounted) return;
        if (!geocoderRef.current) geocoderRef.current = new google.maps.Geocoder();
        const geocoder = geocoderRef.current;
        const nextCache: Record<string, GeoPoint> = { ...cache };
        for (const addr of addresses) {
          if (!mounted) break;
          if (nextCache[addr]) continue;
          const pt = await geocodeAddressGMap(geocoder, addr);
          if (pt) {
            nextCache[addr] = pt;
            if (mounted) {
              setCache({ ...nextCache });
              saveGeoCache(nextCache);
            }
          }
          await new Promise(r => setTimeout(r, 250));
        }
      } catch {
        // failed to load or geocode; handled by UI state
      } finally {
        if (mounted) setLoadingGeo(false);
      }
    }
    run();
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addresses.join('|')]);

  const points: { addr: string; pt: GeoPoint; names: string[] }[] = useMemo(() => {
    const byAddr: Record<string, { addr: string; pt: GeoPoint; names: string[] }> = {};
    for (const a of applications) {
      const addr = (a.address || '').trim();
      if (!addr) continue;
      const pt = cache[addr];
      if (!pt) continue;
      if (!byAddr[addr]) byAddr[addr] = { addr, pt, names: [] };
      byAddr[addr].names.push(a.name);
    }
    return Object.values(byAddr);
  }, [applications, cache]);

  // Initialize Google Map once
  useEffect(() => {
    let disposed = false;
    async function init() {
      if (!mapElRef.current || mapRef.current) return;
      try {
        const google = await loadGoogleMaps(GMAPS_API_KEY);
        if (disposed || !mapElRef.current) return;
        const map = new google.maps.Map(mapElRef.current, {
          center: { lat: 20, lng: 0 },
          zoom: 2,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        });
    mapRef.current = map;
    markersRef.current = [];
    boundsRef.current = new google.maps.LatLngBounds();
    setMapReady(true);
      } catch {
        // no-op
      }
    }
    init();
    return () => {
      disposed = true;
      mapRef.current = null;
      markersRef.current = null;
      boundsRef.current = null;
      setMapReady(false);
    };
  }, []);

  // Update markers when points change
  useEffect(() => {
  const map = mapRef.current;
  const markers = markersRef.current;
  const bounds = boundsRef.current;
    if (!map || !markers || !bounds) return;

    // clear old markers
  for (const m of markers) m.setMap(null);
    markers.length = 0;
  const newBounds = new window.google.maps.LatLngBounds();

    points.forEach(({ addr, pt, names }) => {
      const marker = new window.google.maps.Marker({
        position: { lat: pt.lat, lng: pt.lon },
        map,
      });
      const content = `<div class="text-sm"><div class="font-medium mb-1">${addr}</div>${
        names.length
          ? `<div><div class="text-gray-500">Applicants:</div><ul class="list-disc pl-5">${names.slice(0, 5).map((n) => `<li>${n}</li>`).join('')}${names.length > 5 ? `<li>and ${names.length - 5} more…</li>` : ''}</ul></div>`
          : ''
      }</div>`;
      const infowindow = new window.google.maps.InfoWindow({ content });
      marker.addListener('click', () => infowindow.open({ anchor: marker, map }));
      markers.push(marker);
      newBounds.extend({ lat: pt.lat, lng: pt.lon });
    });

    if (points.length === 1) {
      map.setCenter({ lat: points[0].pt.lat, lng: points[0].pt.lon });
      map.setZoom(13);
    } else if (points.length > 1) {
      map.fitBounds(newBounds, 30);
    }
    boundsRef.current = newBounds;
  }, [points, mapReady]);

  // Invalidate size when tab becomes active
  useEffect(() => {
    const map = mapRef.current;
    const bounds = boundsRef.current;
    if (!map) return;
    if (active) {
      const id = window.setTimeout(() => {
        if (window.google?.maps?.event) {
          window.google.maps.event.trigger(map, 'resize');
        }
        if (bounds && !bounds.isEmpty()) {
          map.fitBounds(bounds, 30);
        }
      }, 50);
      return () => window.clearTimeout(id);
    }
  }, [active]);

  // Observe container size changes
  useEffect(() => {
    const map = mapRef.current;
    const el = mapElRef.current;
    if (!map || !el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => {
      if (window.google?.maps?.event) {
        window.google.maps.event.trigger(map, 'resize');
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Applicants Map</h3>
        {loadingGeo && <span className="text-xs text-gray-500">Geocoding addresses…</span>}
      </div>
      {!GMAPS_API_KEY && (
        <div className="mb-2 text-xs text-red-600">Google Maps API key is not configured. Set VITE_GOOGLE_MAPS_API_KEY.</div>
      )}
      <div ref={mapElRef} className="h-[520px] w-full overflow-hidden rounded-lg" />
      {points.length === 0 && (
        <div className="text-center text-gray-500 text-sm mt-3">No geocoded addresses to display.</div>
      )}
    </div>
  );
};

export default ApplicationsMap;
