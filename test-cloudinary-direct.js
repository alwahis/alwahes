// Direct test script for Cloudinary
import { v2 as cloudinary } from 'cloudinary';
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

// Configure Cloudinary directly
cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  secure: true
});

// Test Cloudinary configuration
async function runTests() {
  try {
    console.log('\nTesting Cloudinary configuration...');
    try {
      // Ping to test connection
      const pingResult = await cloudinary.api.ping();
      console.log('Ping result:', pingResult);
      
      // List resources in the folder
      console.log('\nListing resources in alwahes_car_images folder...');
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
      
      // Check upload preset
      console.log('\nChecking upload preset...');
      const presets = await cloudinary.api.upload_presets({ max_results: 30 });
      const targetPreset = presets.presets.find(p => p.name === 'alwahes_preset');
      
      if (targetPreset) {
        console.log('Found preset "alwahes_preset"');
        console.log('Preset details:', {
          name: targetPreset.name,
          folder: targetPreset.folder,
          unsigned: targetPreset.unsigned,
          allowed_formats: targetPreset.allowed_formats
        });
      } else {
        console.log('Preset "alwahes_preset" not found. Available presets:');
        presets.presets.forEach(p => console.log(` - ${p.name}`));
      }
      
    } catch (apiError) {
      console.error('API Error:', apiError);
    }
  } catch (error) {
    console.error('Test failed:', error);
  }
}

runTests();
