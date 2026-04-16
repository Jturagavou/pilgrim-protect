import { v2 as cloudinary } from "cloudinary";
import { logger } from "../lib/logger";

export const isMockMode =
  !process.env.CLOUDINARY_CLOUD_NAME ||
  process.env.CLOUDINARY_CLOUD_NAME === "your_cloud_name";

if (!isMockMode) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  logger.info({ cloudinary: "live" }, "Cloudinary configured");
} else {
  logger.info({ cloudinary: "mock" }, "Cloudinary running in mock mode");
}

export { cloudinary };
