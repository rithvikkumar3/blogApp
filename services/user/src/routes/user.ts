import express from "express";
import { getUserProfile, loginUser, myProfile, updateProfilePic, updateUser } from "../controllers/user.js";
import { isAuth } from "../middleware/isAuth.js";
import uploadFile from "../middleware/multer.js";

const router = express.Router();
router.post("/login", loginUser)
router.get("/me", isAuth, myProfile)
router.post("/user/update", isAuth, updateUser)
router.get("/user/:id", getUserProfile)
router.post("/user/update/pic", isAuth, uploadFile, updateProfilePic)


export default router;