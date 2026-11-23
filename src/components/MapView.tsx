import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { LatLng } from '../lib/geo';

export interface Pin { id: string; lat: number; lng: number; emoji: string; color: string; label: string; active?: boolean }

export function MapView({ center, radiusKm, pins, selected, onSelect, onMoved, me }: {
  center: LatLng; radiusKm: number; pins: Pin[]; selected: string | null;
  onSelect: (id: string | null) => void; onMoved: (c: LatLng) => void; me?: LatLng | null;
}) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const layer = useRef<L.LayerGroup | null>(null);
  const circle = useRef<L.Circle | null>(null);
  const meMarker = useRef<L.CircleMarker | null>(null);
  const programmatic = useRef(false);
  const cb = useRef({ onSelect, onMoved });
  cb.current = { onSelect, onMoved };

  useEffect(() => {
    const m = L.map(el.current!, { zoomControl: false, attributionControl: true }).setView([center.lat, center.lng], 14);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19, attribution: '© OpenStreetMap',
    }).addTo(m);
    L.control.zoom({ position: 'bottomright' }).addTo(m);
    layer.current = L.layerGroup().addTo(m);
    m.on('moveend', () => {
      if (programmatic.current) { programmatic.current = false; return; }
      const c = m.getCenter(); cb.current.onMoved({ lat: c.lat, lng: c.lng });
    });
    m.on('click', () => cb.current.onSelect(null));
    map.current = m;
    return () => { m.remove(); map.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // centro e raio
  useEffect(() => {
    const m = map.current; if (!m) return;
    circle.current?.remove();
    circle.current = L.circle([center.lat, center.lng], { radius: radiusKm * 1000, color: '#0f766e', weight: 1.5, fillOpacity: 0.05, dashArray: '4 6', interactive: false }).addTo(m);
    const cur = m.getCenter();
    if (Math.abs(cur.lat - center.lat) > 1e-5 || Math.abs(cur.lng - center.lng) > 1e-5) {
      programmatic.current = true;
      m.fitBounds(circle.current.getBounds(), { padding: [10, 10], animate: false });
    } else if (m.getZoom() < 12) {
      programmatic.current = true;
      m.fitBounds(circle.current.getBounds(), { animate: false });
    }
  }, [center.lat, center.lng, radiusKm]);

  useEffect(() => {
    const m = map.current; if (!m) return;
    meMarker.current?.remove();
    if (me) meMarker.current = L.circleMarker([me.lat, me.lng], { radius: 7, color: '#fff', weight: 3, fillColor: '#2563eb', fillOpacity: 1 }).addTo(m);
  }, [me?.lat, me?.lng]);

  // pinos
  useEffect(() => {
    const g = layer.current; if (!g) return;
    g.clearLayers();
    for (const p of pins) {
      const sel = p.id === selected;
      const icon = L.divIcon({
        className: '', iconSize: [38, 44], iconAnchor: [19, 42],
        html: `<div class="pin${sel ? ' pin-sel' : ''}${p.active === false ? ' pin-off' : ''}" style="--c:${p.color}" aria-label="${p.label.replace(/"/g, '')}"><span>${p.emoji}</span></div>`,
      });
      L.marker([p.lat, p.lng], { icon, title: p.label, zIndexOffset: sel ? 1000 : 0, keyboard: true })
        .on('click', e => { L.DomEvent.stopPropagation(e); cb.current.onSelect(p.id); })
        .addTo(g);
    }
  }, [pins, selected]);

  return <div ref={el} className="map" role="region" aria-label="Mapa de prestadores. A mesma informação está na lista." />;
}
