// This script tests the image field handling in the application

// Function to test Airtable image field handling
async function testAirtableImageField() {
  console.log('=== Testing Airtable Image Field Handling ===');
  
  try {
    // Get API key and base ID from environment variables
    const apiKey = import.meta.env.VITE_AIRTABLE_API_KEY;
    const baseId = import.meta.env.VITE_AIRTABLE_BASE_ID;
    
    if (!apiKey || !baseId) {
      console.error('Missing Airtable API key or base ID');
      return;
    }
    
    console.log('Fetching a sample ride from Airtable to check image field...');
    
    // Fetch a single record from the Published Rides table
    const response = await fetch(
      `https://api.airtable.com/v0/${baseId}/Published%20Rides?maxRecords=10`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );
    
    if (!response.ok) {
      console.error('Failed to fetch rides from Airtable:', response.statusText);
      return;
    }
    
    const data = await response.json();
    console.log('Fetched rides data:', data);
    
    if (!data.records || data.records.length === 0) {
      console.log('No rides found in Airtable');
      return;
    }
    
    // Examine each record to find one with an image
    let recordWithImage = null;
    
    for (const record of data.records) {
      console.log('Examining record:', record.id);
      console.log('Fields:', record.fields);
      
      // Check all fields for image data
      for (const fieldName in record.fields) {
        const fieldValue = record.fields[fieldName];
        
        if (
          (fieldName.toLowerCase().includes('image') || fieldName.toLowerCase() === 'image') && 
          fieldValue
        ) {
          console.log(`Found potential image field: ${fieldName}`, fieldValue);
          recordWithImage = record;
          break;
        }
      }
      
      if (recordWithImage) break;
    }
    
    if (!recordWithImage) {
      console.log('No records with image field found');
      return;
    }
    
    console.log('Record with image:', recordWithImage);
    
    // Check the exact structure of the image field
    for (const fieldName in recordWithImage.fields) {
      if (
        fieldName.toLowerCase().includes('image') || 
        fieldName.toLowerCase() === 'image'
      ) {
        const imageField = recordWithImage.fields[fieldName];
        console.log(`\nExamining image field: ${fieldName}`);
        console.log('Type:', typeof imageField);
        console.log('Value:', imageField);
        
        if (Array.isArray(imageField)) {
          console.log('Image field is an array with length:', imageField.length);
          
          if (imageField.length > 0) {
            console.log('First item in array:', imageField[0]);
            console.log('Properties of first item:', Object.keys(imageField[0]));
            
            if (imageField[0].url) {
              console.log('URL property found:', imageField[0].url);
            }
            
            if (imageField[0].thumbnails) {
              console.log('Thumbnails found:', imageField[0].thumbnails);
            }
          }
        }
      }
    }
    
    // Now test creating a new record with an image
    console.log('\nTesting image upload to Airtable...');
    
    // First, create a test image using canvas
    const testImage = await createTestImageBase64();
    console.log('Created test image base64 data');
    
    // Upload the image to Cloudinary
    const cloudinaryResult = await uploadToCloudinary(testImage);
    console.log('Uploaded to Cloudinary:', cloudinaryResult);
    
    if (!cloudinaryResult || !cloudinaryResult.secure_url) {
      console.error('Failed to upload to Cloudinary');
      return;
    }
    
    // Create the attachment object for Airtable
    const attachmentObject = [{
      url: cloudinaryResult.secure_url,
      filename: 'test-image.png',
      size: 10000, // Approximate size
      type: 'image/png'
    }];
    
    console.log('Attachment object for Airtable:', attachmentObject);
    
    // Create a new record with the image
    const createResponse = await fetch(
      `https://api.airtable.com/v0/${baseId}/Published%20Rides`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          records: [
            {
              fields: {
                'Name of Driver': 'Test Driver',
                'Starting city': 'Baghdad',
                'Destination city': 'Erbil',
                'Date': '2025-03-20',
                'Time': '10:00',
                'Seats Available': '3',
                'Price per Seat': '15000',
                'WhatsApp Number': '07801234567',
                // Use 'image' (lowercase) as the field name
                'image': attachmentObject
              },
            },
          ],
        }),
      }
    );
    
    if (!createResponse.ok) {
      console.error('Failed to create record with image:', createResponse.statusText);
      const errorData = await createResponse.json();
      console.error('Error details:', errorData);
      return;
    }
    
    const createResult = await createResponse.json();
    console.log('Created new record with image:', createResult);
    
    // Fetch the newly created record to verify the image field
    if (createResult.records && createResult.records.length > 0) {
      const newRecordId = createResult.records[0].id;
      
      console.log(`\nFetching the newly created record (${newRecordId}) to verify image field...`);
      
      const verifyResponse = await fetch(
        `https://api.airtable.com/v0/${baseId}/Published%20Rides/${newRecordId}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
        }
      );
      
      if (!verifyResponse.ok) {
        console.error('Failed to fetch the new record:', verifyResponse.statusText);
        return;
      }
      
      const verifyData = await verifyResponse.json();
      console.log('Verified record:', verifyData);
      
      // Check the image field in the verified record
      if (verifyData.fields && verifyData.fields.image) {
        console.log('Image field in verified record:', verifyData.fields.image);
        console.log('Test successful! The image field is correctly stored in Airtable.');
      } else {
        console.error('Image field not found in the verified record');
      }
    }
    
  } catch (error) {
    console.error('Error testing Airtable image field:', error);
  }
}

// Function to create a test image as base64
function createTestImageBase64() {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 200;
    
    const ctx = canvas.getContext('2d');
    
    // Fill with a gradient
    const gradient = ctx.createLinearGradient(0, 0, 200, 200);
    gradient.addColorStop(0, 'red');
    gradient.addColorStop(0.5, 'orange');
    gradient.addColorStop(1, 'yellow');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 200, 200);
    
    // Add some text
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText('Test Car Image', 30, 100);
    
    // Convert to base64
    const base64Image = canvas.toDataURL('image/png');
    resolve(base64Image);
  });
}

// Function to upload an image to Cloudinary
async function uploadToCloudinary(base64Image) {
  try {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const apiKey = import.meta.env.VITE_CLOUDINARY_API_KEY;
    const apiSecret = import.meta.env.VITE_CLOUDINARY_API_SECRET;
    
    if (!cloudName || !apiKey || !apiSecret) {
      console.error('Missing Cloudinary credentials');
      return null;
    }
    
    // Create a FormData object
    const formData = new FormData();
    formData.append('file', base64Image);
    formData.append('upload_preset', 'alwahes_preset'); // You might need to create this preset in Cloudinary
    formData.append('api_key', apiKey);
    
    // Upload to Cloudinary
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );
    
    if (!response.ok) {
      console.error('Failed to upload to Cloudinary:', response.statusText);
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    return null;
  }
}

// Export the test function to the global scope
window.testAirtableImageField = testAirtableImageField;

// Instructions
console.log(`
=== Airtable Image Field Test Script ===

To test the Airtable image field handling:

1. Open your browser console (F12 or right-click -> Inspect -> Console)
2. Run the test by typing:
   testAirtableImageField();

This will:
1. Fetch existing rides from Airtable to check the image field structure
2. Create a test image and upload it to Cloudinary
3. Create a new ride record with the image in Airtable
4. Verify that the image field is correctly stored

This will help diagnose issues with the image upload and display.
`);
