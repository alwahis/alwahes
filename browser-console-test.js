// This is a script to test the image upload functionality directly in the browser console

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

// Function to test the image upload directly
async function testImageUploadDirect() {
  console.log('Starting direct image upload test...');
  
  try {
    // Import the cloudinary utility
    const { uploadImage } = await import('./src/utils/cloudinary.js');
    
    // Create a test image
    const testImage = await createTestImage();
    console.log('Test image created:', testImage);
    
    // Upload the image to Cloudinary
    console.log('Uploading image to Cloudinary...');
    const uploadResult = await uploadImage(testImage);
    console.log('Cloudinary upload result:', uploadResult);
    
    // Check if the upload was successful
    if (uploadResult && uploadResult.url) {
      console.log('✅ Image uploaded successfully to Cloudinary!');
      console.log('Image URL:', uploadResult.url);
      return uploadResult;
    } else {
      console.log('❌ Image upload failed');
      return null;
    }
  } catch (error) {
    console.error('Error during image upload test:', error);
    return null;
  }
}

// Function to fill the PublishRide form with test data
async function fillPublishRideForm() {
  console.log('Filling PublishRide form with test data...');
  
  try {
    // Create a test image
    const testImage = await createTestImage();
    
    // Wait for the form elements to be available
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Get form elements
    const nameInput = document.querySelector('input[name="name"]');
    const fromInput = document.querySelector('input[name="from"]');
    const toInput = document.querySelector('input[name="to"]');
    const dateInput = document.querySelector('input[name="date"]');
    const priceInput = document.querySelector('input[name="price"]');
    const whatsappInput = document.querySelector('input[name="whatsappNumber"]');
    const carTypeInput = document.querySelector('input[name="carType"]');
    const noteInput = document.querySelector('textarea[name="note"]');
    
    // Fill the form
    if (nameInput) nameInput.value = 'Test Driver';
    if (fromInput) fromInput.value = 'Karbala';
    if (toInput) toInput.value = 'Erbil';
    if (dateInput) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const formattedDate = tomorrow.toISOString().split('T')[0];
      dateInput.value = formattedDate;
      
      // Trigger change event
      const event = new Event('change', { bubbles: true });
      dateInput.dispatchEvent(event);
    }
    if (priceInput) priceInput.value = '10000';
    if (whatsappInput) whatsappInput.value = '07801234567';
    if (carTypeInput) carTypeInput.value = 'gas';
    if (noteInput) noteInput.value = 'Test ride created by automated test';
    
    console.log('Form filled with test data');
    
    // Return the test image for later use
    return testImage;
  } catch (error) {
    console.error('Error filling form:', error);
    return null;
  }
}

// Function to simulate file selection in the image input
async function selectImageFile(testImage) {
  console.log('Selecting image file...');
  
  try {
    // Get the file input element
    const fileInput = document.querySelector('input[type="file"]');
    
    if (!fileInput) {
      console.error('File input element not found');
      return false;
    }
    
    // Create a DataTransfer object
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(testImage);
    
    // Set the files property of the file input
    fileInput.files = dataTransfer.files;
    
    // Trigger change event
    const event = new Event('change', { bubbles: true });
    fileInput.dispatchEvent(event);
    
    console.log('Image file selected');
    return true;
  } catch (error) {
    console.error('Error selecting image file:', error);
    return false;
  }
}

// Function to submit the form
function submitForm() {
  console.log('Submitting form...');
  
  try {
    // Get the submit button
    const submitButton = Array.from(document.querySelectorAll('button')).find(
      button => button.textContent.includes('نشر الرحلة')
    );
    
    if (!submitButton) {
      console.error('Submit button not found');
      return false;
    }
    
    // Click the button
    submitButton.click();
    console.log('Form submitted');
    return true;
  } catch (error) {
    console.error('Error submitting form:', error);
    return false;
  }
}

// Main test function
async function testPublishRideWithImage() {
  console.log('=== Starting PublishRide with Image Test ===');
  
  try {
    // Step 1: Test direct image upload to Cloudinary
    const directUploadResult = await testImageUploadDirect();
    
    if (!directUploadResult) {
      console.log('❌ Direct image upload test failed. Stopping test.');
      return;
    }
    
    // Step 2: Navigate to the PublishRide page
    window.location.href = '/publish-ride';
    
    // Wait for page to load
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Step 3: Fill the form
    const testImage = await fillPublishRideForm();
    
    if (!testImage) {
      console.log('❌ Form filling failed. Stopping test.');
      return;
    }
    
    // Step 4: Select the image file
    const imageSelected = await selectImageFile(testImage);
    
    if (!imageSelected) {
      console.log('❌ Image selection failed. Stopping test.');
      return;
    }
    
    // Step 5: Submit the form
    const formSubmitted = submitForm();
    
    if (!formSubmitted) {
      console.log('❌ Form submission failed. Stopping test.');
      return;
    }
    
    console.log('✅ Test completed! Check the console for any errors during form submission.');
    console.log('After the ride is published, navigate to the search results page and search for rides from Karbala to Erbil to verify the image is displayed.');
  } catch (error) {
    console.error('Error during test:', error);
    console.log('❌ Test failed');
  }
}

// Instructions for running the test
console.log(`
=== Image Upload Test ===

To test the image upload functionality, you can:

1. Test the direct image upload to Cloudinary:
   testImageUploadDirect().then(result => console.log('Final result:', result));

2. Test the full PublishRide flow with image:
   testPublishRideWithImage();

The test will create a simple test image and upload it to Cloudinary.
`);

// Export the test functions to the global scope
window.testImageUploadDirect = testImageUploadDirect;
window.testPublishRideWithImage = testPublishRideWithImage;
