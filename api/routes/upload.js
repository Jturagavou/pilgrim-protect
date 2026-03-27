const express = require('express');
const multer = require('multer');
const { cloudinary, isMockMode } = require('../config/cloudinary');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Configure multer for memory storage (buffer for Cloudinary upload)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

// POST /api/upload/image — multipart form, field name: "image"
router.post('/image', protect, upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    // Mock mode — return a placeholder URL
    if (isMockMode) {
      const mockUrl = `https://res.cloudinary.com/demo/image/upload/v1/pilgrim-protect/mock_${Date.now()}.jpg`;
      return res.json({ url: mockUrl });
    }

    // Live mode — upload buffer to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'pilgrim-protect',
          resource_type: 'image',
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(req.file.buffer);
    });

    res.json({ url: result.secure_url });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
