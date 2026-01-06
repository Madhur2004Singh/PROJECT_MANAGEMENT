// We have called it index.js because there will be only one file for database.

import mongoose from "mongoose"

/* asynchronous functions for connecting to MongoDB because database operations are slow, I/O-bound, and unpredictable, and blocking them would freeze your entire backend.
 */

const connectDB=async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB connected");
        
    } catch (error) {
        console.error("MongoDB connection error",error);
        process.exit(1); //Exit if the connection fails.
    }
}

export default connectDB