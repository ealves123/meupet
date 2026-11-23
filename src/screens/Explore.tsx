import { useMemo, useState } from 'react';
import { useStore, selectPet, myPets } from '../lib/store';
import { ALPHAVILLE, DEFAULT_RADIUS_KM, PLACES, distanceKm, kmLabel, PILOT_AREA_CENTER, PILOT_AREA_RADIUS_KM, type LatLng } from '../lib/geo';
import { PILOT_TYPES, SOON_TYPES, TYPE_EMOJI, TYPE_LABEL, brl } from '../lib/labels';
import { daySlots, nextSlots } from '../lib/slots';
import { addDays, startOfDay, whenLabel } from '../lib/dates';
import { ratingOf } from '../lib/rating';
import type { Provider, ServiceType, Service, Size } from '../lib/types';
import { MapView, type Pin } from '../components/MapView';
import { Sheet, Stars, Sup, toast } from '../components/ui';
import { go } from '../lib/router';
import { InstallHint } from '../components/InstallHint';

type Day = 'any' | 'hoje' | 'amanha' | 'semana';
type Sort = 'dist' | 'nota' | 'horario';

interface Row { p: Provider; km: number; svc: Service; next: Date | null; rating: ReturnType<typeof ratingOf>; minPrice: number | null }

let memo: { center: LatLng; radius: number; types: ServiceType[]; day: Day; view: 'mapa' | 'lista'; sort: Sort; minStars: number; maxPrice: number | null } | null = null;

/** Abre o Explorar já filtrado por um tipo de serviço (atalhos da home). */
export function exploreType(t: ServiceType | null) {
  memo = memo ? { ...memo, types: t ? [t] : [] } : { center: ALPHAVILLE, radius: DEFAULT_RADIUS_KM, types: t ? [t] : [], day: 'any', view: 'mapa', sort: 'dist', minStars: 0, maxPrice: null };
  go('/explorar');
}

export function Explore() {
  const s = useStore();
  const [center, setCenter] = useState<LatLng>(memo?.center ?? ALPHAVILLE);
  const [pending, setPending] = useState<LatLng | null>(null);
  const [me, setMe] = useState<LatLng | null>(null);
  const [radius, setRadius] = useState(memo?.radius ?? DEFAULT_RADIUS_KM);
  const [types, setTypes] = useState<ServiceType[]>(memo?.types ?? []);
  const [day, setDay] = useState<Day>(memo?.day ?? 'any');
  const [view, setView] = useState<'mapa' | 'lista'>(memo?.view ?? 'mapa');
  const [sort, setSort] = useState<Sort>(memo?.sort ?? 'dist');
  const [minStars, setMinStars] = useState(memo?.minStars ?? 0);
  const [maxPrice, setMaxPrice] = useState<number | null>(memo?.maxPrice ?? null);
  const [selected, setSelected] = useState<string | null>(null);
  const [q, setQ] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  memo = { center, radius, types, day, view, sort, minStars, maxPrice };

  const pets = myPets(s);
  const pet = pets.find(p => p.id === s.selectedPetId) ?? null;
  const size: Size = pet?.size ?? 'medio';
  const now = new Date();

  const { inside, outside } = useMemo(() => {
    const today = startOfDay(now);
    const dayRange: [number, number] | null = day === 'hoje' ? [0, 1] : day === 'amanha' ? [1, 2] : day === 'semana' ? [0, 7] : null;
    const rows: Row[] = [];
    for (const p of s.providers) {
      // RN-01: só quem tem serviço ativo e agenda publicada. Pausado sai do mapa.
      if (p.paused) continue;
      const svcs = p.services.filter(x => x.active && PILOT_TYPES.includes(x.type) && (types.length === 0 || types.includes(x.type)) && (!pet || x.species.includes(pet.species)));
      // RN-07: o prestador entra se ao menos um serviço atende a todos os filtros
      const okPrice = svcs.filter(x => maxPrice == null || (x.price[size] ?? 0) <= maxPrice);
      if (!okPrice.length) continue;
      const rating = ratingOf(s, p.id);
      if (minStars && (rating.isNew || rating.avg < minStars)) continue;
      let svc = okPrice[0];
      let next: Date | null = null;
      if (dayRange) {
        for (const x of okPrice) {
          for (let d = dayRange[0]; d < dayRange[1] && !next; d++) next = daySlots(s, p, x, size, addDays(today, d), 'any', now)[0]?.start ?? null;
          if (next) { svc = x; break; }
        }
        if (!next) continue;
      } else next = nextSlots(s, p, svc, size, 1, 14, now)[0]?.start ?? null;
      const prices = okPrice.map(x => x.price[size]).filter((v): v is number => v != null && v > 0);
      rows.push({ p, km: distanceKm(center, p), svc, next, rating, minPrice: prices.length ? Math.min(...prices) : null });
    }
    const cmp: Record<Sort, (a: Row, b: Row) => number> = {
      dist: (a, b) => a.km - b.km,
      nota: (a, b) => b.rating.avg - a.rating.avg || a.km - b.km,
      horario: (a, b) => (a.next?.getTime() ?? Infinity) - (b.next?.getTime() ?? Infinity),
    };
    rows.sort(cmp[sort]);
    return { inside: rows.filter(r => r.km <= radius), outside: rows.filter(r => r.km > radius).sort((a, b) => a.km - b.km).slice(0, 3) };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s, center.lat, center.lng, radius, types.join(), day, sort, minStars, maxPrice, size, pet?.species]);

  const pins: Pin[] = [...inside, ...outside].map(r => ({ id: r.p.id, lat: r.p.lat, lng: r.p.lng, emoji: r.p.emoji, color: r.p.color, label: r.p.name, active: r.km <= radius }));
  const sel = [...inside, ...outside].find(r => r.p.id === selected);
  const outOfPilot = distanceKm(center, PILOT_AREA_CENTER) > PILOT_AREA_RADIUS_KM;
  const matches = q.trim().length >= 2 ? PLACES.filter(p => p.name.toLowerCase().includes(q.trim().toLowerCase())) : [];
  const activeFilters = (minStars ? 1 : 0) + (maxPrice != null ? 1 : 0) + (radius !== DEFAULT_RADIUS_KM ? 1 : 0);

  const toggleType = (t: ServiceType) => setTypes(ts => (ts.includes(t) ? ts.filter(x => x !== t) : [...ts, t]));
  const locate = () => {
    if (!navigator.geolocation) return toast('Localização indisponível. Use a busca.');
    navigator.geolocation.getCurrentPosition(
      pos => { const c = { lat: pos.coords.latitude, lng: pos.coords.longitude }; setMe(c); setCenter(c); setPending(null); },
      () => toast('Sem acesso à localização. Mostrando o centro de Alphaville.'),
      { timeout: 8000 },
    );
  };

  return (
    <div className="explore">
      <div className="explore-top">
        <div className="search">
          <span aria-hidden>🔎</span>
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Residencial, bairro ou rua" aria-label="Buscar endereço, residencial ou bairro" />
          {q && <button className="icon-btn sm" aria-label="Limpar" onClick={() => setQ('')}>×</button>}
          <button className="icon-btn sm" aria-label="Usar minha localização" onClick={locate}>📍</button>
        </div>
        {matches.length > 0 && (
          <ul className="suggest" role="listbox">
            {matches.map(m => (
              <li key={m.name}><button onClick={() => { setCenter(m); setPending(null); setQ(''); }}><b>{m.name}</b><small>{m.hint}</small></button></li>
            ))}
          </ul>
        )}
        {q.trim().length >= 2 && matches.length === 0 && <div className="suggest"><p className="muted pad">Nenhum lugar encontrado. No app final, a busca aceita qualquer endereço ou CEP.</p></div>}
        <div className="chips" role="group" aria-label="Tipo de serviço">
          {PILOT_TYPES.map(t => (
            <button key={t} className={`chip${types.includes(t) ? ' on' : ''}`} aria-pressed={types.includes(t)} onClick={() => toggleType(t)}>{TYPE_EMOJI[t]} {TYPE_LABEL[t]}</button>
          ))}
          {SOON_TYPES.map(t => (
            <button key={t} className="chip soon" onClick={() => toast(`${TYPE_LABEL[t]} chega depois do piloto (diárias e vagas).`)}>{TYPE_EMOJI[t]} {TYPE_LABEL[t]} <em>em breve</em></button>
          ))}
        </div>
        <div className="chips" role="group" aria-label="Disponibilidade">
          {(['any', 'hoje', 'amanha', 'semana'] as Day[]).map(d => (
            <button key={d} className={`chip small${day === d ? ' on' : ''}`} aria-pressed={day === d} onClick={() => setDay(d)}>
              {{ any: 'Qualquer dia', hoje: 'Hoje', amanha: 'Amanhã', semana: 'Esta semana' }[d]}
            </button>
          ))}
          <button className={`chip small${activeFilters ? ' on' : ''}`} onClick={() => setFiltersOpen(true)}>⚙️ Filtros{activeFilters ? ` (${activeFilters})` : ''}</button>
        </div>
        {pets.length > 0 && (
          <div className="petbar">
            <span className="muted">Para:</span>
            {pets.map(p => <button key={p.id} className={`chip small${pet?.id === p.id ? ' on' : ''}`} onClick={() => selectPet(p.id)}>{p.species === 'gato' ? '🐈' : '🐕'} {p.name}</button>)}
          </div>
        )}
      </div>

      <div className="view-toggle" role="tablist">
        <button role="tab" aria-selected={view === 'mapa'} className={view === 'mapa' ? 'on' : ''} onClick={() => setView('mapa')}>Mapa</button>
        <button role="tab" aria-selected={view === 'lista'} className={view === 'lista' ? 'on' : ''} onClick={() => setView('lista')}>Lista ({inside.length})</button>
      </div>

      <InstallHint />
      {outOfPilot && <div className="notice">Por enquanto o meuPet atende Alphaville e arredores. Em breve chegamos aqui também. <Sup /></div>}

      {view === 'mapa' && (
        <div className="map-wrap">
          <MapView center={center} radiusKm={radius} pins={pins} selected={selected} onSelect={setSelected} onMoved={c => setPending(c)} me={me} />
          {pending && distanceKm(pending, center) > 0.3 && (
            <button className="search-here" onClick={() => { setCenter(pending); setPending(null); }}>Buscar nesta área</button>
          )}
          <div className="map-legend">Raio de {radius} km <Sup /></div>
          {sel && <ProviderCard r={sel} floating />}
        </div>
      )}

      {view === 'lista' && (
        <div className="list">
          <div className="list-head">
            <span>{inside.length} {inside.length === 1 ? 'prestador' : 'prestadores'} em {radius} km</span>
            <select value={sort} onChange={e => setSort(e.target.value as Sort)} aria-label="Ordenar por">
              <option value="dist">Mais perto</option><option value="nota">Melhor nota</option><option value="horario">Horário mais cedo</option>
            </select>
          </div>
          {inside.map(r => <ProviderCard key={r.p.id} r={r} />)}
          {inside.length === 0 && (
            <div className="empty small">
              <h3>Ninguém com esses filtros em {radius} km</h3>
              <p>{types.length || day !== 'any' || activeFilters ? 'Tente tirar um filtro ou ' : ''}<button className="link" onClick={() => setRadius(Math.min(15, radius + 3))}>ampliar o raio para {Math.min(15, radius + 3)} km</button>.</p>
            </div>
          )}
          {outside.length > 0 && inside.length < 3 && (
            <>
              <h3 className="section-label">Mais perto fora do raio</h3>
              {outside.map(r => <ProviderCard key={r.p.id} r={r} />)}
            </>
          )}
        </div>
      )}

      <Sheet open={filtersOpen} onClose={() => setFiltersOpen(false)} title="Filtros">
        <div className="form">
          <label>Raio da busca: <b>{radius} km</b> <Sup>RN-02</Sup>
            <input type="range" min={1} max={15} value={radius} onChange={e => setRadius(Number(e.target.value))} />
          </label>
          <fieldset><legend>Avaliação mínima</legend>
            <div className="chips">{[0, 4, 4.5].map(v => <button key={v} className={`chip small${minStars === v ? ' on' : ''}`} onClick={() => setMinStars(v)}>{v ? `${v.toLocaleString('pt-BR')}+ ★` : 'Todas'}</button>)}</div>
            <small className="muted">Ignora quem tem menos de 3 avaliações.</small>
          </fieldset>
          <fieldset><legend>Preço máximo{pet ? ` para o porte do ${pet.name}` : ' (porte médio)'}</legend>
            <div className="chips">{[null, 80, 120, 200].map(v => <button key={String(v)} className={`chip small${maxPrice === v ? ' on' : ''}`} onClick={() => setMaxPrice(v)}>{v == null ? 'Qualquer' : `até ${brl(v)}`}</button>)}</div>
          </fieldset>
          <fieldset><legend>Local de atendimento</legend>
            <p className="muted">No estabelecimento. Atendimento a domicílio e leva e traz ficam para depois do piloto. <Sup /></p>
          </fieldset>
          <div className="row gap">
            <button className="btn ghost" onClick={() => { setRadius(DEFAULT_RADIUS_KM); setMinStars(0); setMaxPrice(null); }}>Limpar</button>
            <button className="btn" onClick={() => setFiltersOpen(false)}>Ver {inside.length} resultados</button>
          </div>
        </div>
      </Sheet>
    </div>
  );
}

function ProviderCard({ r, floating }: { r: Row; floating?: boolean }) {
  const { p } = r;
  return (
    <button className={`pcard${floating ? ' floating' : ''}`} onClick={() => go(`/p/${p.slug}`)}>
      <div className="pcard-icon" style={{ background: p.color }} aria-hidden>{p.emoji}</div>
      <div className="pcard-body">
        <div className="pcard-title"><b>{p.name}</b><span className="muted">{kmLabel(r.km)}</span></div>
        <div className="pcard-meta">
          {p.types.map(t => TYPE_LABEL[t]).join(' · ')}
          {' · '}
          {r.rating.isNew ? <span className="badge new">Novo no meuPet</span> : <><Stars value={r.rating.avg} size={12} /> {r.rating.avg.toFixed(1).replace('.', ',')} ({r.rating.count})</>}
        </div>
        <div className="pcard-next">
          {r.next ? <><span className="dot" /> Próximo horário: <b>{whenLabel(r.next)}</b></> : <span className="muted">Sem horários nos próximos 14 dias</span>}
          {r.minPrice != null && <span className="muted"> · a partir de {brl(r.minPrice)}</span>}
        </div>
      </div>
    </button>
  );
}
