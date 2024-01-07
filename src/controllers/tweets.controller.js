import mongoose from "mongoose";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiErrors.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Tweet } from "../models/tweets.model.js";

const createTweet = asyncHandler(async (req, res) => {
  // TODO: Create tweet
});

const getUserTweets = asyncHandler(async (req, res) => {
  // TODO: Get user tweets
});

const updateTweet = asyncHandler(async (req, res) => {
  // TODO: Update tweet
});

const deleteTweet = asyncHandler(async (req, res) => {
  // TODO: Delete tweet
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
