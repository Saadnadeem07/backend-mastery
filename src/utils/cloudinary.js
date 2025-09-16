//file ay gi fs ky through
//mtlb abhi smjho server pr upoad hogai hy
//local file ka path dy ga //means on server

import { v2 as cloudinary } from "cloudinary";
import fs from "fs"; //node fs

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
