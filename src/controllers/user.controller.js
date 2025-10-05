import { asyncHandler } from "../utils/asyncHandler.js"; // Wrapper for handling async errors
import { ApiError } from "../utils/ApiError.js"; // Custom API error response handler
import { ApiResponse } from "../utils/ApiResponse.js"; // Standardized API response format
import { User } from "../models/user.model.js"; // User model for DB operations
import { uploadOnCloudinary } from "../utils/cloudinary.js"; // Utility for uploading files to Cloudinary
import {
  trimAndLower,
  capitalize,
  isEmailValid,
} from "../utils/helperFunction.js";

import jwt from "jsonwebtoken";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId); // Find user by ID
    const accessToken = user.generateAccessToken(); // Generate short-lived access token
    const refreshToken = user.generateRefreshToken(); // Generate long-lived refresh token

    user.refreshToken = refreshToken; // Save refresh token in user record
    user.save({ validateBeforeSave: false }); // Save without re-validating all fields

    return { accessToken, refreshToken }; // Return both tokens
  } catch (error) {
    throw new ApiError(
      500,
      "something went wrong while generating refresha and access token"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { username, email, fullname, password } = req.body;

  // Validate all required fields (none should be empty)
  if (
    [username, email, fullname, password].some((f) => !f || f.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  email = trimAndLower(email);
  username = trimAndLower(username);
  fullname = capitalize(fullname);

  if (!isEmailValid(email)) throw new ApiError(400, "Invalid email format");

  // Check if username or email already exists in DB
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User already exists");
  }

  // Extract file paths for avatar and optional cover image
  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

  // Avatar is mandatory for registration
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar image is required");
  }
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  if (!avatar) {
    throw new ApiError(400, "Failed to upload avatar image");
  }
  let coverImage = coverImageLocalPath
    ? await uploadOnCloudinary(coverImageLocalPath)
    : null;

  // Create new user record in DB
  const user = await User.create({
    fullname,
    password,
    avatar: {
      secureUrl: avatar.secure_url,
      publicId: avatar.public_id,
    },
    coverImage: coverImage
      ? { secureUrl: coverImage.secure_url, publicId: coverImage.public_id }
      : null,

    email,
    username,
  });

  // Retrieve created user without sensitive fields
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "User creation failed due to a server error");
  }

  console.log("User created successfully!", createdUser);

  // Send success response
  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User created successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;

  if (!password || (!email && !username)) {
    throw new ApiError(400, "Password and email or username are required");
  }

  const cleanEmail = email ? trimAndLower(email) : undefined;
  const cleanUsername = username ? trimAndLower(username) : undefined;

  //this if will only run if there is an email provided
  if (cleanEmail && !isEmailValid(cleanEmail)) {
    throw new ApiError(400, "Email format is not correct");
  }

  // Find user
  const user = await User.findOne({
    $or: [{ email: cleanEmail }, { username: cleanUsername }],
  });
  if (!user) throw new ApiError(404, "User not found");

  // Verify password
  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) throw new ApiError(401, "Invalid password");

  // Generate tokens
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  // Retrieve user without sensitive fields
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  // Cookie options
  const cookieOptions = {
    httpOnly: true,
    //secure: process.env.NODE_ENV === "production",
    secure: true,
    sameSite: "Strict",
    path: "/",
  };

  // Send response with cookies
  res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken, refreshToken },
        "User logged in successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  // Remove refresh token from DB
  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    { $set: { refreshToken: undefined } },
    { new: true }
  );
  if (!updatedUser) throw new ApiError(404, "User not found");

  // Cookie options
  const cookieOptions = {
    httpOnly: true,
    secure: true,
    //secure: process.env.NODE_ENV === "production",
    //During development (NODE_ENV !== "production"), cookies can be sent over HTTP, so you can test locally.
    sameSite: "Strict",
    path: "/", // matches where the cookie was originally set
  };

  // Clear cookies
  res
    .status(200)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const userRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
  if (!userRefreshToken) {
    throw new ApiError(401, "Refresh token not found");
  }

  try {
    //can't use await
    const decodedToken = jwt.verify(
      userRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    const userId = decodedToken._id;
    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, "User not found");

    if (user.refreshToken !== userRefreshToken) {
      throw new ApiError(401, "Invalid refresh token");
    }

    const { accessToken, refreshToken } =
      await generateAccessAndRefreshToken(userId);

    const cookieOptions = {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
    };

    res
      .status(200)
      .cookie("accessToken", accessToken, cookieOptions)
      .cookie("refreshToken", refreshToken, cookieOptions)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken },
          "Access token refreshed successfully!"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Error refreshing access token");
  }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  // Validate inputs
  if (!oldPassword || !newPassword) {
    throw new ApiError(400, "Both old and new passwords are required");
  }

  // Fetch user
  const user = await User.findById(req.user?._id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Verify old password
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
  if (!isPasswordCorrect) {
    throw new ApiError(401, "Invalid old password");
  }

  // Update password
  user.password = newPassword;
  await user.save({ validateBeforeSave: false }); // triggers hashing if handled in pre-save hook

  // Response
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully!"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "Current User fetched successfully!"));
});

const updateAccount = asyncHandler(async (req, res) => {
  // Good practice: separate file updates from data updates to save bandwidth & cost
  let { fullname, email } = req.body;

  // Sanitize inputs
  fullname = capitalize(fullname);
  email = trimAndLower(email);

  // Validation
  if ([fullname, email].some((field) => !field)) {
    throw new ApiError(400, "All fields are required");
  }

  // Update user info
  const updatedData = await User.findByIdAndUpdate(
    req.user?._id,
    { $set: { fullname, email } },
    { new: true }
  ).select("-password");

  if (!updatedData) {
    throw new ApiError(404, "User not found or update failed");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedData, "Account details updated successfully!")
    );
});

const updateAvatar = asyncHandler(async (req, res) => {
  // Fetch user
  const user = await User.findById(req.user?._id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Check and store old avatar publicId (for deletion later)
  const oldPublicId = user.avatar?.publicId;

  // Validate new avatar file
  const avatarLocalPath = req.file?.path;
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar image is required");
  }

  // Upload new avatar to Cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  if (!avatar) {
    throw new ApiError(500, "Error while uploading avatar to Cloudinary");
  }

  // Update user record in DB
  user.avatar = {
    secureUrl: avatar.secure_url,
    publicId: avatar.public_id,
  };
  await user.save({ validateBeforeSave: false });

  // Delete old avatar from Cloudinary (after successful save)
  if (oldPublicId) {
    await deleteFromCloudinary(oldPublicId, "Avatar");
  }

  // Send response
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        secureUrl: avatar.secure_url,
        publicId: avatar.public_id,
      },
      "Avatar updated successfully!"
    )
  );
});

const updateCoverImage = asyncHandler(async (req, res) => {
  // Fetch user
  const user = await User.findById(req.user?._id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Check and store old coverImage publicId (for deletion later)
  const oldPublicId = user.coverImage?.publicId;

  // Validate new coverImage file
  const coverImageLocalPath = req.file?.path;
  if (!coverImageLocalPath) {
    throw new ApiError(400, "coverImage image is required");
  }

  // Upload new coverImage to Cloudinary
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  if (!coverImage) {
    throw new ApiError(500, "Error while uploading Cover Image to Cloudinary");
  }

  // Update user record in DB
  user.coverImage = {
    secureUrl: coverImage.secure_url,
    publicId: coverImage.public_id,
  };
  await user.save({ validateBeforeSave: false });

  // Delete old Cover Image from Cloudinary (after successful save)
  if (oldPublicId) {
    await deleteFromCloudinary(oldPublicId, "Cover Image");
  }

  // Send response
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        secureUrl: coverImage.secure_url,
        publicId: coverImage.public_id,
      },
      "Cover Image updated successfully!"
    )
  );
});
export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccount,
  updateAvatar,
  updateCoverImage,
};
