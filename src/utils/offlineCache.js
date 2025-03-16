/**
 * Utility for handling offline data caching for the PWA
 * This allows the app to work offline by storing data in localStorage
 */

// Cache keys
const CACHE_KEYS = {
  RIDES: 'alwahes_cached_rides',
  REQUESTS: 'alwahes_cached_requests',
  USER_RIDES: 'alwahes_cached_user_rides',
  CITIES: 'alwahes_cached_cities',
  LAST_UPDATED: 'alwahes_cache_last_updated',
};

// Cache expiration time (24 hours in milliseconds)
const CACHE_EXPIRATION = 24 * 60 * 60 * 1000;

/**
 * Save data to the cache
 * @param {string} key - Cache key
 * @param {any} data - Data to cache
 */
export const saveToCache = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    
    // Update the last updated timestamp
    localStorage.setItem(CACHE_KEYS.LAST_UPDATED, Date.now().toString());
  } catch (error) {
    console.error('Error saving to cache:', error);
  }
};

/**
 * Get data from the cache
 * @param {string} key - Cache key
 * @returns {any} - Cached data or null if not found
 */
export const getFromCache = (key) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error getting from cache:', error);
    return null;
  }
};

/**
 * Check if the cache is expired
 * @returns {boolean} - True if cache is expired
 */
export const isCacheExpired = () => {
  try {
    const lastUpdated = localStorage.getItem(CACHE_KEYS.LAST_UPDATED);
    if (!lastUpdated) return true;
    
    const now = Date.now();
    const lastUpdatedTime = parseInt(lastUpdated, 10);
    
    return now - lastUpdatedTime > CACHE_EXPIRATION;
  } catch (error) {
    console.error('Error checking cache expiration:', error);
    return true;
  }
};

/**
 * Clear all cached data
 */
export const clearCache = () => {
  try {
    Object.values(CACHE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  } catch (error) {
    console.error('Error clearing cache:', error);
  }
};

/**
 * Queue offline actions to be processed when online
 * @param {string} action - Action type
 * @param {any} data - Action data
 */
export const queueOfflineAction = (action, data) => {
  try {
    const QUEUE_KEY = 'alwahes_offline_queue';
    const queue = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
    
    queue.push({
      action,
      data,
      timestamp: Date.now(),
    });
    
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  } catch (error) {
    console.error('Error queuing offline action:', error);
  }
};

/**
 * Process queued offline actions
 * @param {Function} processFunction - Function to process each action
 * @returns {Promise<number>} - Number of processed actions
 */
export const processOfflineQueue = async (processFunction) => {
  try {
    const QUEUE_KEY = 'alwahes_offline_queue';
    const queue = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
    
    if (queue.length === 0) return 0;
    
    let processedCount = 0;
    
    for (const item of queue) {
      try {
        await processFunction(item.action, item.data);
        processedCount++;
      } catch (error) {
        console.error('Error processing offline action:', error);
      }
    }
    
    // Clear the queue after processing
    localStorage.setItem(QUEUE_KEY, '[]');
    
    return processedCount;
  } catch (error) {
    console.error('Error processing offline queue:', error);
    return 0;
  }
};

export default {
  CACHE_KEYS,
  saveToCache,
  getFromCache,
  isCacheExpired,
  clearCache,
  queueOfflineAction,
  processOfflineQueue,
};
