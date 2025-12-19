// Location and distance utility functions
export function getDistanceKm(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Request user location with high accuracy
export function requestUserLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation not supported"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      (error) => {
        reject(error);
      },
      { 
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  });
}

// Watch user location in real-time
export function watchUserLocation(callback, onError) {
  if (!navigator.geolocation) {
    onError(new Error("Geolocation not supported"));
    return null;
  }

  return navigator.geolocation.watchPosition(
    (position) => {
      callback({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
      });
    },
    onError,
    { 
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 5000
    }
  );
}

// Convert GeoJSON feature to point
export function featureToPoint(feature) {
  if (feature.geometry.type !== 'Point') return null;
  return {
    lng: feature.geometry.coordinates[0],
    lat: feature.geometry.coordinates[1],
    ...feature.properties
  };
}

// Filter nearby locations by distance
export function getNearbyLocations(userLat, userLng, locations, radiusKm = 5) {
  return locations.filter(loc => {
    const distance = getDistanceKm(userLat, userLng, loc.lat, loc.lng);
    return distance <= radiusKm;
  });
}
