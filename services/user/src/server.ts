import express from "express";
import dotenv from "dotenv";
import connectDb from "./utils/db.js";
import userRoutes from "./routes/user.js"


dotenv.config()

const port = process.env.PORT;
const app = express();
app.use(express.json());

connectDb();

app.use("/api/v1", userRoutes)

app.listen(port, ()=>{
    console.log(`👍 Server is live on http://localhost:${port}`);
});