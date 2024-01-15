import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

//TODO: build a healthCheck response that simply returns the OK status as json with a message

const healthCheck = asyncHandler(async (req, res) => {
  const healthCheckResponse = {
    status: "OK",
    message: "Health check passed successfully",
  };
  return res.status(200).json(new ApiResponse(20, healthCheckResponse));
});

export { healthCheck };
