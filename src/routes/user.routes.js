import express from "express";
import { registerUser, loginUser } from "../controllers/user.controller.js";

const router = express.Router();

router.route("/register").post(registerUser);
router.route("/login").get(loginUser);

export default router;
