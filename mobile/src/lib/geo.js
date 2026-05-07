const EARTH_RADIUS_KM = 6371;

function toRadians(value) {
  return (value * Math.PI) / 180;
}

export function getSchoolCoordinates(school) {
  const coords = school?.location?.coordinates;
  if (Array.isArray(coords) && coords.length >= 2) {
    const lng = Number(coords[0]);
    const lat = Number(coords[1]);
    if (Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng };
  }

  const lat = Number(school?.lat);
  const lng = Number(school?.lng);
  if (Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng };
  return null;
}

export function distanceKm(a, b) {
  if (!a || !b) return Infinity;

  const dLat = toRadians(b.lat - a.lat);
  const dLng = toRadians(b.lng - a.lng);
  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);

  const h =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);

  return 2 * EARTH_RADIUS_KM * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

export function formatDistance(km) {
  if (!Number.isFinite(km)) return 'Distance unavailable';
  if (km < 1) return `${Math.round(km * 1000)} m away`;
  if (km < 10) return `${km.toFixed(1)} km away`;
  return `${Math.round(km)} km away`;
}

export function sortSchoolsByDistance(schools, origin) {
  return [...(schools || [])]
    .map((school) => {
      const coordinates = getSchoolCoordinates(school);
      return {
        ...school,
        distanceKm: distanceKm(origin, coordinates),
      };
    })
    .filter((school) => Number.isFinite(school.distanceKm))
    .sort((a, b) => a.distanceKm - b.distanceKm);
}
