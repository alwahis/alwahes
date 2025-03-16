// This is a script to run in the browser console to test the image upload functionality

// Function to create a test image
async function createTestImage() {
  // Create a canvas element
  const canvas = document.createElement('canvas');
  canvas.width = 200;
  canvas.height = 200;
  
  // Get the 2D context
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
  
  // Convert to blob
  return new Promise(resolve => {
    canvas.toBlob(blob => {
      const file = new File([blob], 'test-car.png', { type: 'image/png' });
      resolve(file);
    }, 'image/png');
  });
}

// Function to test the image upload
async function testImageUpload() {
  console.log('Starting image upload test...');
  
  try {
    // Create a test image
    const testImage = await createTestImage();
    console.log('Test image created:', testImage);
    
    // Import the required functions
    const { uploadImage } = await import('./src/utils/cloudinary.js');
    
    // Test the uploadImage function
    console.log('Testing uploadImage function...');
    const uploadResult = await uploadImage(testImage);
    console.log('Upload result:', uploadResult);
    
    console.log('Image upload test completed successfully!');
    return uploadResult;
  } catch (error) {
    console.error('Error in image upload test:', error);
  }
}

// Instructions for manual testing
console.log(`
=== Image Upload Test ===

To test the image upload functionality, you can:

1. Run the automated test by executing:
   testImageUpload().then(result => console.log('Final result:', result));

2. Or manually test by:
   a. Navigate to the PublishRide page (http://localhost:5174/publish-ride)
   b. Fill out the form with test data
   c. Upload an image
   d. Submit the form
   e. Check the console logs

The test will create a simple test image and upload it to Cloudinary.
`);

// Export the test function to the global scope
window.testImageUpload = testImageUpload;
