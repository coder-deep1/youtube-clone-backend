import mongoose from "mongoose";
import { ApiError } from "../utils/ApiErrors.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;

  let queryFilter = {};

  if (query) {
    queryFilter = {
      $or: [
        { title: { $regex: new RegExp(query, "i") } },
        { description: { $regex: new RegExp(query, "i") } },
      ],
    };
  }

  if (userId) {
    queryFilter.owner = userId;
  }

  const sortOptions = {};

  if (sortBy && sortType) {
    sortOptions[sortBy] = sortType === "asc" ? 1 : -1;
  }

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    sort: sortOptions,
  };

  const videos = await Video.paginate(queryFilter, options);

  if (!videos) {
    throw new ApiError(404, "No videos found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, videos, "Videos fetched successfully"));
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;

  if ([title, description].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "Title and description are required");
  }

  const videoFileLocalPath = await req.files?.videoFile[0]?.path;
  const thumbnailLocalPath = await req.files?.thumbnail[0]?.path;

  if (!videoFileLocalPath || !thumbnailLocalPath) {
    throw new ApiError(400, "Video and thumbnail are required");
  }

  const videoFile = await uploadOnCloudinary(videoFileLocalPath);
  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

  if (!videoFile || !thumbnail) {
    throw new ApiError(
      400,
      "Failed to upload video or thumbnail on Cloudinary"
    );
  }

  const uploadedVideo = await Video.create({
    title: title,
    description: description,
    isPublished: isPublished,
    videoFile: videoFile.url,
    thumbnail: thumbnail.url,
    duration: videoFile.duration,
    isPublished: true,
    owner: new mongoose.Types.ObjectId(req.user._id),
  });

  if (!uploadedVideo) {
    throw new ApiError(500, "Failed to upload video");
  }

  const createdVideo = await Video.findById(uploadedVideo?._id);

  if (!createdVideo) {
    throw new ApiError(500, "Failed to retrieve the created video");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdVideo, "Video uploaded successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  const videos = await Video.findById(videoId);

  if (!videos) {
    throw new ApiError(404, "No videos found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, videos, "Video fetched successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { title, description } = req.body;

  const thumbnailLocalPath = await req.file?._id;
  const videoFileLocalPath = await req.file?.path;

  if (!title || !description || !thumbnailLocalPath || !videoFileLocalPath) {
    throw new ApiError(
      400,
      "Title, description, thumbnail, and video file are required"
    );
  }

  const video = await Video.findById(videoId);

  const isThumbnailDeleted = await deleteFromCloudinary(video.thumbnail);
  const isVideoFileDeleted = await deleteFromCloudinary(video.videoFile);

  if (!isThumbnailDeleted || !isVideoFileDeleted) {
    throw new ApiError(
      400,
      "Error while deleting thumbnail or video file from Cloudinary"
    );
  }

  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
  const videoFile = await uploadOnCloudinary(videoFileLocalPath);

  if (!thumbnail || !videoFile) {
    throw new ApiError(
      400,
      "Error while uploading new Thumbnail or Video File"
    );
  }

  video.thumbnail = thumbnail.url;
  video.videoFile = videoFile.url;
  video.description = description || video.description;
  video.title = title || video.title;

  await video.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video updated Successfully"));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "No videos found");
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
});

const togglePublishVideo = asyncHandler(async (req, res) => {
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
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishVideo,
};
