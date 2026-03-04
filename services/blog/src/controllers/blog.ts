import axios from "axios";
import { sql } from "../utils/db.js";
import tryCatch from "../utils/tryCatch.js";
import { redisClient } from "../server.js";
import { AuthenticatedRequest } from "../middleware/isAuth.js";


// ✅ GET ALL BLOGS
export const getAllBlogs = tryCatch(async (req, res) => {
    const { searchQuery = "", category = "" } = req.query;

    const cacheKey = `blogs:${searchQuery}:${category}`;
    const cached = await redisClient.get(cacheKey);

    if (cached) {
        console.log("Serving from redis cache");
        return res.json(JSON.parse(cached));
    }

    let blogs;

    const baseQuery = sql`
        SELECT 
            id,
            title,
            description,
            image,
            category,
            author,
            created_at,
            blogcontent AS "blogContent"
        FROM blogs
    `;

    if (searchQuery && category) {
        blogs = await sql`
            SELECT 
                id,
                title,
                description,
                image,
                category,
                author,
                created_at,
                blogcontent AS "blogContent"
            FROM blogs
            WHERE (title ILIKE ${"%" + searchQuery + "%"} 
                OR description ILIKE ${"%" + searchQuery + "%"})
            AND category = ${category}
            ORDER BY created_at DESC
        `;
    } else if (searchQuery) {
        blogs = await sql`
            SELECT 
                id,
                title,
                description,
                image,
                category,
                author,
                created_at,
                blogcontent AS "blogContent"
            FROM blogs
            WHERE (title ILIKE ${"%" + searchQuery + "%"} 
                OR description ILIKE ${"%" + searchQuery + "%"})
            ORDER BY created_at DESC
        `;
    } else if (category) {
        blogs = await sql`
            SELECT 
                id,
                title,
                description,
                image,
                category,
                author,
                created_at,
                blogcontent AS "blogContent"
            FROM blogs
            WHERE category = ${category}
            ORDER BY created_at DESC
        `;
    } else {
        blogs = await sql`
            SELECT 
                id,
                title,
                description,
                image,
                category,
                author,
                created_at,
                blogcontent AS "blogContent"
            FROM blogs
            ORDER BY created_at DESC
        `;
    }

    console.log("Serving from DB");

    await redisClient.set(cacheKey, JSON.stringify(blogs), { EX: 3600 });

    res.json(blogs);
});


// ✅ GET SINGLE BLOG
export const getSingleBlog = tryCatch(async (req, res) => {

    const blogid = req.params.id;
    const cacheKey = `blog:${blogid}`;

    const cached = await redisClient.get(cacheKey);

    if (cached) {
        console.log("Serving single blog from redis cache");
        return res.json(JSON.parse(cached));
    }

    const blog = await sql`
        SELECT 
            id,
            title,
            description,
            image,
            category,
            author,
            created_at,
            blogcontent AS "blogContent"
        FROM blogs
        WHERE id = ${blogid}
    `;

    if (blog.length === 0) {
        return res.status(404).json({
            message: "No blog with this ID",
        });
    }

    const { data: author } = await axios.get(
        `${process.env.USER_SERVICE}/api/v1/user/${blog[0].author}`
    );

    const responseData = {
        blog: blog[0],
        author,
    };

    await redisClient.set(cacheKey, JSON.stringify(responseData), { EX: 3600 });

    res.json(responseData);
});


export const addComment = tryCatch(async (req: AuthenticatedRequest, res) => {
  const { id: blogId } = req.params
  const { comment } = req.body

  const newComment = await sql`
    INSERT INTO comments (comment, blogid, userid, username)
    VALUES (${comment}, ${blogId}, ${req.user._id}, ${req.user.name})
    RETURNING *
  `

  res.json({
    message: "Comment added",
    comment: newComment[0],
  })
})

export const getAllComments = tryCatch(async (req, res) => {
  const { blogId } = req.params

  const comments = await sql`
    SELECT * FROM comments
    WHERE blogid = ${blogId}
    ORDER BY created_at DESC
  `

  res.json(comments)
})

export const deleteComment = tryCatch(async (req: AuthenticatedRequest, res) => {
  const { commentId } = req.params
  const comment = await sql`SELECT * FROM comments WHERE id = ${commentId}`

  if (!comment[0]) {
    return res.status(404).json({ message: "Comment not found" })
  }

  if (comment[0].userid !== req.user._id) {
    return res.status(403).json({ message: "You are not authorized to delete this comment" })
  }

  await sql`DELETE FROM comments WHERE id = ${commentId}`

  res.json({ message: "Comment deleted" })
})