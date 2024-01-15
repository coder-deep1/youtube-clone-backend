import mongoose from "mongoose";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiErrors.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Tweet } from "../models/tweets.model.js";
import { User } from "../models/user.model.js";

// Create tweet method here

const createTweet = asyncHandler(async (req, res) => {
  const { content } = req.body;

  if (!content) {
    throw new ApiError(400, " Tweet content is required ");
  }

  const tweet = await Tweet.create({
    content,
    owner: req.user?._id,
  });

  if (!tweet) {
    throw new ApiError(400, " Tweet is not created ");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, tweet, " Tweet created successfully "));
});

// Get user tweets method here

const getUserTweets = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!isValidObjectId(userId)) {
    throw new ApiError(400, " Invalid user id ");
  }

  const tweets = await Tweet.aggregate([
    // TODO: add match stage to filter tweets by userId
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, tweets, " User tweets retrieved successfully "));
});

//  Update tweet method here

const updateTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const { content } = req.body;

  if (!content) {
    throw new ApiError(400, " Tweet content is required ");
  }

  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, " Invalid tweet id ");
  }

  const tweet = await Tweet.findById(tweetId);

  if (!tweet) {
    throw new ApiError(404, "Tweet not found");
  }

  if (tweet?.owner.toString() !== req.user?._id.toString()) {
    throw new ApiError(400, "only owner can edit  tweet");
  }

  const newTweet = await Tweet.findByIdAndUpdate(
    tweetId,
    {
      $set: {
        content,
      },
    },
    {
      new: true,
    }
  );

  if (!newTweet) {
    throw new ApiError(400, "Tweet not updated");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, newTweet, " Tweet updated successfully "));
});

// Delete tweet method here

const deleteTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, " Invalid tweet id ");
  }
  const tweet = await Tweet.findById(tweetId);

  if (!tweet) {
    throw new ApiError(404, "Tweet not found");
  }

  if (tweet?.owner.toString() !== req.user?._id.toString()) {
    throw new ApiError(400, "only owner can delete  tweet");
  }

  await Tweet.findByIdAndDelete(tweetId);

  return res
    .status(200)
    .json(new ApiResponse(204, {}, " Tweet deleted successfully"));
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
