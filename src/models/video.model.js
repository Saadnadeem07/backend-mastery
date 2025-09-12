import mongoose from "mongoose";
// Aggregation pipelines unlock MongoDB’s powerful data processing features,
// and this plugin adds easy, built-in pagination for those pipelines.
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

//Video Model
//-----------
//Represents a single uploaded video along with its metadata.
//Supports aggregation-based queries with built-in pagination.

const videoSchema = new mongoose.Schema(
  {
    videoFile: {
      type: String, // URL or path to the actual video file.
      required: true,
    },

    thumbnail: {
      type: String, // URL to the thumbnail image.
      required: true,
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to the User who uploaded the video.
    },

    title: {
      type: String,
      required: true, // Display title of the video.
    },

    description: {
      type: String,
      required: true, // Text description or summary.
    },

    duration: {
      type: Number, // Length of the video in seconds (e.g., from Cloudinary metadata).
      required: true,
    },

    views: {
      type: Number,
      default: 0, // View counter; increments as users watch.
    },

    isPublished: {
      type: Boolean,
      default: true, // Controls public visibility of the video.
      // Set to false to keep the video private or in draft mode.
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields.
  }
);

//Plugin: mongoose-aggregate-paginate-v2
//--------------------------------------
//Attaches an `aggregatePaginate` method to the model, enabling
//simple pagination of complex aggregation pipelines—for example,
//when filtering, sorting, or joining data across collections.

videoSchema.plugin(mongooseAggregatePaginate);

// Compile and export the model so it can be used in controllers and services.
export const Video = mongoose.model("Video", videoSchema);
