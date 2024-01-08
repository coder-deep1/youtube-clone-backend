import mongoose from "mongoose";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiErrors.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Tweet } from "../models/tweets.model.js";
import { User } from "../models/user.model.js";

// Create tweet method here

const createTweet = asyncHandler(async (req, res) => {
  const user = await User.findById({
    _id: req.user?._id,
  });

  if (!user) {
    throw new ApiError(
      404,
      " User not found. Please ensure the provided user ID is correct "
    );
  }

  const tweet = await Tweet.create({
    content: req.body.content,
    owner: user._id,
  });

  if (!tweet) {
    throw new ApiError(500, " Tweet could not be created ");
  }

  return res.status(201).json({
    tweet,
    message: " Tweet created successfully ",
  });
});

// Get user tweets method here

const getUserTweets = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const user = await User.findById({
    _id: userId,
  });

  if (!user) {
    throw new ApiError(404, " User not found ");
  }

  const tweets = await Tweet.find({
    owner: user?._id,
  });

  if (tweets.length === 0) {
    throw new ApiError(404, " User has no tweets ");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, { tweets }, " User tweets retrieved successfully ")
    );
});

//  Update tweet method here

const updateTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  const tweet = await Tweet.findOne({
    _id: tweetId,
  });

  if (!tweet) {
    throw new ApiError(404, " Tweet not found to update ");
  }

  const updatedTweet = await Tweet.findByIdAndUpdate(
    tweet._id,
    {
      content: req.body.content,
    },
    {
      new: true,
    }
  );

  if (!updatedTweet) {
    throw new ApiError(404, "Tweet is not updated ");
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        updatedTweet,
      },
      " Tweet updated successfully "
    )
  );
});

// Delete tweet method here

const deleteTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  const deletedTweet = await Tweet.findByIdAndDelete({
    _id: tweetId,
  });

  if (!deletedTweet) {
    throw new ApiError(404, " Tweet not found to delete ");
  }

  return res
    .status(200)
    .json(new ApiResponse(204, {}, " Tweet deleted successfully"));
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
