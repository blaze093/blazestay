// Utility functions for location-based features

/**
 * Calculate distance between two coordinates using the Haversine formula
 * @param lat1 Latitude of first point
 * @param lon1 Longitude of first point
 * @param lat2 Latitude of second point
 * @param lon2 Longitude of second point
 * @returns Distance in kilometers
 */
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1)
  const dLon = deg2rad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c // Distance in km
  return distance
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180)
}

/**
 * Get user's current location
 * @returns Promise with coordinates {latitude, longitude}
 */
export function getUserLocation(): Promise<GeolocationCoordinates> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser"))
    } else {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve(position.coords)
        },
        (error) => {
          reject(error)
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 },
      )
    }
  })
}

/**
 * Geocode an address to coordinates using Google Maps API
 * @param address Address to geocode
 * @param apiKey Google Maps API key
 * @returns Promise with coordinates {lat, lng}
 */
export async function geocodeAddress(address: string, apiKey: string): Promise<{ lat: number; lng: number }> {
  const response = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`,
  )
  const data = await response.json()

  if (data.status !== "OK") {
    throw new Error(`Geocoding failed: ${data.status}`)
  }

  return data.results[0].geometry.location
}

/**
 * Reverse geocode coordinates to address using Google Maps API
 * @param lat Latitude
 * @param lng Longitude
 * @param apiKey Google Maps API key
 * @returns Promise with address components
 */
export async function reverseGeocode(lat: number, lng: number, apiKey: string): Promise<any> {
  const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`)
  const data = await response.json()

  if (data.status !== "OK") {
    throw new Error(`Reverse geocoding failed: ${data.status}`)
  }

  return data.results[0]
}

/**
 * Extract city and state from Google Maps reverse geocoding result
 * @param geocodeResult Result from reverse geocoding
 * @returns Object with city and state
 */
export function extractLocationInfo(geocodeResult: any): { city: string; state: string } {
  let city = ""
  let state = ""

  if (geocodeResult && geocodeResult.address_components) {
    for (const component of geocodeResult.address_components) {
      if (component.types.includes("locality")) {
        city = component.long_name
      } else if (component.types.includes("administrative_area_level_1")) {
        state = component.long_name
      }
    }
  }

  return { city, state }
}
