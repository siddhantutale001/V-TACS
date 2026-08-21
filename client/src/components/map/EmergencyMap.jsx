import React, { useEffect, useRef } from 'react';
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

  useEffect(() => {
    if (!mapRef.current || typeof window === 'undefined') return;

    try {
      // Fix default Leaflet icon paths dynamically inside effect
      if (L.Icon && L.Icon.Default && L.Icon.Default.prototype) {
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
          iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        });
      }

      // Custom Pin Icons
      const victimIcon = L.divIcon({
        className: 'custom-victim-pin',
        html: `<div style="background-color: #EF4444; width: 22px; height: 22px; border-radius: 50%; border: 3px solid #FFFFFF; box-shadow: 0 0 10px rgba(239, 68, 68, 0.8); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 11px;">📍</div>`,
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

      // Clean up existing map instance if re-rendering
      if (mapInstanceRef.current) {
        try { mapInstanceRef.current.remove(); } catch (e) {}
        mapInstanceRef.current = null;
      }

      const centerLat = parseFloat(victimLat) || 18.5204;
      const centerLon = parseFloat(victimLon) || 73.8567;

      // Initialize Leaflet map
      const map = L.map(mapRef.current).setView([centerLat, centerLon], 11);
      mapInstanceRef.current = map;

      // Add OpenStreetMap Tile Layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18
      }).addTo(map);

      const bounds = L.latLngBounds();

      // 1. Plot Victim Marker
      L.marker([centerLat, centerLon], { icon: victimIcon })
        .addTo(map)
        .bindPopup(`<b>📍 Victim Emergency Location</b><br/>${victimLocation}<br/>Lat: ${centerLat.toFixed(4)}, Lon: ${centerLon.toFixed(4)}`);
      
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
            .bindPopup(`
              <div style="font-family: sans-serif; font-size: 12px;">
                <b style="color: ${isMatched ? '#16A34A' : '#0284C7'};">${h.name}</b> ${isMatched ? '<b>(RECOMMENDED #1)</b>' : ''}<br/>
                💉 <b>ASV Stock:</b> ${h.current_asv_vials} vials<br/>
                🫁 <b>Ventilator:</b> ${h.ventilator_available ? 'AVAILABLE ✅' : 'NOT AVAILABLE ❌'}<br/>
                📞 ${h.phone || ''}
              </div>
            `);

          bounds.extend([hLat, hLon]);

          if (isMatched) {
            L.polyline([
              [centerLat, centerLon],
              [hLat, hLon]
            ], {
              color: '#16A34A',
              weight: 4,
              opacity: 0.8,
              dashArray: '8, 8'
            }).addTo(map);
          }
        });
      }

      // 3. Plot Matched Ambulance Marker if present
      if (matchedAmbulance && matchedAmbulance.current_lat && matchedAmbulance.current_lon) {
        const aLat = parseFloat(matchedAmbulance.current_lat);
        const aLon = parseFloat(matchedAmbulance.current_lon);
        if (!isNaN(aLat) && !isNaN(aLon)) {
          L.marker([aLat, aLon], { icon: ambulanceIcon })
            .addTo(map)
            .bindPopup(`
              <div style="font-family: sans-serif; font-size: 12px;">
                <b style="color: #D97706;">🚑 Assigned Ambulance</b><br/>
                Vehicle: <b>${matchedAmbulance.vehicle_number}</b><br/>
                Driver: ${matchedAmbulance.driver_name} (${matchedAmbulance.driver_phone})
              </div>
            `);
          bounds.extend([aLat, aLon]);

          L.polyline([
            [aLat, aLon],
            [centerLat, centerLon]
          ], {
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
    } catch (mapError) {
      console.warn('[Map Render Error]', mapError);
    }

    return () => {
      if (mapInstanceRef.current) {
        try { mapInstanceRef.current.remove(); } catch (e) {}
        mapInstanceRef.current = null;
      }
    };
  }, [victimLat, victimLon, victimLocation, hospitals, matchedHospital, matchedAmbulance]);

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
        zIndex: 1000,
        boxShadow: '0 2px 6px rgba(0,0,0,0.3)'
      }}>
        🗺 Live GIS Route Engine (Pune District)
      </div>
    </div>
  );
}
