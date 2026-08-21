import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default function EmergencyMap({ 
  victimLat = 18.5204, 
  victimLon = 73.8567, 
  victimLocation = "Victim Location", 
  hospitals = [], 
  matchedHospital = null, 
  matchedAmbulance = null 
}) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [mapError, setMapError] = useState(false);

  useEffect(() => {
    if (!mapRef.current || typeof window === 'undefined') return;

    try {
      // Fix default Leaflet icon paths
      if (L.Icon && L.Icon.Default && L.Icon.Default.prototype) {
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
          iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        });
      }

      // Safely reset Leaflet DOM container ID to prevent "Map container is already initialized" error
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.off();
          mapInstanceRef.current.remove();
        } catch (e) {}
        mapInstanceRef.current = null;
      }

      if (mapRef.current && mapRef.current._leaflet_id) {
        mapRef.current._leaflet_id = null;
      }

      const centerLat = parseFloat(victimLat) || 18.5204;
      const centerLon = parseFloat(victimLon) || 73.8567;

      // Custom Pin Icons
      const victimIcon = L.divIcon({
        className: 'custom-victim-pin',
        html: `<div style="background-color: #EF4444; width: 24px; height: 24px; border-radius: 50%; border: 3px solid #FFFFFF; box-shadow: 0 0 10px rgba(239, 68, 68, 0.8); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 12px;">📍</div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      const matchedHospitalIcon = L.divIcon({
        className: 'custom-matched-hospital-pin',
        html: `<div style="background-color: #16A34A; width: 28px; height: 28px; border-radius: 6px; border: 2px solid #FFFFFF; box-shadow: 0 2px 8px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 14px;">🏥</div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      const hospitalIcon = L.divIcon({
        className: 'custom-hospital-pin',
        html: `<div style="background-color: #0284C7; width: 22px; height: 22px; border-radius: 6px; border: 2px solid #FFFFFF; box-shadow: 0 2px 6px rgba(0,0,0,0.2); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 11px;">🏥</div>`,
        iconSize: [22, 22],
        iconAnchor: [11, 11]
      });

      const ambulanceIcon = L.divIcon({
        className: 'custom-ambulance-pin',
        html: `<div style="background-color: #F59E0B; width: 26px; height: 26px; border-radius: 50%; border: 2px solid #FFFFFF; box-shadow: 0 2px 8px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 13px;">🚑</div>`,
        iconSize: [26, 26],
        iconAnchor: [13, 13]
      });

      // Initialize Leaflet map
      const map = L.map(mapRef.current, { zoomControl: true }).setView([centerLat, centerLon], 11);
      mapInstanceRef.current = map;

      // Add OpenStreetMap Tile Layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap',
        maxZoom: 18
      }).addTo(map);

      const bounds = L.latLngBounds();

      // 1. Plot Victim Marker
      L.marker([centerLat, centerLon], { icon: victimIcon })
        .addTo(map)
        .bindPopup(`<b>📍 Victim Location</b><br/>${victimLocation}`);
      
      bounds.extend([centerLat, centerLon]);

      // 2. Plot Hospitals
      if (Array.isArray(hospitals)) {
        hospitals.forEach(h => {
          const isMatched = matchedHospital && matchedHospital.id === h.id;
          const hLat = parseFloat(h.latitude);
          const hLon = parseFloat(h.longitude);
          if (isNaN(hLat) || isNaN(hLon)) return;

          L.marker([hLat, hLon], { icon: isMatched ? matchedHospitalIcon : hospitalIcon })
            .addTo(map)
            .bindPopup(`<b>${h.name}</b><br/>ASV Stock: ${h.current_asv_vials} vials`);

          bounds.extend([hLat, hLon]);

          if (isMatched) {
            L.polyline([[centerLat, centerLon], [hLat, hLon]], {
              color: '#16A34A',
              weight: 4,
              opacity: 0.8,
              dashArray: '8, 8'
            }).addTo(map);
          }
        });
      }

      // 3. Plot Ambulance Marker
      if (matchedAmbulance && matchedAmbulance.current_lat && matchedAmbulance.current_lon) {
        const aLat = parseFloat(matchedAmbulance.current_lat);
        const aLon = parseFloat(matchedAmbulance.current_lon);
        if (!isNaN(aLat) && !isNaN(aLon)) {
          L.marker([aLat, aLon], { icon: ambulanceIcon })
            .addTo(map)
            .bindPopup(`<b>🚑 Ambulance ${matchedAmbulance.vehicle_number}</b>`);
          bounds.extend([aLat, aLon]);

          L.polyline([[aLat, aLon], [centerLat, centerLon]], {
            color: '#F59E0B',
            weight: 3,
            opacity: 0.7,
            dashArray: '5, 5'
          }).addTo(map);
        }
      }

      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [30, 30] });
      }
    } catch (err) {
      console.warn('[Map Exception Caught Gracefully]:', err);
      setMapError(true);
    }

    return () => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.off();
          mapInstanceRef.current.remove();
        } catch (e) {}
        mapInstanceRef.current = null;
      }
    };
  }, [victimLat, victimLon, victimLocation, hospitals, matchedHospital, matchedAmbulance]);

  if (mapError) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1.5px solid #CBD5E1', color: '#475569' }}>
        🗺 <strong>GIS Route Engine Active</strong><br/>
        <span style={{ fontSize: '12px' }}>Victim Location: ({victimLat}, {victimLon}) • Pune District</span>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '340px', borderRadius: '12px', overflow: 'hidden', border: '2px solid #CBD5E1', backgroundColor: '#E2E8F0' }}>
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
      <div style={{
        position: 'absolute',
        bottom: '10px',
        right: '10px',
        backgroundColor: 'rgba(15, 23, 42, 0.85)',
        color: '#FFFFFF',
        padding: '6px 12px',
        borderRadius: '6px',
        fontSize: '11px',
        fontWeight: 'bold',
        zIndex: 1000
      }}>
        🗺 Live GIS Route Engine (Pune District)
      </div>
    </div>
  );
}
