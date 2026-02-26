import express from "express";
import dotenv from "dotenv";
import connectDb from "./utils/db.js";
import userRoutes from "./routes/user.js"
import {v2 as cloudinary} from "cloudinary";

dotenv.config();

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

const port = process.env.PORT;
const app = express();
app.use(express.json());

connectDb();

app.use("/api/v1", userRoutes)

app.listen(port, ()=>{
    console.log(`👍 Server is live on http://localhost:${port}`);
});