import { fileURLToPath } from 'url';
import path from 'path';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the test image
const testImagePath = path.join(__dirname, 'test-car.jpg');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.VITE_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.VITE_CLOUDINARY_API_KEY,
  api_secret: process.env.VITE_CLOUDINARY_API_SECRET,
  secure: true
});

async function testUpload() {
  try {
    console.log('Starting Cloudinary upload test...');
    
    // Upload the test image directly using Cloudinary
    console.log('Uploading image to Cloudinary...');
    const result = await cloudinary.uploader.upload(testImagePath, {
      folder: 'alwahes_car_images',
      upload_preset: 'alwahes_preset'
    });
    
    console.log('✅ Upload successful!');
    console.log('Image URL:', result.secure_url);
    console.log('Public ID:', result.public_id);
    
  } catch (error) {
    console.error('❌ Upload failed:');
    console.error(error);
  }
}

testUpload();
