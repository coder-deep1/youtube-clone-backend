import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/likes.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiErrors.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Tweet } from "../models/tweets.model.js";
import { Video } from "../models/video.model.js";
import { Comment } from "../models/comments.model.js";

// get all liked videos ✅;

const getLikedVideos = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    const likedVideo = await Like.find({ owner: userId }).populate("video");

    if (!likedVideo) {
      throw new ApiError(404, "No liked video found");
    }

    const videos = likedVideo.map((Like) => Like.video);

    return res
      .status(200)
      .json(new ApiResponse(200, videos, "Liked videos fetched successfully"));
  } catch (error) {
    return res
      .status(error.status || 500)
      .json(new ApiResponse(error.status || 500, null, error.message));
  }
});

// TODO: "Toggle like on a tweet";

const toggleTweetLike = asyncHandler(async (req, res) => {
  try {
    const { tweetId } = req.params;
    const userId = req.user._id;

    const tweet = await Tweet.findById(tweetId);

    if (!tweet) {
      throw new ApiError(404, "Tweet not found");
    }
    const existingLike = await Like.findOne({ owner: userId, tweet: tweetId });

    if (existingLike) {
      await existingLike.remove();
      return res
        .status(200)
        .json(new ApiResponse(200, {}, "Tweet unlike successfully"));
    }

    const newLike = await Like.create({
      owner: userId,
      tweet: tweetId,
    });

    if (!newLike) {
      throw new ApiError(400, "Unable to like tweet");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, newLike, "Tweet liked successfully"));
  } catch (error) {
    return res
      .status(error.status || 500)
      .json(new ApiResponse(error.status || 500, null, error.message));
  }
});

// video like successfully tested ✅;

const toggleVideoLike = asyncHandler(async (req, res) => {
  try {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
      throw new ApiError(400, "Invalid videoId");
    }

    const existingLike = await Like.findOne({
      video: videoId,
      likedBy: req.user?._id,
    });

    if (existingLike) {
      await Like.findByIdAndDelete(existingLike?._id);

      return res
        .status(200)
        .json(new ApiResponse(200, "Video unlike successfully"));
    }

    await Like.create({
      video: videoId,
      likedBy: req.user?._id,
    });

    return res
      .status(200)
      .json(new ApiResponse(200, "Video liked successfully"));
  } catch (error) {
    return res
      .status(error.status || 500)
      .json(new ApiResponse(error.status || 500, null, error.message));
  }
});

// comment like successfully tested ✅;

const toggleCommentLike = asyncHandler(async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user?._id;

    if (!isValidObjectId(commentId)) {
      throw new ApiError(400, "Invalid comment ID");
    }

    const existingLike = await Like.findOne({
      comment: commentId,
      likedBy: userId,
    });

    if (existingLike) {
      await Like.findByIdAndDelete(existingLike?._id);

      return res
        .status(200)
        .json(new ApiResponse(200, "Comment unliked successfully"));
    }

    await Like.create({
      comment: commentId,
      likedBy: userId,
    });

    return res
      .status(200)
      .json(new ApiResponse(200, "liked comment successfully"));
  } catch (error) {
    return res
      .status(error.status || 500)
      .json(new ApiResponse(error.status || 500, null, error.message));
  }
});

export { getLikedVideos, toggleTweetLike, toggleCommentLike, toggleVideoLike };
