import { User } from "../models/user.model.js"; // Import User model from database models
import { ApiError } from "../utils/ApiError.js"; // Import custom error handler class
import { asyncHandler } from "../utils/asyncHandler.js"; // Import async handler wrapper for routes
import jwt from "jsonwebtoken"; // Import JWT library for token verification

// Middleware: Verify JSON Web Token (JWT) before allowing user to access protected routes
export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    // Try to get token either from cookies or Authorization header
    const token =
      req.cookies?.accessToken || // Token from cookies
      req.header("Authorization")?.replace("bearer ", ""); // Token from "Authorization" header (Bearer token)

    // If no token found, throw "Unauthorized" error
    if (!token) {
      throw new ApiError(401, "unauthorized req");
    }

    // Verify the token using secret key stored in environment variables
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // Fetch user from database using the ID stored in decoded token
    // Exclude sensitive fields (password, refreshToken) from the result
    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );

    // If no user found with this token, throw error
    if (!user) {
      throw new ApiError(401, "Invalud Access Token ");
    }

    // Attach user object to request for downstream access in controllers
    req.user = user;
    // Proceed to next middleware or controller
    next();
  } catch (error) {
    // Catch any error (invalid token, expired token, DB issue etc.)
    throw new ApiError(404, error?.message || "invalid accesstoken");
  }
});
