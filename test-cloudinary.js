// Simple script to test Cloudinary configuration
import { testCloudinaryConfig, testDirectUpload } from './src/utils/cloudinary.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Print environment variables (with partial masking for security)
const cloudName = process.env.VITE_CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.VITE_CLOUDINARY_API_KEY;
const apiSecret = process.env.VITE_CLOUDINARY_API_SECRET;

console.log('Environment variables:');
console.log('VITE_CLOUDINARY_CLOUD_NAME:', cloudName);
console.log('VITE_CLOUDINARY_API_KEY:', apiKey ? apiKey.substring(0, 4) + '...' + apiKey.substring(apiKey.length - 4) : 'undefined');
console.log('VITE_CLOUDINARY_API_SECRET:', apiSecret ? apiSecret.substring(0, 4) + '...' + apiSecret.substring(apiSecret.length - 4) : 'undefined');

// Test Cloudinary configuration
async function runTests() {
  try {
    console.log('\nTesting Cloudinary configuration...');
    const configResult = await testCloudinaryConfig();
    console.log('Configuration test result:', configResult);
    
    // List resources in the folder
    console.log('\nListing resources in alwahes_car_images folder...');
    const { v2: cloudinary } = await import('cloudinary');
    
    cloudinary.config({
      cloud_name: process.env.VITE_CLOUDINARY_CLOUD_NAME,
      api_key: process.env.VITE_CLOUDINARY_API_KEY,
      api_secret: process.env.VITE_CLOUDINARY_API_SECRET,
      secure: true
    });
    
    try {
      const result = await cloudinary.api.resources({
        type: 'upload',
        prefix: 'alwahes_car_images/',
        max_results: 10
      });
      
      console.log('Resources found:', result.resources.length);
      result.resources.forEach(resource => {
        console.log(' - ' + resource.public_id + ' (' + resource.format + ')');
        console.log('   URL: ' + resource.secure_url);
      });
    } catch (listError) {
      console.error('Error listing resources:', listError);
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

runTests();
