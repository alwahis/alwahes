import { queueOfflineAction, getFromCache, saveToCache } from './offlineCache';

/**
 * Wrapper for API calls with offline support
 * This utility allows the app to queue API calls when offline
 * and execute them when the app is back online
 */

/**
 * Make an API call with offline support
 * @param {string} endpoint - API endpoint
 * @param {Object} options - Fetch options
 * @param {string} cacheKey - Key to use for caching (if applicable)
 * @param {boolean} useCache - Whether to use cached data when offline
 * @param {string} offlineAction - Action type for offline queue
 * @returns {Promise<any>} - API response or cached data
 */
export const apiCall = async (endpoint, options = {}, cacheKey = null, useCache = true, offlineAction = null) => {
  // Check if online
  if (!navigator.onLine) {
    // If we're offline and this is a write operation (POST, PUT, DELETE)
    if (options.method && options.method !== 'GET' && offlineAction) {
      // Queue the action for later
      queueOfflineAction(offlineAction, {
        endpoint,
        options,
        timestamp: Date.now(),
      });
      
      // Return a mock success response
      return {
        success: true,
        offline: true,
        message: 'تم حفظ العملية وسيتم تنفيذها عند الاتصال بالإنترنت',
      };
    }
    
    // For read operations, try to return cached data
    if (useCache && cacheKey) {
      const cachedData = getFromCache(cacheKey);
      if (cachedData) {
        return {
          ...cachedData,
          fromCache: true,
        };
      }
    }
    
    // If no cached data, throw an error
    throw new Error('أنت غير متصل بالإنترنت');
  }
  
  // We're online, make the actual API call
  try {
    const response = await fetch(endpoint, options);
    
    // Check if response is ok
    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }
    
    // Parse the response
    const data = await response.json();
    
    // If this is a GET request and we have a cacheKey, cache the response
    if ((!options.method || options.method === 'GET') && cacheKey) {
      saveToCache(cacheKey, data);
    }
    
    return data;
  } catch (error) {
    console.error('API call error:', error);
    
    // If we have a cacheKey and useCache is true, try to return cached data
    if (useCache && cacheKey) {
      const cachedData = getFromCache(cacheKey);
      if (cachedData) {
        return {
          ...cachedData,
          fromCache: true,
        };
      }
    }
    
    // Re-throw the error
    throw error;
  }
};

/**
 * Get data from an API with offline support
 * @param {string} endpoint - API endpoint
 * @param {string} cacheKey - Key to use for caching
 * @returns {Promise<any>} - API response or cached data
 */
export const getData = async (endpoint, cacheKey) => {
  return apiCall(endpoint, { method: 'GET' }, cacheKey, true);
};

/**
 * Post data to an API with offline support
 * @param {string} endpoint - API endpoint
 * @param {Object} data - Data to post
 * @param {string} offlineAction - Action type for offline queue
 * @returns {Promise<any>} - API response
 */
export const postData = async (endpoint, data, offlineAction) => {
  return apiCall(
    endpoint,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    },
    null,
    false,
    offlineAction
  );
};

/**
 * Update data in an API with offline support
 * @param {string} endpoint - API endpoint
 * @param {Object} data - Data to update
 * @param {string} offlineAction - Action type for offline queue
 * @returns {Promise<any>} - API response
 */
export const updateData = async (endpoint, data, offlineAction) => {
  return apiCall(
    endpoint,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    },
    null,
    false,
    offlineAction
  );
};

/**
 * Delete data from an API with offline support
 * @param {string} endpoint - API endpoint
 * @param {string} offlineAction - Action type for offline queue
 * @returns {Promise<any>} - API response
 */
export const deleteData = async (endpoint, offlineAction) => {
  return apiCall(
    endpoint,
    {
      method: 'DELETE',
    },
    null,
    false,
    offlineAction
  );
};

export default {
  apiCall,
  getData,
  postData,
  updateData,
  deleteData,
};
