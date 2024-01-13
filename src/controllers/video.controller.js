import { ApiError } from "../utils/ApiErrors.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;

  const baseQuery = {};

  if (query) {
    baseQuery.$or = [
      { title: { $regex: query, $options: "i" } },
      { description: { $regex: query, $options: "i" } },
    ];
  }

  // Sorting
  const sortOptions = {};
  if (sortBy) {
    sortOptions[sortBy] = sortType === "desc" ? -1 : 1;
  }

  try {
    const videos = await Video.aggregatePaginate([
      { $match: { ...baseQuery, owner: userId } },
      { $sort: sortOptions },
      { $skip: (page - 1) * limit },
      { $limit: parseInt(limit) },
    ]);

    res.status(200).json(
      new ApiResponse({
        success: true,
        data: videos,
      })
    );
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      data: error.message,
    });
  }
});

// Video Publish Tested with Postman Successfully, ✅

const publishAVideo = asyncHandler(async (req, res) => {
  try {
    const { title, description } = req.body;
    const userId = req.user._id;

    const isPublic = true;

    if ([title, description].some((field) => !field?.trim())) {
      throw new ApiError(400, "Title and description are required");
    }

    const videoFileLocalPath = await req.files?.videoFile[0]?.path;
    const thumbnailLocalPath = await req.files?.thumbnail[0]?.path;

    if (!videoFileLocalPath || !thumbnailLocalPath) {
      throw new ApiError(400, "Video and thumbnail are required");
    }

    const videoFile = await uploadOnCloudinary(videoFileLocalPath);

    if (!videoFile) {
      throw new ApiError(400, "Failed to upload video on Cloudinary");
    }

    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

    if (!thumbnail) {
      await deleteFromCloudinary(videoFile?.url);

      throw new ApiError(
        400,
        "Failed to upload video or thumbnail on Cloudinary"
      );
    }

    const uploadedVideo = await Video.create({
      videoFile: videoFile.url,
      thumbnail: thumbnail.url,
      isPublic: isPublic,
      title: title,
      description: description,
      duration: (videoFile.duration / 60).toFixed(2),
      owner: userId,
    });

    if (!uploadedVideo) {
      await deleteFromCloudinary(videoFile?.url);
      await deleteFromCloudinary(thumbnail?.url);

      throw new ApiError(500, "Failed to upload video");
    }

    const createdVideo = await Video.findById(uploadedVideo?._id);

    if (!createdVideo) {
      throw new ApiError(500, "Failed to retrieve the created video");
    }

    return res
      .status(201)
      .json(new ApiResponse(200, createdVideo, "Video uploaded successfully"));
  } catch (error) {
    return res
      .status(error.status || 500)
      .json(new ApiResponse(error.status || 500, null, error.message));
  }
});

// Get Video Tested with Postman Successfully,✅

const getVideoById = asyncHandler(async (req, res) => {
  try {
    const { videoId } = req.params;

    const videos = await Video.findById(videoId);

    if (!videos) {
      throw new ApiError(404, "No videos found");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, videos, "Video fetched successfully"));
  } catch (error) {
    return res
      .status(error.status || 500)
      .json(new ApiResponse(error.status || 500, null, error.message));
  }
});

// Update Video Tested with Postman Successfully, ✅

const updateVideo = asyncHandler(async (req, res) => {
  try {
    const { videoId } = req.params;
    const { title, description } = req.body;

    const thumbnailLocalPath = req.file?.path;

    if (!title && !description && !thumbnailLocalPath) {
      throw new ApiError(400, "at list one field is required to update video");
    }

    const video = await Video.findById(videoId);

    if (!video) {
      throw new ApiError(404, `Video not found with ID: ${videoId}`);
    }

    const isThumbnailDeleted = await deleteFromCloudinary(video.thumbnail.url);

    // console.log(isThumbnailDeleted);

    if (!isThumbnailDeleted) {
      throw new ApiError(
        500,
        `Error deleting old thumbnail from Cloudinary: ${video.thumbnail}`
      );
    }

    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

    if (!thumbnail) {
      throw new ApiError(400, "Error while uploading new Thumbnail");
    }

    video.title = title;
    video.description = description;
    video.thumbnail = thumbnail.url;

    await video.save({ validateBeforeSave: false });

    return res
      .status(200)
      .json(new ApiResponse(200, video, "Thumbnail updated successfully"));
  } catch (error) {
    return res
      .status(error.status || 500)
      .json(new ApiResponse(error.status || 500, null, error.message));
  }
});

// Delete Video tested with Postman Successfully, ✅

const deleteVideo = asyncHandler(async (req, res) => {
  try {
    const { videoId } = req.params;
    const video = await Video.findById(videoId);

    if (!video) {
      throw new ApiError(404, `Video not found with ID: ${videoId}`);
    }

    const isDeleted = await deleteFromCloudinary(video.videoFile);

    if (!isDeleted) {
      throw new ApiError(400, "Failed to delete video from Cloudinary");
    }

    const deleteVideo = await Video.findByIdAndDelete(videoId);

    if (!deleteVideo) {
      throw new ApiError(400, "Failed to delete video from database");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Video deleted successfully"));
  } catch (error) {
    return res
      .status(error.status || 500)
      .json(new ApiResponse(error.status || 500, null, error.message));
  }
});

// Toggle Publish Video Tested with Postman Successfully, ✅

const togglePublishVideo = asyncHandler(async (req, res) => {
  try {
    const { videoId } = req.params;

    const video = await Video.findById(videoId);

    if (!video) {
      throw new ApiError(404, `Video with ID ${videoId} not found`);
    }

    video.isPublished = !video.isPublished;

    await video.save({ validateBeforeSave: false });

    return res
      .status(200)
      .json(
        new ApiResponse(200, video, "Video publish status toggled successfully")
      );
  } catch (error) {
    return res
      .status(error.status || 500)
      .json(new ApiResponse(error.status || 500, null, error.message));
  }
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishVideo,
};
