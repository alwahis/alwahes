const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
const API_KEY = import.meta.env.VITE_CLOUDINARY_API_KEY;

/**
 * Uploads an image to Cloudinary
 * @param {File} file - The image file to upload
 * @returns {Promise<Object>} - The upload result with secure URL
 */
export const uploadImage = (file) => {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);
    formData.append('cloud_name', import.meta.env.VITE_CLOUDINARY_CLOUD_NAME);
    formData.append('api_key', import.meta.env.VITE_CLOUDINARY_API_KEY);

    fetch(`https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`, {
      method: 'POST',
      body: formData,
    })
    .then(response => {
      if (!response.ok) {
        return response.json().then(err => {
          throw new Error(err.error?.message || 'Failed to upload image');
        });
      }
      return response.json();
    })
    .then(data => {
      if (data.error) {
        throw new Error(data.error.message);
      }
      resolve(data);
    })
    .catch(error => {
      console.error('Error uploading to Cloudinary:', error);
      reject(error);
    });
  });
};

/**
 * Deletes an image from Cloudinary
 * Note: This function would require a server-side implementation
 * as it requires the API secret which should not be exposed client-side
 */
export const deleteImage = async (publicId) => {
  console.warn('Image deletion requires server-side implementation');
  return { result: 'ok' }; // Mock response
};
