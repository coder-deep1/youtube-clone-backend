import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// cloudinary.config({
//   cloud_name: "process.env.CLOUDINARY_CLOUD_NAME",
//   api_key: "process.env.CLOUDINARY_API_KEY",
//   api_secret: "process.env.CLOUDINARY_API_SECRET",
// });
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
    // file uploaded successfully cloudinary
    // console.log("file uploaded successfully cloudinary");
    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath); // remove file from local storage but than operation is not successful
    return null;
  }
};

const deleteFromCloudinary = async (url) => {
  try {
    if (!url) return null;
    const deletedResponse = await cloudinary.uploader.destroy(url, {
      resource_type: "auto",
    });
    return deletedResponse;
  } catch (error) {
    return null;
  }
};

export { uploadOnCloudinary, deleteFromCloudinary };
