import fetch from 'node-fetch'; // or global fetch in Node 18+
import { config } from '../config/env.js';

// Haversine formula calculation for direct-line distance in kilometers
export function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distanceKm = R * c;
  return parseFloat(distanceKm.toFixed(2));
}

// Calculate ETA based on Haversine distance assuming 45 km/h emergency speed
export function calculateHaversineEta(distanceKm) {
  const averageSpeedKmH = 45;
  const travelMinutes = (distanceKm / averageSpeedKmH) * 60;
  const dispatchOverheadMinutes = 3; // dispatch & prep time
  return Math.ceil(travelMinutes + dispatchOverheadMinutes);
}

// Calculate distance & travel duration using OSRM API with Haversine fallback
export async function calculateRoute(startLat, startLon, endLat, endLon) {
  const startLatNum = parseFloat(startLat);
  const startLonNum = parseFloat(startLon);
  const endLatNum = parseFloat(endLat);
  const endLonNum = parseFloat(endLon);

  const haversineKm = haversineDistance(startLatNum, startLonNum, endLatNum, endLonNum);
  const fallbackEta = calculateHaversineEta(haversineKm);

  try {
    const osrmUrl = `${config.osrmBaseUrl}/route/v1/driving/${startLonNum},${startLatNum};${endLonNum},${endLatNum}?overview=false`;
    
    // 3 second timeout for OSRM REST call to guarantee sub-second dashboard performance
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const response = await fetch(osrmUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const distanceKm = parseFloat((route.distance / 1000).toFixed(2));
        const durationMinutes = Math.ceil(route.duration / 60);

        return {
          distance_km: distanceKm,
          duration_minutes: durationMinutes,
          engine: 'OSRM (Contraction Hierarchies)',
          fallback_used: false
        };
      }
    }
    
    console.warn(`[ROUTING API WARN] OSRM status ${response.status}. Falling back to Haversine formula.`);
  } catch (error) {
    console.warn(`[ROUTING API WARN] OSRM request failed (${error.message}). Falling back to Haversine formula.`);
  }

  // Graceful degradation fallback
  return {
    distance_km: haversineKm,
    duration_minutes: fallbackEta,
    engine: 'Haversine Direct-Line Engine',
    fallback_used: true
  };
}
