import { asyncHandler } from "../utils/asyncHandler.js"; // Wrapper for handling async errors
import { ApiError } from "../utils/ApiError.js"; // Custom API error response handler
import { ApiResponse } from "../utils/ApiResponse.js"; // Standardized API response format
import { User } from "../models/user.model.js"; // User model for DB operations
import { uploadOnCloudinary } from "../utils/cloudinary.js"; // Utility for uploading files to Cloudinary
import jwt from "jsonwebtoken";
// Utility function: Generate access and refresh tokens for a user
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

// Controller: Register a new user
const registerUser = asyncHandler(async (req, res) => {
  // Extract user details from request body
  const { username, email, fullname, password } = req.body;
  console.log("Incoming request body:", req.body);

  // Validate all required fields (none should be empty)
  if (
    [username, email, fullname, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

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

  console.log("avatarLocalPath:", avatarLocalPath);
  console.log("coverImageLocalPath:", coverImageLocalPath);

  // Avatar is mandatory for registration
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar image is required");
  }

  // Upload avatar and cover image to Cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Failed to upload avatar image");
  }

  // Create new user record in DB
  const user = await User.create({
    fullname: fullname.toLowerCase(),
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
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
    .json(new ApiResponse(200, createdUser, "User created successfully"));
});

// Controller: Login an existing user
const loginUser = asyncHandler(async (req, res) => {
  try {
    const { email, username, password } = req.body;
    // Validate that either email or username is provided
    if (!(email || username)) {
      throw new ApiError(400, "Email or username is required");
    }

    // Find user by email or username
    const user = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (!user) {
      throw new ApiResponse(404, "User not Found");
    }

    // Verify password correctness
    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
      throw new ApiResponse(401, "Invalid Password! ");
    }

    // Generate access and refresh tokens
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
      user._id
    );

    // Retrieve user without sensitive fields
    const loggedInUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );

    // Cookie options for secure storage
    const options = {
      httpOnly: true,
      secure: true,
    };

    // Send tokens + user data in response
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          {
            user: loggedInUser,
            accessToken,
            refreshToken,
          },
          "User logged in Successfully"
        )
      );
  } catch (error) {
    console.error(error, error.message);
  }
});

// Controller: Logout a user
const logoutUser = asyncHandler(async (req, res) => {
  try {
    //console.log("req.body n logout", req);
    // Remove refresh token from DB
    await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          refreshToken: undefined,
        },
      },
      {
        new: true,
      }
    );

    // Cookie options
    const options = {
      httpOnly: true,
      secure: true,
    };

    // Clear cookies and send response
    res
      .status(200)
      .clearCookie("accessToken", options)
      .clearCookie("refreshToken", options)
      .json(
        new ApiResponse({
          status: 200,
          data: {},
          message: "User logged out successfully",
        })
      );
  } catch (error) {
    console.error(error);
  }
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  try {
    const userRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!userRefreshToken) {
      throw new ApiError(401, "Invalid Request Your Refresh Token not found");
    }

    //we can get the userID from the decoded data - then from the decoded one whole uswer form DB
    const decodedToken = await jwt.verify(
      userRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    if (!decodedToken) {
      throw new ApiError("404", "Decoded Token Not found");
    }

    let userId = decodedToken?._id;
    let user = await User.findById(userId);

    if (user.refreshToken !== userRefreshToken) {
      console.log("Invalid Refresh Token");
    }

    const { accessToken, refreshToken } =
      await generateAccessAndRefreshToken(userId);

    const options = {
      httpOnly: true,
      secure: true,
    };
    res
      .status(200)
      .cookie("accessToken", accessToken)
      .cookie("refreshToken", refreshToken)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken },
          "Access token refreshed successfully!"
        )
      );

    //  .json({
    //   status: 200,
    //   accessToken,
    //   refreshToken,
    //   message: "Access token refreshed successfully!",
    // });
  } catch (error) {
    throw new ApiError(
      401,
      error?.message || "An error occured during refreshign Access Token"
    );
  }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user = User.findById(req.user?._id);
  const isPasswordCorrect = user.isPasswordCorrect(oldPassword);
  if (!isPasswordCorrect) {
    throw new ApiError(401, "Invalid Old Password!");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res.status(200).json(
    new ApiResponse({
      status: 200,
      message: "Password Changed Successfully!",
    })
  );
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "Current User fetched successfully!"));
});

const updateAccount = asyncHandler(async (req, res) => {
  //professional advice: if you are updating any file data make sure to keep that seprate otherwise costs high

  //obv we will   decide this
  const { fullname, email } = req.body;
  //if somethign is missing
  if (!fullname || !email) {
    throw new ApiError(400, "All fields are required");
  }

  const updatedData = User.findById(
    req.user?._id,
    {
      $set: {
        fullname,
        email,
      },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedData, "Account details updated successfully!")
    );
});

const updateAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;
  if (!avatarLocalPath) {
    throw new ApiError(401, "Avatar not found");
  }

  const avatar = uploadOnCloudinary(avatarLocalPath);

  if (!avatar.url) {
    throw new ApiError(401, "Error while uplaoding avatar on cloudinary");
  }

  const updatedFields = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    { new: true }
  ).select("-password");

  return res.status(200).json(
    new ApiResponse({
      status: 200,
      updatedFields,
      message: "Avatar Updated Successfully!",
    })
  );
});

const updateCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.file?.path;
  if (!coverImageLocalPath) {
    throw new ApiError(401, "Cover Image not found");
  }
  const coverImage = uploadOnCloudinary(coverImageLocalPath);
  if (!coverImage) {
    throw new ApiError(401, "Error while uplaoding Cover Image on cloudinary");
  }

  const updatedData = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        coverImage: coverImage.url,
      },
    },
    { new: true }
  ).select("-password");

  return res.status(200).json(
    new ApiResponse({
      status: 200,
      updatedData,
      message: "Cover Image Updated Successfully!",
    })
  );
});
// Export controllers
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
