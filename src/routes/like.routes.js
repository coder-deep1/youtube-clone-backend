import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  getLikedVideos,
  toggleTweetLike,
  toggleCommentLike,
  toggleVideoLike,
} from "../controllers/likes.controller.js";

const router = Router();
router.use(verifyJWT);

router.route("/videos").get(getLikedVideos);
router.route("toggle/t/:tweetId").post(toggleTweetLike);
router.route("toggle/c/:commentId").post(toggleCommentLike);
router.route("toggle/v/:videoId").post(toggleVideoLike);

export default router;
