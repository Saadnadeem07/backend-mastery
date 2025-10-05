# 🌐 Mastering Backend Development with Chai aur JavaScript 

## Overview

This project is a comprehensive **Node.js + Express.js backend** that demonstrates best practices for building scalable and production-ready server-side applications.

We cover a wide range of modern backend concepts, including:

- **JWT Authentication** with both **Access Token** and **Refresh Token** flows.
- **File Uploads** using **Multer** and **Cloudinary** for seamless media management.
- **MongoDB** integration with Mongoose for database operations.
- **Structured Controllers & Routes** for a clean MVC-style architecture.
- **Centralized API Responses & Error Handling** with custom `ApiResponse` and `ApiError` utilities.
- **Async/Await Handling** with a custom `asyncHandler` utility.
- Secure **HTTP** fundamentals and best practices.
- Proper directory structure for scalability and maintainability.

## ✨ Key Features

- JWT Access & Refresh Token Authentication
- File uploads with Multer and Cloudinary
- MongoDB with Mongoose ODM
- Centralized API response and error handling utilities
- Async error handling via `asyncHandler`
- Organized code with controllers, routes, and utilities

## 📂 Directory Structure

```
saadnadeem07-backend-mastery/
├── README.md
├── package.json
├── .env.sample
├── .prettierignore
├── .prettierrc
├── docs/
│   ├── appJsComments.md
│   ├── Backend-Roadmap-Guide.md
│   ├── Custom Errors & Standard API Responses.md
│   ├── File Upload Flow Multer & Cloudinary.md
│   ├── Frontend-Backend Connection Guide.md
│   ├── HTTP – Complete Beginner Guide.md
│   ├── JWT Bcrypt Aggregation Pipeline Guide.md
│   ├── MongoDB Connection.md
│   └── Production Static File vs React Dynamic Behaviour.md
├── public/
│   └── temp/
│       └── .gitkeep
└── src/
    ├── app.js
    ├── constants.js
    ├── index.js
    ├── controllers/
    │   └── user.controller.js
    ├── db/
    │   └── index.js
    ├── middlewares/
    │   └── multer.middleware.js
    ├── models/
    │   ├── user.model.js
    │   └── video.model.js
    ├── routes/
    │   └── user.routes.js
    └── utils/
        ├── ApiError.js
        ├── ApiResponse.js
        ├── asyncHandler.js
        └── cloudinary.js
```

## 🚀 Getting Started

1. **Clone the repository**

   ```bash
   git clone https://github.com/saadnadeem07/saadnadeem07-backend-mastery.git
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set environment variables**
   - Copy `.env.sample` to `.env` and update values.

4. **Run the development server**
   ```bash
   npm run dev
   ```

## 🛠️ Tech Stack

- **Node.js**, **Express.js**
- **MongoDB**, **Mongoose**
- **JWT**, **Bcrypt**
- **Multer**, **Cloudinary**
- **Prettier** for code formatting

## 🧩 Utilities

The `src/utils` directory includes:

- **ApiError.js** – Custom error class for standardized error responses.
- **ApiResponse.js** – Unified API response format.
- **asyncHandler.js** – Wrapper to handle async/await errors cleanly.
- **cloudinary.js** – Cloudinary configuration and helper functions.

---

## 📚 Documentation & 🔗 Learning Resources

- Full step-by-step guide, API reference, and schema diagrams are available inside the **/docs** directory.

- **Visual Schema Overview:** [Model Link](https://app.eraser.io/workspace/YtPqZ1VogxGy1jzIDkzj)  
  _Explore the complete database design in one place. This interactive diagram shows every table, relationship, and key—perfect for quickly understanding the entire backend structure._

- **Playlist:** [Chai aur JavaScript Backend](https://www.youtube.com/playlist?list=PLu71SKxNbfoBGh_8p_NS-ZAh6v7HhYqHW)  
  _Watch this high-quality tutorial series that teaches production-grade backend development with Node.js and Express. Each module is explained in depth so you can master the concepts and build professional-level applications._

- _Note:_ The playlist doesn’t cover absolutely everything. Instead, it dives deep into each core module or feature and encourages you to explore and implement additional functionality on your own. The guidance is so clear and thorough that you’ll gain an **insane level of knowledge** and the ability to write truly **production-grade code**.

---

## 🧑‍💻 Contributing

Pull requests are welcome!  
Please read the contributing guidelines in the **/docs** folder before submitting any changes.

---

## **Level Up Your Backend Skills**

Explore the codebase, tweak the pipelines, and extend the feature set.  
This project is a solid foundation for building production-ready Node.js and MongoDB applications.
