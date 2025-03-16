// Test script to verify image upload functionality
import fetch from 'node-fetch';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Get current file directory (equivalent to __dirname in CommonJS)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

// Cloudinary credentials
const cloudName = process.env.VITE_CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.VITE_CLOUDINARY_API_KEY;
const apiSecret = process.env.VITE_CLOUDINARY_API_SECRET;

// Airtable credentials
const airtableApiKey = process.env.VITE_AIRTABLE_API_KEY;
const airtableBaseId = process.env.VITE_AIRTABLE_BASE_ID;

// Function to create a test image
function createTestImage() {
  const imagePath = path.join(__dirname, 'test-car.jpg');
  
  // Create a simple test image if it doesn't exist
  if (!fs.existsSync(imagePath)) {
    console.log('Creating test image...');
    // Create a simple 1x1 pixel JPEG file
    const buffer = Buffer.from([
      0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01, 
      0x01, 0x01, 0x00, 0x48, 0x00, 0x48, 0x00, 0x00, 0xff, 0xdb, 0x00, 0x43, 
      0x00, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 
      0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 
      0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 
      0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 
      0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 
      0xff, 0xff, 0xff, 0xff, 0xff, 0xc0, 0x00, 0x0b, 0x08, 0x00, 0x01, 0x00, 
      0x01, 0x01, 0x01, 0x11, 0x00, 0xff, 0xc4, 0x00, 0x14, 0x00, 0x01, 0x00, 
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
      0x00, 0x00, 0x00, 0xff, 0xc4, 0x00, 0x14, 0x10, 0x01, 0x00, 0x00, 0x00, 
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
      0x00, 0xff, 0xda, 0x00, 0x08, 0x01, 0x01, 0x00, 0x00, 0x3f, 0x00, 0x7f, 
      0x00, 0xff, 0xd9
    ]);
    
    fs.writeFileSync(imagePath, buffer);
    console.log('Test image created at:', imagePath);
  }
  
  return imagePath;
}

// Function to upload an image to Cloudinary
async function uploadToCloudinary(imagePath) {
  console.log('Uploading to Cloudinary...');
  
  const formData = new FormData();
  formData.append('file', fs.createReadStream(imagePath));
  formData.append('upload_preset', 'alwahes_car_images');
  formData.append('api_key', apiKey);
  
  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: formData
  });
  
  const result = await response.json();
  console.log('Cloudinary upload result:', result);
  
  return {
    url: result.secure_url,
    filename: path.basename(imagePath),
    size: fs.statSync(imagePath).size,
    type: 'image/jpeg'
  };
}

// Function to create a ride in Airtable with the image
async function createRideInAirtable(imageData) {
  console.log('Creating ride in Airtable with image...');
  
  const rideData = {
    records: [{
      fields: {
        'Name of Driver': 'Test Driver',
        'Starting city': 'Karbala',
        'Destination city': 'Erbil',
        'Date': '2025-03-20',
        'Time': '12:00 PM',
        'Seats Available': '4',
        'Price per Seat': '10000',
        'WhatsApp Number': '+9647801234567',
        'Car Type': 'gas',
        'Note': 'Test ride',
        'Status': 'Active',
        'image': [imageData] // Use 'image' as the field name for Airtable
      }
    }]
  };
  
  console.log('Request body:', JSON.stringify(rideData, null, 2));
  
  const response = await fetch(
    `https://api.airtable.com/v0/${airtableBaseId}/Published Rides`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${airtableApiKey}`
      },
      body: JSON.stringify(rideData)
    }
  );
  
  const result = await response.json();
  console.log('Airtable create ride result:', result);
  
  return result;
}

// Function to verify the image in Airtable
async function verifyImageInAirtable(recordId) {
  console.log('Verifying image in Airtable...');
  
  const response = await fetch(
    `https://api.airtable.com/v0/${airtableBaseId}/Published Rides/${recordId}`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${airtableApiKey}`
      }
    }
  );
  
  const result = await response.json();
  console.log('Airtable record:', result);
  
  // Check if the image field exists and has the expected structure
  if (result.fields.image && Array.isArray(result.fields.image) && result.fields.image.length > 0) {
    console.log('✅ Image found in Airtable record!');
    console.log('Image data:', result.fields.image[0]);
    return true;
  } else {
    console.log('❌ Image not found in Airtable record');
    return false;
  }
}

// Main test function
async function runTest() {
  try {
    console.log('=== Starting Image Upload Test ===');
    
    // Step 1: Create a test image
    const imagePath = createTestImage();
    
    // Step 2: Upload the image to Cloudinary
    const imageData = await uploadToCloudinary(imagePath);
    
    // Step 3: Create a ride in Airtable with the image
    const createResult = await createRideInAirtable(imageData);
    
    if (createResult.records && createResult.records.length > 0) {
      const recordId = createResult.records[0].id;
      
      // Step 4: Verify the image in Airtable
      const verified = await verifyImageInAirtable(recordId);
      
      if (verified) {
        console.log('=== Test Completed Successfully! ===');
        console.log('The image upload functionality is working correctly.');
      } else {
        console.log('=== Test Failed ===');
        console.log('The image was not found in the Airtable record.');
      }
    } else {
      console.log('=== Test Failed ===');
      console.log('Failed to create ride in Airtable.');
    }
  } catch (error) {
    console.error('Error during test:', error);
    console.log('=== Test Failed ===');
  }
}

// Run the test
runTest();
