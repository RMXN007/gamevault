import { connectDB } from "./db/index.js";
import dotenv from "dotenv";

dotenv.config();

connectDB()
    .then(() => {
        console.log("Mongoose connected");
    })
    .catch((error) => {
        console.log("Mongoose connection error", error);
    })

