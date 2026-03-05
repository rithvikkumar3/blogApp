import { response } from "express";
import { AuthenticatedRequest } from "../middlewares/isAuth.js";
import getBuffer from "../utils/dataUri.js";
import { sql } from "../utils/db.js";
import tryCatch from "../utils/tryCatch.js";
import cloudinary from "cloudinary"
import { invalidateCacheJob } from "../utils/rabbitmq.js";
import { GoogleGenAI } from "@google/genai";


    const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY as string,
    });

export const createBlog = tryCatch(async (req: AuthenticatedRequest, res) => {
    const { title, description, blogContent, category } = req.body;
    const file = req.file;
    if (!file) {
        res.status(400).json({
            message: "No file to upload",
        })
        return;
    }
    const fileBuffer = getBuffer(file)

    if (!fileBuffer || !fileBuffer.content) {
        res.status(400).json({
            message: "Failed to generate buffer",
        })
        return;
    }
    const cloud = await cloudinary.v2.uploader.upload(fileBuffer.content, {
        folder: "blogs"
    })
    const result = await sql`INSERT INTO blogs (title, description, image, blogContent, category, author)
    VALUES (${title}, ${description}, ${cloud.secure_url}, ${blogContent}, ${category}, ${req.user?._id})
    RETURNING *`

    await invalidateCacheJob(["blogs:*"]);

    res.json({
        message: "Blog Created",
        blog: result[0],
    })
})


export const updateBlog = tryCatch(async (req: AuthenticatedRequest, res) => {
    const { id } = req.params
    const { title, description, blogContent, category } = req.body;
    const file = req.file
    const blog = await sql`SELECT * FROM blogs WHERE id = ${id}`

    if (!blog.length) {
        res.status(400).json({
            message: "No blog with this id",
        })
        return;
    }
    if (blog[0].author !== req.user?._id) {
        res.status(401).json({
            message: "You are not the author of this blog"
        })
        return;
    }
    let imageUrl = blog[0].image
    if (file) {
        const fileBuffer = getBuffer(file)
        if (!fileBuffer || !fileBuffer.content) {
            res.status(400).json({
                message: "Failed to generate buffer",
            })
            return;
        }
        const cloud = await cloudinary.v2.uploader.upload(fileBuffer.content, {
            folder: "blogs"
        })
        imageUrl = cloud.secure_url
    }
    const updatedBlog = await sql`UPDATE blogs SET
    title = ${title || blog[0].title},
    description = ${description || blog[0].description},
    image = ${imageUrl},
    blogContent = ${blogContent || blog[0].blogContent},
    category = ${category || blog[0].category}
    WHERE id = ${id}
    RETURNING *
    `;

    await invalidateCacheJob(["blogs:*", `blog:${id}`]);


    res.json({
        message: "Blog Updated",
        blog: updatedBlog[0],
    })

})


export const deleteBlog = tryCatch(async (req: AuthenticatedRequest, res) => {
    const { id } = req.params

    const blog = await sql`SELECT * FROM blogs WHERE id = ${id}`

    if (!blog.length) {
        res.status(400).json({
            message: "No blog with this id",
        })
        return;
    }
    if (blog[0].author !== req.user?._id) {
        res.status(401).json({
            message: "You are not the author of this blog"
        })
        return;
    }

    await sql`DELETE FROM savedblogs WHERE blogid = ${id}`
    await sql`DELETE FROM comments WHERE blogid = ${id}`
    await sql`DELETE FROM blogs WHERE id = ${id}`

    await invalidateCacheJob(["blogs:*", `blog:${id}`]);


    res.json({
        message: "Blog Deleted"
    })

})


// ✅ Safe Gemini Text Extractor (Fixes random failures)
const extractTextFromGemini = (response: any): string | null => {
    try {
        if (response?.text) return response.text;

        if (response?.candidates?.length) {
            return response.candidates[0]?.content?.parts
                ?.map((p: any) => p.text || "")
                .join("");
        }

        return null;
    } catch (err) {
        console.error("Gemini extract error:", err);
        return null;
    }
};

export const aiTitleResponse = tryCatch(async (req, res) => {
    const { text } = req.body;

    if (!text?.trim()) {
        return res.status(400).json({ message: "Text is required" });
    }

    const prompt = `Correct the grammar of this blog title.
Return only the corrected title.
No explanation.

Title: "${text}"`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
    });

    const rawText = extractTextFromGemini(response);

    if (!rawText) {
        return res.status(500).json({ message: "AI returned empty response" });
    }

    return res.json({
        title: rawText.trim(),
    });
});


export const aiDescriptionResponse = tryCatch(async (req, res) => {
    const { title = "", description = "" } = req.body;

    if (!title && !description) {
        return res.status(400).json({
            message: "Title or description is required",
        });
    }

    const prompt =
        description.trim() === ""
            ? `Write ONE short blog description (max 25 words).
Return only one sentence.
No explanation.

Title: "${title}"`
            : `Fix grammar in this blog description.
Return only the corrected sentence.

"${description}"`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
    });

    const rawText = extractTextFromGemini(response);

    if (!rawText) {
        return res.status(500).json({
            message: "AI returned empty response",
        });
    }

    return res.json({
        description: rawText.trim(),
    });
});

export const aiBlogResponse = tryCatch(async (req, res) => {
    const { blog } = req.body;

    if (!blog?.trim()) {
        return res.status(400).json({
            message: "Please provide blog HTML",
        });
    }

    const prompt = `
You are a grammar correction engine.

IMPORTANT RULES:
- Do NOT rewrite content.
- Do NOT add new ideas.
- Only fix grammar, spelling, punctuation.
- Preserve ALL HTML tags exactly.
- Preserve inline styles, images, formatting.
- Return ONLY the corrected full HTML.
`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `${prompt}\n\n${blog}`,
    });

    const rawText = extractTextFromGemini(response);

    if (!rawText) {
        return res.status(500).json({
            message: "AI returned empty response",
        });
    }

    return res.status(200).json({
        html: rawText.trim(),
    });
});
