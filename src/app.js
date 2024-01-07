import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

//  Import Routes Methods
import userRoutes from "./routes/user.routes.js";
import likeRoutes from "./routes/like.routes.js";
import videoRoutes from "./routes/video.routes.js";
import tweetsRoutes from "./routes/tweets.routes.js";
import commentRoutes from "./routes/comment.routes.js";
import playlistRoutes from "./routes/playlist.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import healthCheckRoutes from "./routes/healthCheck.routes.js";
import subscriptionRoutes from "./routes/subscription.routes.js";

// routes declaration
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/likes", likeRoutes);
app.use("/api/v1/videos", videoRoutes);
app.use("/api/v1/tweets", tweetsRoutes);
app.use("/api/v1/comment", commentRoutes);
app.use("/api/v1/playlist", playlistRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);
app.use("/api/v1/healthCheck", healthCheckRoutes);
app.use("/api/v1/subscription", subscriptionRoutes);

// url type => https://localhost:5000/api/v1/users/register

export { app };
