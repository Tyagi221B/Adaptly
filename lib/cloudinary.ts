import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;

// Upload image to Cloudinary
export async function uploadImage(
  file: string,
  folder: string = "adaptly/courses"
) {
  try {
    console.log("[CLOUDINARY] Starting upload to folder:", folder);
    console.log("[CLOUDINARY] File data length:", file.length);
    console.log("[CLOUDINARY] File type:", file.substring(0, 30));

    const result = await cloudinary.uploader.upload(file, {
      folder,
      resource_type: "image",
      transformation: [
        { width: 1200, height: 630, crop: "fill", quality: "auto" },
      ],
      timeout: 60000,
    });

    console.log("[CLOUDINARY] Upload successful!");
    console.log("[CLOUDINARY] URL:", result.secure_url);
    console.log("[CLOUDINARY] Public ID:", result.public_id);

    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    console.error("[CLOUDINARY] Upload error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Upload failed",
    };
  }
}


//  Delete image from Cloudinary
export async function deleteImage(publicId: string) {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return { success: true, result };
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Delete failed",
    };
  }
}
