import mongoose from "mongoose";
import process from "process";

const connectDatabase = async () => {
  try {
    await mongoose.connect("mongodb+srv://swiftvtu1:dQdzSZ043dqC0XIJ@swiftvtu1.dyw6uz2.mongodb.net/?retryWrites=true&w=majormajority&appName=SwiftVtu1", {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log("Database connected successfully! ✅");
  } catch (error) {
    console.error("Database connection failed! ❌", error.message);
    process.exit(1);
  }
};

export default connectDatabase;