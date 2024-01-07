import mongoose from "mongoose";
import { Comment } from "../models/comments.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiErrors.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getVideoComments = asyncHandler(async (req, res) => {
  // TODO: "Get all comments for a video";
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;
});

const addComment = asyncHandler(async (req, res) => {
  // TODO: "Add a comment to a video";
});

const updateComment = asyncHandler(async (req, res) => {
  // TODO: "Update a comment";
});

const deleteComment = asyncHandler(async (req, res) => {
  // TODO: "Delete a comment";
});

export { getVideoComments, addComment, updateComment, deleteComment };
