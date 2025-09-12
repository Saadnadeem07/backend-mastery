import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

//Defines the MongoDB document structure for application users and
//attaches authentication-related helpers such as password hashing
//and JWT token generation.

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true, // Indexed for faster search/look-ups by username.
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    fullname: {
      type: String,
      required: true,
      trim: true,
      index: true, // Frequently queried field—index improves query speed.
    },

    avatar: {
      type: String, // Public URL of the user’s avatar (e.g. Cloudinary, S3).
      required: true,
    },

    coverImage: {
      type: String, // Optional profile cover image URL.
    },

    watchHistory: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video", // References the Video model to track what the user has watched.
      },
    ],

    password: {
      type: String,
      required: [true, "Password is required"],
    },

    refreshToken: {
      type: String, // Stores the latest refresh token for long-lived sessions.
    },
  },
  {
    timestamps: true, // Automatically maintains createdAt and updatedAt fields.
  }
);

//Pre-save middleware
//-------------------
//Runs automatically before each document save.
//Purpose: hash the password only when it is new or has been modified.
//Note: use a standard function (not an arrow) to access the correct `this`.

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return; // Skip if password wasn’t changed.

  this.password = bcrypt.hash(this.password, 10); // Hash with salt rounds = 10.
  next();
});

// Compare a candidate password with the hashed password in the database.
// Returns true if the credentials match.

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

//Generate a short-lived JWT access token.
//Payload includes key user details for quick authorization.

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      fullname: this.fullname,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiry: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

// Generate a long-lived JWT refresh token.
// Payload is minimal—only the user ID—to safely refresh access tokens.

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiry: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

// Compile and export the model for use in controllers, services, etc.
export const User = mongoose.model("User", userSchema);
