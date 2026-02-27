import express from "express"
import dotenv from "dotenv"
import { sql } from "./utils/db.js";
import blogRoutes from "./routes/blog.js"
import {v2 as cloudinary} from "cloudinary";
import { connectRabbitMQ } from "./utils/rabbitmq.js";


dotenv.config()

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME as string,
  api_key: process.env.CLOUD_API_KEY as string,
  api_secret: process.env.CLOUD_API_SECRET as string,
});

console.log("☁️  Cloudinary config test:", {
  cloud_name: cloudinary.config().cloud_name,
  api_key_exists: !!cloudinary.config().api_key,
  api_secret_exists: !!cloudinary.config().api_secret,
});

const app = express()

connectRabbitMQ()

const port = process.env.PORT;

async function initDB() {
    try {
        await sql`
        CREATE TABLE IF NOT EXISTS blogs(
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description VARCHAR(255) NOT NULL,
        blogContent TEXT NOT NULL,
        image VARCHAR(255) NOT NULL,
        category VARCHAR(255) NOT NULL,
        author VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );`;
        await sql`
        CREATE TABLE IF NOT EXISTS comments(
        id SERIAL PRIMARY KEY,
        comment VARCHAR(255) NOT NULL,
        userid VARCHAR(255) NOT NULL,
        username VARCHAR(255) NOT NULL,
        blogid VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );`;
        await sql`
        CREATE TABLE IF NOT EXISTS savedBlogs(
        id SERIAL PRIMARY KEY,
        userid VARCHAR(255) NOT NULL,
        blogid VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );`;
        console.log("✅ Database initialized successfully");
        

    } catch (error) {
        console.log("Error initDB", error);
        
    }
}

app.use("/api/v1", blogRoutes)

initDB().then(()=>{
    app.listen(port, () => {
    console.log(`👍 Server is live on http://localhost:${port}`);
})
})

