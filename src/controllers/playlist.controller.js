import mongoose, { isValidObjectId } from "mongoose";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiErrors.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Playlist } from "../models/playlist.model.js";
import { Video } from "../models/video.model.js";

// create playlist testing Successfully ✅
const createPlaylist = asyncHandler(async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !description) {
      throw new ApiError(400, "Name and description are required");
    }
    const playlist = await Playlist.create({
      name,
      description,
      owner: req.user?._id,
    });

    if (!playlist) {
      throw new ApiError(500, "failed to create playlist");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, playlist, "Playlist created Successfully"));
  } catch (error) {
    return res
      .status(error.status || 500)
      .json(new ApiResponse(error.status || 500, null, error.message));
  }
});

// get user playlist testing successfully ✅
const getUserPlaylist = asyncHandler(async (req, res) => {
  try {
    const { userId } = req.params;

    if (!isValidObjectId(userId)) {
      throw new ApiError(400, "Invalid User");
    }

    const userPlaylists = await Playlist.find({ owner: userId });

    if (!userPlaylists || userPlaylists?.length === 0) {
      return res
        .status(200)
        .json(new ApiResponse(200, {}, "user has no playlist"));
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          userPlaylists,
          "User playlists fetched successfully"
        )
      );
  } catch (error) {
    return res
      .status(error.status || 500)
      .json(new ApiResponse(error.status || 500, null, error.message));
  }
});

// get  playlist testing successfully✅
const getPlaylistById = asyncHandler(async (req, res) => {
  try {
    const { playlistId } = req.params;
    if (!isValidObjectId(playlistId)) {
      throw new ApiError(400, "Invalid Playlist ID");
    }

    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
      throw new ApiError(400, "Playlist not found");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, playlist, "Playlist Fetched Successfully"));
  } catch (error) {
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          userPlaylists,
          "user playlists fetched successfully"
        )
      );
  }
});

// add video playlist testing  successfully✅
const addVideoToPlaylist = asyncHandler(async (req, res) => {
  try {
    const { playlistId, videoId } = req.params;

    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
      throw new ApiError(400, "Invalid PlaylistId or videoId");
    }

    const playlist = await Playlist.findById(playlistId);
    const video = await Video.findById(videoId);

    if (!playlist) {
      throw new ApiError(404, "Playlist not found");
    }
    if (!video) {
      throw new ApiError(404, "video not found");
    }

    if (
      (playlist.owner?.toString() && video.owner.toString()) !==
      req.user?._id.toString()
    ) {
      throw new ApiError(400, "only owner can add video to thier playlist");
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
      playlist?._id,
      {
        $addToSet: {
          videos: videoId,
        },
      },
      { new: true }
    );

    if (!updatedPlaylist) {
      throw new ApiError(
        400,
        "failed to add video to playlist please try again"
      );
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          updatedPlaylist,
          "Added video to playlist successfully"
        )
      );
  } catch (error) {
    return res
      .status(error.status || 500)
      .json(new ApiResponse(error.status || 500, null, error.message));
  }
});

// removed video in playlist testing successfully ✅
const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  try {
    const { playlistId, videoId } = req.params;

    if (!isValidObjectId(playlistId || !isValidObjectId(videoId))) {
      throw new ApiError(400, "Invalid ID's");
    }

    const playlist = await Playlist.findById(playlistId);
    const video = await Video.findById(videoId);

    if (!playlist) {
      throw new ApiError(404, "Playlist not found ");
    }

    if (!video) {
      throw new ApiError(404, "Video not found");
    }

    if (
      (playlist.owner?.toString() && video.owner.toString()) !==
      req.user?._id.toString()
    ) {
      throw new ApiError(404, "only owner can remove video from  playlist");
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
      playlistId,
      {
        $pull: {
          videos: videoId,
        },
      },
      { new: true }
    );

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          updatedPlaylist,
          "Video Removed in playlist Successfully"
        )
      );
  } catch (error) {
    return res
      .status(error.status || 500)
      .json(new ApiResponse(error.status || 500, null, error.message));
  }
});

// delete playlist testing successfully ✅
const deletePlaylist = asyncHandler(async (req, res) => {
  try {
    const { playlistId } = req.params;

    if (!isValidObjectId(playlistId)) {
      throw new ApiError(404, "Playlist Id not Matched ");
    }

    const playlist = await Playlist.findByIdAndDelete(playlistId);

    if (!playlist) {
      throw new ApiError(404, "Playlist Not Found");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Playlist Deleted Successfully"));
  } catch (error) {
    return res
      .status(error.status || 500)
      .json(new ApiResponse(error.status || 500, null, error.message));
  }
});

// update playlist testing successfully ✅
const updatePlaylist = asyncHandler(async (req, res) => {
  try {
    const { name, description } = req.body;
    const { playlistId } = req.params;

    if (!name || !description) {
      throw new ApiError(400, "name and description both are required");
    }

    if (!isValidObjectId(playlistId)) {
      throw new ApiError(400, "Invalid PlaylistId");
    }

    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
      throw new ApiError(404, "Playlist not found");
    }

    if (playlist.owner.toString() !== req.user?._id.toString()) {
      throw new ApiError(400, "only owner can edit the playlist");
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
      playlist?._id,
      {
        $set: {
          name,
          description,
        },
      },
      { new: true }
    );

    return res
      .status(200)
      .json(
        new ApiResponse(200, updatedPlaylist, "playlist updated successfully")
      );
  } catch (error) {
    return res
      .status(error.status || 500)
      .json(new ApiResponse(error.status || 500, null, error.message));
  }
});

export {
  createPlaylist,
  getUserPlaylist,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
