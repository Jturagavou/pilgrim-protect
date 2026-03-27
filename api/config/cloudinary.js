const cloudinary = require('cloudinary').v2;

const isMockMode =
  !process.env.CLOUDINARY_CLOUD_NAME ||
  process.env.CLOUDINARY_CLOUD_NAME === 'your_cloud_name';

if (!isMockMode) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  console.log('Cloudinary configured (live mode)');
} else {
  console.log('Cloudinary running in mock mode');
}

module.exports = { cloudinary, isMockMode };
