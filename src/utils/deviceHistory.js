/**
 * Device History Management Utility
 * Handles device-specific ride history using localStorage with 7-day expiration
 */

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const UDI_KEY = 'alwahes_udi';
const RIDE_PREFIX = 'alwahes_ride_';

/**
 * Generate a unique device identifier based on device characteristics
 * @returns {string} Base64 encoded device identifier
 */
export function generateDeviceUDI() {
  const deviceInfo = [
    navigator.userAgent,
    screen.width,
    screen.height,
    navigator.language,
    // Add timezone to make it more unique per location
    Intl.DateTimeFormat().resolvedOptions().timeZone
  ].join('|');

  return btoa(deviceInfo);
}

/**
 * Get or create device UDI
 * @returns {string} Device UDI
 */
export function getDeviceUDI() {
  let udi = localStorage.getItem(UDI_KEY);
  if (!udi) {
    udi = generateDeviceUDI();
    localStorage.setItem(UDI_KEY, udi);
  }
  return udi;
}

/**
 * Create a ride history token
 * @param {string} whatsapp - User's WhatsApp number
 * @param {'published' | 'requested'} action - Action performed
 * @param {string} rideId - Unique ride identifier
 * @param {Object} rideDetails - Additional ride details to store
 */
export function createRideToken(whatsapp, action, rideId, rideDetails) {
  const token = {
    udi: getDeviceUDI(),
    whatsapp,
    action,
    ride_id: rideId,
    details: rideDetails,
    timestamp: Date.now()
  };

  localStorage.setItem(`${RIDE_PREFIX}${rideId}`, JSON.stringify(token));
}

/**
 * Remove expired tokens (older than 7 days)
 */
export function cleanExpiredTokens() {
  const now = Date.now();

  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith(RIDE_PREFIX)) {
      try {
        const token = JSON.parse(localStorage.getItem(key));
        if (now - token.timestamp > SEVEN_DAYS_MS) {
          localStorage.removeItem(key);
        }
      } catch (error) {
        // If token is corrupted, remove it
        localStorage.removeItem(key);
      }
    }
  });
}

/**
 * Get all valid ride history for current device
 * @returns {Array} Array of ride tokens
 */
export function getDeviceRides() {
  const udi = getDeviceUDI();
  const now = Date.now();

  return Object.keys(localStorage)
    .filter(key => key.startsWith(RIDE_PREFIX))
    .map(key => {
      try {
        return JSON.parse(localStorage.getItem(key));
      } catch {
        return null;
      }
    })
    .filter(token => 
      token && 
      token.udi === udi && 
      now - token.timestamp <= SEVEN_DAYS_MS
    );
}

/**
 * Check if a ride belongs to current device
 * @param {string} rideId - Ride identifier to check
 * @returns {boolean} True if ride belongs to current device
 */
export function isDeviceRide(rideId) {
  try {
    const token = localStorage.getItem(`${RIDE_PREFIX}${rideId}`);
    if (!token) return false;
    
    const parsedToken = JSON.parse(token);
    return parsedToken.udi === getDeviceUDI() &&
           Date.now() - parsedToken.timestamp <= SEVEN_DAYS_MS;
  } catch {
    return false;
  }
}

// Clean expired tokens on module load
cleanExpiredTokens();
