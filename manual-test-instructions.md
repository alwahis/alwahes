# Manual Test Instructions for Image Upload

## Overview
This document provides step-by-step instructions for testing the image upload functionality in the Alwahes ride-sharing platform.

## Prerequisites
1. Make sure the application is running at http://localhost:5174/
2. Have a test image ready on your computer (any JPG or PNG file)

## Test Steps

### Test 1: Publishing a Ride with an Image

1. Navigate to the Publish Ride page:
   - Open your browser and go to http://localhost:5174/publish-ride

2. Fill out the ride details:
   - Driver Name: Test Driver
   - From: Baghdad
   - To: Erbil
   - Date: Select tomorrow's date
   - Time: Select any time
   - Available Seats: 3
   - Price per Seat: 15000
   - WhatsApp Number: 07801234567
   - Car Type: Gas
   - Note: Test ride with image upload

3. Upload an image:
   - Click on the "Upload Car Image" button
   - Select a test image from your computer
   - Verify that the image preview appears

4. Submit the form:
   - Click on the "نشر الرحلة" (Publish Ride) button
   - Wait for the success message

5. Verify the image upload:
   - After submission, you should be redirected to the Matching Requests page
   - Open a new tab and go to http://localhost:5174/
   - Search for rides from Baghdad to Erbil
   - Verify that your ride appears in the search results
   - **Check that the image is displayed in the ride card**

### Test 2: Debugging the Image Upload

If the image is not displaying correctly, follow these debugging steps:

1. Open the browser console:
   - Press F12 or right-click and select "Inspect" -> "Console"

2. Run the test script:
   - Copy and paste the following code into the console:

```javascript
// Load the test script
const script = document.createElement('script');
script.src = '/test-image-field.js';
document.head.appendChild(script);

// Wait for the script to load
setTimeout(() => {
  // Run the test
  testAirtableImageField();
}, 1000);
```

3. Analyze the results:
   - The test will fetch existing rides from Airtable
   - It will check the structure of the image field
   - It will create a test image and upload it to Cloudinary
   - It will create a new ride with the image in Airtable
   - It will verify that the image field is correctly stored

4. Check the Airtable directly:
   - Log in to your Airtable account
   - Open the "Published Rides" table
   - Look at the records and verify that the image field contains the uploaded image

## Expected Results

- The image should be successfully uploaded to Cloudinary
- The image should be correctly stored in Airtable
- The image should be displayed in the ride card in the search results

## Troubleshooting

If the image is not displaying:

1. Check the browser console for any errors
2. Verify that the image field in Airtable is named "image" (lowercase)
3. Check that the image field in Airtable contains an array of attachment objects
4. Verify that each attachment object has the following properties:
   - url: The URL of the image
   - filename: The name of the image file
   - size: The size of the image in bytes
   - type: The MIME type of the image (e.g., "image/jpeg")
   - thumbnails: An object containing small and large thumbnail URLs

## Additional Notes

- The image field in Airtable must be of type "Attachment"
- The image data must be formatted correctly for Airtable to recognize it
- The SearchResults component must correctly handle the Airtable attachment format
