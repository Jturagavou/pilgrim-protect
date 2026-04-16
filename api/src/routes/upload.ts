import { Router, type RequestHandler } from "express";
import multer from "multer";
import type { UploadApiResponse } from "cloudinary";
import { cloudinary, isMockMode } from "../config/cloudinary";
import { protect } from "../middleware/auth";

const router = Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

// POST /api/upload/image — multipart form, field name: "image"
const uploadImage: RequestHandler = async (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: "No image file provided" });
      return;
    }

    if (isMockMode) {
      const mockUrl = `https://res.cloudinary.com/demo/image/upload/v1/pilgrim-protect/mock_${Date.now()}.jpg`;
      res.json({ url: mockUrl });
      return;
    }

    const result = await new Promise<UploadApiResponse>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "pilgrim-protect",
          resource_type: "image",
        },
        (error, uploaded) => {
          if (error || !uploaded) reject(error ?? new Error("Upload failed"));
          else resolve(uploaded);
        }
      );
      uploadStream.end(req.file!.buffer);
    });

    res.json({ url: result.secure_url });
  } catch (error) {
    next(error);
  }
};

router.post("/image", protect, upload.single("image"), uploadImage);

export default router;
