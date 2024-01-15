import mongoose, { isValidObjectId } from "mongoose";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiErrors.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Subscription } from "../models/subscription.model.js";
import { User } from "../models/user.model.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  try {
    const { channelId } = req.params;

    if (!isValidObjectId(channelId)) {
      throw new ApiError(400, "Invalid channel id");
    }

    const isSubscribed = await Subscription.findOne({
      channelId,
      subscriber: req.user?._id,
    });

    if (isSubscribed) {
      await Subscription.findByIdAndDelete(isSubscribed?._id);
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            { subscribed: false },
            "unsubscribed successfully"
          )
        );
    }

    await Subscription.create({
      channel: channelId,
      subscriber: req.user?._id,
    });

    return res
      .status(200)
      .json(
        new ApiResponse(200, { subscribed: true }, "subscribed successfully")
      );
  } catch (error) {
    return res
      .status(error.status || 500)
      .json(new ApiResponse(error.status || 500, null, error.message));
  }
});

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  let { channelId } = req.params;

  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid channelId");
  }

  channelId = new mongoose.Types.ObjectId(channelId);

  const subscribers = await Subscription.aggregate([
    {
      $match: {
        channel: channelId,
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "subscriber",
        foreignField: "_id",
        as: "subscriber",
        pipeline: [
          {
            $lookup: {
              from: "subscriptions",
              localField: "_id",
              foreignField: "channel",
              as: "subscribedToSubscriber",
            },
          },
          {
            $addFields: {
              subscribedToSubscriber: {
                $cond: {
                  if: {
                    $in: [channelId, "$subscribedToSubscriber.subscriber"],
                  },
                  then: true,
                  else: false,
                },
              },
              subscribersCount: {
                $size: "$subscribedToSubscriber",
              },
            },
          },
        ],
      },
    },
    {
      $unwind: "$subscriber",
    },
    {
      $project: {
        _id: 0,
        subscriber: {
          _id: 1,
          username: 1,
          fullName: 1,
          "avatar.url": 1,
          subscribedToSubscriber: 1,
          subscribersCount: 1,
        },
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(200, subscribers, "subscribers fetched successfully")
    );
});

const getSubscribedChannels = asyncHandler(async (req, res) => {
  try {
    const { subscriberId } = req.params;

    const subscribedChannels = await Subscription.aggregate([
      {
        $match: {
          subscriber: new mongoose.Types.ObjectId(subscriberId),
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "channel",
          foreignField: "_id",
          as: "subscribedChannel",
          pipeline: [
            {
              $lookup: {
                from: "videos",
                localField: "_id",
                foreignField: "owner",
                as: "videos",
              },
            },
            {
              $addFields: {
                latestVideo: {
                  $last: "$videos",
                },
              },
            },
          ],
        },
      },
      {
        $unwind: "$subscribedChannel",
      },
      {
        $project: {
          _id: 0,
          subscribedChannel: {
            _id: 1,
            username: 1,
            fullName: 1,
            "avatar.url": 1,
            latestVideo: {
              _id: 1,
              "videoFile.url": 1,
              "thumbnail.url": 1,
              owner: 1,
              title: 1,
              description: 1,
              duration: 1,
              createdAt: 1,
            },
          },
        },
      },
    ]);

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          subscribedChannels,
          "subscribed channels fetched successfully"
        )
      );
  } catch (error) {
    return res
      .status(error.status || 500)
      .json(new ApiResponse(error.status || 500, null, error.message));
  }
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
