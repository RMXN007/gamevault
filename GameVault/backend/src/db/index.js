import mongoose from "mongoose";
import { DB_NAME } from "../constants";

const connectDB = async () => {
    try {
        await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`);
        console.log("Mongoose connected");
    } catch (error) {
        console.log("Mongoose connection error", error);
    }
}

export { connectDB };