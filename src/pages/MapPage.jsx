import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import { helpRequestAPI } from '../services/api';
import { HiOutlineFunnel } from 'react-icons/hi2';

// Fix default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const URGENCY_COLORS = {
  critical: '#ef4444',
  high: '#f59e0b',
  medium: '#4361ee',
  low: '#10b981',
};

const CATEGORY_ICONS = {
  food: '🍚', medical: '🏥', shelter: '🏠', education: '📚',
  sanitation: '🚰', 'disaster-relief': '🌪️', clothing: '👕',
  'mental-health': '🧠', other: '📋',
};

const DEMO_MARKERS = [
  { _id: '1', title: 'Food supply for 50 families', category: 'food', urgency: 'critical', status: 'pending', location: { coordinates: [77.209, 28.6139], address: 'Connaught Place, Delhi' }, numberOfPeopleAffected: 200 },
  { _id: '2', title: 'Medical camp required', category: 'medical', urgency: 'high', status: 'assigned', location: { coordinates: [77.1025, 28.7041], address: 'Rohini, Delhi' }, numberOfPeopleAffected: 150 },
  { _id: '3', title: 'Education support', category: 'education', urgency: 'medium', status: 'pending', location: { coordinates: [72.8777, 19.076], address: 'Mumbai' }, numberOfPeopleAffected: 30 },
  { _id: '4', title: 'Disaster relief needed', category: 'disaster-relief', urgency: 'critical', status: 'in-progress', location: { coordinates: [80.2707, 13.0827], address: 'Chennai' }, numberOfPeopleAffected: 500 },
  { _id: '5', title: 'Shelter for homeless', category: 'shelter', urgency: 'high', status: 'pending', location: { coordinates: [77.5946, 12.9716], address: 'Bangalore' }, numberOfPeopleAffected: 80 },
  { _id: '6', title: 'Clean water distribution', category: 'sanitation', urgency: 'high', status: 'pending', location: { coordinates: [73.8567, 18.5204], address: 'Pune' }, numberOfPeopleAffected: 300 },
  { _id: '7', title: 'Clothing drive', category: 'clothing', urgency: 'low', status: 'pending', location: { coordinates: [78.4867, 17.385], address: 'Hyderabad' }, numberOfPeopleAffected: 120 },
  { _id: '8', title: 'Mental health counseling', category: 'mental-health', urgency: 'medium', status: 'assigned', location: { coordinates: [75.8577, 26.9124], address: 'Jaipur' }, numberOfPeopleAffected: 40 },
  { _id: '9', title: 'Food supply urgent', category: 'food', urgency: 'critical', status: 'pending', location: { coordinates: [83.0003, 25.3176], address: 'Varanasi' }, numberOfPeopleAffected: 250 },
  { _id: '10', title: 'Flood relief assistance', category: 'disaster-relief', urgency: 'critical', status: 'pending', location: { coordinates: [76.2711, 9.9312], address: 'Kochi' }, numberOfPeopleAffected: 600 },
  { _id: '11', title: 'Education camp', category: 'education', urgency: 'low', status: 'pending', location: { coordinates: [88.3639, 22.5726], address: 'Kolkata' }, numberOfPeopleAffected: 50 },
  { _id: '12', title: 'Medical emergency', category: 'medical', urgency: 'critical', status: 'pending', location: { coordinates: [72.5714, 23.0225], address: 'Ahmedabad' }, numberOfPeopleAffected: 100 },
];

const MapPage = () => {
  const [markers, setMarkers] = useState(DEMO_MARKERS);
  const [filter, setFilter] = useState({ category: '', urgency: '' });
  const [showFilter, setShowFilter] = useState(false);

  useEffect(() => {
    loadMapData();
  }, []);

  const loadMapData = async () => {
    try {
      const { data } = await helpRequestAPI.getAll();
      if (data.helpRequests?.length > 0) {
        setMarkers(data.helpRequests.filter(r => r.location?.coordinates));
      }
    } catch {
      // Use demo data
    }
  };

  const filteredMarkers = markers.filter((m) => {
    if (filter.category && m.category !== filter.category) return false;
    if (filter.urgency && m.urgency !== filter.urgency) return false;
    return true;
  });

  const getRadius = (urgency, people) => {
    const baseSize = Math.min(Math.max(people / 10, 6), 25);
    const urgencyMultiplier = { critical: 1.5, high: 1.3, medium: 1, low: 0.8 };
    return baseSize * (urgencyMultiplier[urgency] || 1);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Help Request Map</h1>
          <p className="page-subtitle">Interactive heat map showing areas where help is needed most.</p>
        </div>
        <button className="btn btn-outline" onClick={() => setShowFilter(!showFilter)}>
          <HiOutlineFunnel /> Filter
        </button>
      </div>

      {/* Filter Bar */}
      {showFilter && (
        <div className="glass-card" style={{ padding: '16px', marginBottom: '16px', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
          <select className="input-field" style={{ width: 'auto' }} value={filter.category} onChange={(e) => setFilter({ ...filter, category: e.target.value })}>
            <option value="">All Categories</option>
            {Object.entries(CATEGORY_ICONS).map(([key, icon]) => (
              <option key={key} value={key}>{icon} {key.replace('-', ' ')}</option>
            ))}
          </select>
          <select className="input-field" style={{ width: 'auto' }} value={filter.urgency} onChange={(e) => setFilter({ ...filter, urgency: e.target.value })}>
            <option value="">All Urgency</option>
            <option value="critical">🔴 Critical</option>
            <option value="high">🟡 High</option>
            <option value="medium">🔵 Medium</option>
            <option value="low">🟢 Low</option>
          </select>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Showing {filteredMarkers.length} requests
          </span>
        </div>
      )}

      {/* Legend */}
      <div className="glass-card" style={{ padding: '12px 16px', marginBottom: '16px', display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>URGENCY:</span>
        {Object.entries(URGENCY_COLORS).map(([key, color]) => (
          <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: color, opacity: 0.7 }} />
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{key}</span>
          </div>
        ))}
        <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginLeft: 'auto' }}>
          Circle size = people affected
        </span>
      </div>

      {/* Map */}
      <div className="map-container" style={{ height: '600px' }}>
        <MapContainer
          center={[22.5, 78.5]}
          zoom={5}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          {filteredMarkers.map((marker) => (
            <CircleMarker
              key={marker._id}
              center={[
                marker.location.coordinates[1],
                marker.location.coordinates[0],
              ]}
              radius={getRadius(marker.urgency, marker.numberOfPeopleAffected)}
              pathOptions={{
                color: URGENCY_COLORS[marker.urgency],
                fillColor: URGENCY_COLORS[marker.urgency],
                fillOpacity: 0.4,
                weight: 2,
              }}
            >
              <Popup>
                <div>
                  <h4>{CATEGORY_ICONS[marker.category]} {marker.title}</h4>
                  <p style={{ margin: '4px 0', color: '#94a3b8' }}>
                    📍 {marker.location.address}<br />
                    👥 {marker.numberOfPeopleAffected} people affected<br />
                    ⚡ Urgency: <strong style={{ color: URGENCY_COLORS[marker.urgency] }}>{marker.urgency}</strong><br />
                    📊 Status: {marker.status}
                  </p>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>

      {/* Summary cards below map */}
      <div className="grid-4" style={{ marginTop: 'var(--space-lg)' }}>
        {['critical', 'high', 'medium', 'low'].map((urgency) => {
          const count = filteredMarkers.filter(m => m.urgency === urgency).length;
          const totalPeople = filteredMarkers.filter(m => m.urgency === urgency).reduce((sum, m) => sum + (m.numberOfPeopleAffected || 0), 0);
          return (
            <div key={urgency} className="glass-card stat-card">
              <div className="stat-icon" style={{ background: `${URGENCY_COLORS[urgency]}20`, color: URGENCY_COLORS[urgency] }}>
                <span style={{ fontSize: '14px', fontWeight: 800, textTransform: 'uppercase' }}>
                  {urgency[0]}
                </span>
              </div>
              <div className="stat-value" style={{ fontSize: '24px' }}>{count}</div>
              <div className="stat-label" style={{ textTransform: 'capitalize' }}>{urgency} • {totalPeople} people</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MapPage;
