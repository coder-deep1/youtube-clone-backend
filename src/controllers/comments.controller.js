import mongoose, { isValidObjectId } from "mongoose";
import { Comment } from "../models/comments.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiErrors.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";

// add a comment to a video ✅;

const addComment = asyncHandler(async (req, res) => {
  try {
    const { videoId } = req.params;
    const { content } = req.body;
    const userId = req.user._id;

    if (!videoId || !content) {
      throw new ApiError(400, "Video ID and comment content are required");
    }

    if (!isValidObjectId(videoId) || !isValidObjectId(userId)) {
      throw new ApiError(400, "Invalid object ID");
    }

    const video = await Video.findById(videoId);

    if (!video) {
      throw new ApiError(404, "Video not found");
    }

    const comment = await Comment.create({
      content,
      video: videoId,
      owner: userId,
    });

    if (!comment) {
      throw new ApiError(400, "Unable to add comment");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, comment, "Comment added successfully"));
  } catch (error) {
    return res
      .status(error.status || 500)
      .json(new ApiResponse(error.status || 500, null, error.message));
  }
});

// Comment update Successfully ✅;

const updateComment = asyncHandler(async (req, res) => {
  try {
    const { commentId } = req.params;
    const { updatedContent } = req.body;

    if (!isValidObjectId(commentId)) {
      throw new ApiError(400, "Invalid comment ID");
    }

    const comment = await Comment.findById(commentId);

    if (!comment) {
      throw new ApiError(404, "Comment not found");
    }

    comment.content = updatedContent;

    await comment.save();

    return res
      .status(200)
      .json(new ApiResponse(200, comment, "Comment updated successfully"));
  } catch (error) {
    return res
      .status(error.status || 500)
      .json(new ApiResponse(error.status || 500, null, error.message));
  }
});

// Comment delete Successfully ✅;

const deleteComment = asyncHandler(async (req, res) => {
  try {
    const { commentId } = req.params;

    if (!isValidObjectId(commentId)) {
      throw new ApiError(400, "Invalid comment ID");
    }

    const deletedComment = await Comment.findByIdAndDelete(commentId);

    if (!deletedComment) {
      throw new ApiError(404, "Comment not found");
    }
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Comment deleted successfully"));
  } catch (error) {
    return res
      .status(error.status || 500)
      .json(new ApiResponse(error.status || 500, null, error.message));
  }
});

// Get all comments find Successfully ✅;

const getVideoComments = asyncHandler(async (req, res) => {
  try {
    const { videoId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const parsedLimit = parseInt(limit);
    const pageSkip = (page - 1) * parsedLimit;

    const allComments = await Comment.aggregate([
      {
        $match: {
          video: videoId,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "owner",
          foreignField: "_id",
          as: "owner",
          pipeline: [
            {
              $project: {
                userName: 1,
                avatar: 1,
              },
            },
          ],
        },
      },
      {
        $skip: pageSkip,
      },
      {
        $limit: parsedLimit,
      },
    ]);

    if (!allComments) {
      throw new ApiError(504, "Comments not found");
    }

    res
      .status(200)
      .json(
        new ApiResponse(200, allComments, "Comments retrieved successfully")
      );
  } catch (error) {
    res
      .status(error.status || 500)
      .json(new ApiResponse(error.status || 500, null, error.message));
  }
});

export { getVideoComments, addComment, updateComment, deleteComment };
