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
const deleteFromCloudinary = async (imageUrl) => {
  try {
    const parsedUrl = new URL(imageUrl);

    if (parsedUrl.hostname !== "res.cloudinary.com") {
      throw new Error("Invalid Cloudinary URL");
    }

    const publicId = parsedUrl.pathname.split("/").slice(2).join("/");

    // Check if publicId is empty
    if (!publicId) {
      console.log("Issue getting publicId from Cloudinary URL");
      return null;
    }

    // const publicId = parsedUrl.pathname.split("/").pop().split(".")[0];

    // if (publicId === null) {
    //   console.log("issue to get publicId ", publicId);
    //   return null;
    // }
    const result = await cloudinary.uploader.destroy(publicId);
    return result.result;
  } catch (error) {
    console.log(error.message);
  }
};

export { uploadOnCloudinary, deleteFromCloudinary };
