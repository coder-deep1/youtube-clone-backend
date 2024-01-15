import mongoose from "mongoose";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiErrors.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { User } from "../models/user.model.js";

// Get channel states successfully ✅;

const getChannelStates = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;

    const totalVideosAndViews = await Video.aggregate([
      {
        $match: {
          owner: new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $group: {
          _id: "$owner",
          totalViews: {
            $sum: "$views",
          },
          totalVideos: {
            $sum: 1,
          },
        },
      },
    ]);

    const totalSubscribers = await Subscription.aggregate([
      {
        $match: {
          channel: new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $group: {
          _id: "$channel",
          totalSubscribers: {
            $sum: 1,
          },
        },
      },
    ]);

    const channelStats = {
      totalVideosAndViews,
      totalSubscribers,
    };

    if (totalVideosAndViews.length === 0) {
      return res
        .status(200)
        .json(new ApiResponse(200, {}, "No content on this channel"));
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, channelStats, "Channel stats fetched successfully")
      );
  } catch (error) {
    return res
      .status(error.status || 500)
      .json(new ApiResponse(error.status || 500, null, error.message));
  }
});

// TODO: Get all the videos uploaded by the channel

const getChannelVideos = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;

    const channelVideos = await Video.aggregate([
      {
        $match: {
          owner: mongoose.Types.ObjectId(userId),
        },
      },
    ]);

    if (channelVideos.length === 0) {
      return res
        .status(200)
        .json(new ApiResponse(200, {}, "User not uploaded any videos"));
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          channelVideos,
          "Channel videos fetched successfully"
        )
      );
  } catch (error) {
    return res
      .status(error.status || 500)
      .json(new ApiResponse(error.status || 500, null, error.message));
  }
});

export { getChannelStates, getChannelVideos };
