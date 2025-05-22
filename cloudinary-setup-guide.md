Vercel CLI 41.4.1
? Set up and deploy “~/alwahes”? (Y/n)
# Cloudinary Setup Guide

## 1. Verify Your Credentials

First, make sure your `.env` file has the correct Cloudinary credentials:

```
VITE_CLOUDINARY_CLOUD_NAME=dtebhwsuu
VITE_CLOUDINARY_API_KEY=427255284314596
VITE_CLOUDINARY_API_SECRET=qbdMCWqGbuatV1Si8tYvj-siVc4
```

## 2. Create the Upload Preset

1. Go to your [Cloudinary Dashboard](https://cloudinary.com/console)
2. Navigate to Settings > Upload
3. Scroll down to "Upload presets" and click "Add upload preset"
4. Configure it with these settings:
   - **Name**: `alwahes_preset`
   - **Signing Mode**: `Unsigned`
   - **Folder**: `alwahes_car_images`
   - **Allowed Formats**: `jpg,png,gif,webp` (optional)
   - **Eager Transformations**: Width: 800, Crop: scale, Quality: auto:good (optional)
5. Click "Save"

## 3. Test the Upload Widget

1. Open the test page:
   ```
   open /Users/mudhafar.hamid/alwahes/final-cloudinary-test.html
   ```
2. Click the "Upload files" button
3. Select an image to upload
4. Check the results section for success or error messages

## 4. Test in the Application

1. Start the application:
   ```
   cd /Users/mudhafar.hamid/alwahes && npm run dev
   ```
2. Open the application in your browser:
   ```
   open http://localhost:5176/
   ```
3. Navigate to the PublishRide page
4. Fill out the form and upload an image
5. Submit the form and check if the image appears in the ride details

## 5. Troubleshooting

If you're still having issues:

1. Check the browser console for errors
2. Make sure the upload preset exists and is configured correctly
3. Verify that the Cloudinary cloud name, API key, and API secret are correct
4. Check if the Airtable field is named exactly `image` (all lowercase)
5. Try uploading directly through the Cloudinary dashboard to test your account

## 6. Verify Uploads in Cloudinary

To check if your images are being uploaded to Cloudinary:

1. Go to your [Cloudinary Media Library](https://cloudinary.com/console/media_library)
2. Look for the `alwahes_car_images` folder
3. Check if your uploaded images appear there
