// Utility for uploading a locally saved file to Cloudinary
// -------------------------------------------------------
// This module takes a file that already exists on the server’s local filesystem
// (e.g., after a user uploads through Multer) and uploads it to Cloudinary’s
// managed storage/CDN. After a successful upload, the file is accessible
// globally via the returned secure URL.

import dotenv from "dotenv";
dotenv.config();

import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// ✅ Configure the Cloudinary client with credentials stored in environment variables.
//    These values should be set in your .env file to keep secrets out of source control.
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Uploads a local file to Cloudinary and returns the full Cloudinary response object.
// Workflow:
// 1. Verify that a file path exists.
// 2. Call Cloudinary’s uploader with `resource_type: "auto"` so it detects the file type
//    (image, video, etc.) automatically.
// 3. If successful, return the Cloudinary response (includes secure URL, public_id, etc.).
// 4. If an error occurs, remove the temporary local file to free disk space and return null.

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    // 🔼 Upload file to Cloudinary; resource_type:"auto" lets Cloudinary infer media type.
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    console.log(
      "✅ File uploaded successfully to Cloudinary:",
      response.secure_url
    );
    fs.unlinkSync(localFilePath);
    console.log(localFilePath);
    return response;
  } catch (error) {
    // ⚠️ If upload fails, delete the temporary file to prevent disk bloat.
    fs.unlinkSync(localFilePath);
    console.error("❌ Cloudinary upload failed:", error);
    return null;
  }
};

const deleteFromCloudinary = async (
  publicId,
  resourceName,
  resourceType = "image"
) => {
  if (!publicId) {
    console.warn("⚠️ deleteFromCloudinary called without publicId");
    return null;
  }

  const result = await cloudinary.uploader.destroy(publicId, {
    resource_type: resourceType,
  });

  if (result.result === "ok" || result.result === "not found") {
    console.log(
      `🧹 Cloudinary: deleted ${resourceName} with publicId:${publicId}`
    );
    return result;
  } else {
    console.warn(
      `⚠️ Cloudinary: could not delete ${resourceName} with publicId:${publicId}`,
      result
    );
    return null;
  }
};

export { uploadOnCloudinary, deleteFromCloudinary };
