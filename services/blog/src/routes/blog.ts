import express from "express"
import { addComment, deleteComment, getAllBlogs, getAllComments, getSavedBlogs, getSingleBlog, saveBlog } from "../controllers/blog.js"
import { isAuth } from "../middleware/isAuth.js"

const router = express.Router()

router.get("/blog/all", getAllBlogs)
router.get("/blog/:id", getSingleBlog)

// COMMENTS
router.get("/comments/:blogId", getAllComments)
router.post("/comments/:blogId", isAuth, addComment)
router.delete("/comments/:commentId", isAuth, deleteComment)

router.post("/save/:blogid", isAuth, saveBlog)
router.get("/blog/saved/all", isAuth, getSavedBlogs)

export default router