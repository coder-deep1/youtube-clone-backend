import mongoose from "mongoose";
import { Like } from "../models/likes.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiErrors.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getLikedVideos = asyncHandler(async (req, res) => {
  // TODO: "Get all liked videos for a user";
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  // TODO: "Toggle like on a tweet";
});

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  // TODO: "Toggle like on a video";
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  // TODO: "Toggle like on a comment";
});

export { getLikedVideos, toggleTweetLike, toggleCommentLike, toggleVideoLike };
