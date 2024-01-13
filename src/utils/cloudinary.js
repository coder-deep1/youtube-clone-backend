import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    // upload file to cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath); // remove file from local storage but than operation is not successful
    return null;
  }
};

/* 
 const deleteFromCloudinary = async (resourceUrl) => {
  if (resourceUrl) {
    try {
      const publicId = extractPublicIdFromUrl(resourceUrl);

      const deletionResult = await cloudinary.uploader.destroy(publicId);

      if (deletionResult.result !== "ok") {
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  }
  return true;
};  
*/

const deleteFromCloudinary = async (resourceUrl) => {
  if (resourceUrl) {
    try {
      // Extract public ID from the Cloudinary URL
      const publicId = extractPublicIdFromUrl(resourceUrl);

      const deletionResult = await cloudinary.uploader.destroy(publicId);

      if (deletionResult.result !== "ok") {
        console.error(
          "Failed to delete resource from Cloudinary. Deletion result:",
          deletionResult
        );
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error deleting resource from Cloudinary:", error.message);
      return false;
    }
  }

  console.warn("No resource URL provided. Considered as successfully deleted.");
  return true;
};

export { uploadOnCloudinary, deleteFromCloudinary };
