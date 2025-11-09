import mongoose from "mongoose";
import process from "process";


const connectDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI).p;
        console.log("Database connected successfully! ✅");
    } catch (error) {
        console.log("Database connection failed! ❌", error);
        process.exit(1);
    }
}

export default connectDatabase;
