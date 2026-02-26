import mongoose, { connect } from "mongoose";

const connectDb = async()=>{
    try {
     mongoose.connect(process.env.MONGO_URI as string, {
        dbName: "blog"
     });
     console.log("✅ Connected to MongoDb");
        
    } catch (error) {
        
    }

}
export default connectDb;