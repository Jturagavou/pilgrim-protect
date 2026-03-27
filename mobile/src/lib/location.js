import * as Location from 'expo-location';

/**
 * Request location permission and get current GPS coordinates.
 * Returns { lat, lng } or null if permission denied / error.
 */
export async function getCurrentLocation() {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.log('[Location] Permission denied');
      return null;
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
      timeout: 10000,
    });

    return {
      lat: location.coords.latitude,
      lng: location.coords.longitude,
    };
  } catch (err) {
    console.log('[Location] Error getting location:', err.message);
    return null;
  }
}
