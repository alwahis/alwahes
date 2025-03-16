// Script to monitor network requests for image upload

// Function to monitor fetch requests
function monitorFetchRequests() {
  const originalFetch = window.fetch;
  
  window.fetch = async function(...args) {
    const url = args[0];
    const options = args[1] || {};
    
    console.log(`📡 Fetch request to: ${url}`);
    console.log('📡 Fetch options:', options);
    
    if (options.body && typeof options.body === 'string') {
      try {
        const bodyJson = JSON.parse(options.body);
        console.log('📡 Request body:', bodyJson);
        
        // Check if this is an Airtable request with image data
        if (url.includes('airtable.com') && 
            bodyJson.records && 
            bodyJson.records[0].fields.image) {
          console.log('🖼️ Image data found in Airtable request:', bodyJson.records[0].fields.image);
        }
      } catch (e) {
        console.log('📡 Request body is not JSON');
      }
    }
    
    try {
      const response = await originalFetch.apply(this, args);
      
      // Clone the response to read its body
      const clonedResponse = response.clone();
      
      // Try to parse JSON response
      try {
        const responseData = await clonedResponse.json();
        console.log(`📡 Response from ${url}:`, responseData);
      } catch (e) {
        console.log(`📡 Response from ${url} is not JSON`);
      }
      
      return response;
    } catch (error) {
      console.error(`📡 Error in fetch to ${url}:`, error);
      throw error;
    }
  };
  
  console.log('🔍 Fetch monitoring enabled');
}

// Function to monitor XMLHttpRequest
function monitorXHR() {
  const originalOpen = XMLHttpRequest.prototype.open;
  const originalSend = XMLHttpRequest.prototype.send;
  
  XMLHttpRequest.prototype.open = function(method, url, ...rest) {
    this._url = url;
    this._method = method;
    return originalOpen.apply(this, [method, url, ...rest]);
  };
  
  XMLHttpRequest.prototype.send = function(body) {
    console.log(`📡 XHR ${this._method} request to: ${this._url}`);
    
    if (body) {
      try {
        if (typeof body === 'string') {
          const bodyJson = JSON.parse(body);
          console.log('📡 XHR request body:', bodyJson);
          
          // Check if this is an Airtable request with image data
          if (this._url.includes('airtable.com') && 
              bodyJson.records && 
              bodyJson.records[0].fields.image) {
            console.log('🖼️ Image data found in Airtable XHR request:', bodyJson.records[0].fields.image);
          }
        } else {
          console.log('📡 XHR request body is not a string:', body);
        }
      } catch (e) {
        console.log('📡 XHR request body is not JSON');
      }
    }
    
    // Listen for the response
    this.addEventListener('load', function() {
      if (this.responseType === 'json' || this.responseType === '' || this.responseType === 'text') {
        try {
          const responseData = typeof this.response === 'string' ? JSON.parse(this.response) : this.response;
          console.log(`📡 XHR Response from ${this._url}:`, responseData);
        } catch (e) {
          console.log(`📡 XHR Response from ${this._url} is not JSON:`, this.response);
        }
      }
    });
    
    return originalSend.apply(this, arguments);
  };
  
  console.log('🔍 XHR monitoring enabled');
}

// Function to start monitoring
function startMonitoring() {
  monitorFetchRequests();
  monitorXHR();
  console.log('🔍 Network monitoring started. All fetch and XHR requests will be logged to the console.');
}

// Export the monitoring function to the global scope
window.startMonitoring = startMonitoring;

// Instructions
console.log(`
=== Network Monitoring for Image Upload ===

To monitor network requests during image upload:

1. Start monitoring:
   startMonitoring();

2. Navigate to the PublishRide page and upload an image

3. Watch the console for detailed logs of all network requests

This will help identify any issues with the image upload process.
`);
