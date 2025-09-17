import { asyncHandler } from "../utils/asyncHandler.js";

const registerUser = asyncHandler(async (req, res) => {
  res.status(200).json({
    message: "User Registered Successfully",
  });
});

const loginUser = asyncHandler(async (req, res) => {
  res.status(200).json({
    message: "User Logged in Successfully",
  });
});

export { registerUser, loginUser };
