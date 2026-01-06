import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser';

// This app.js contains all my express code and represents our backend server logic.

const app=express();

// Basic configuration
// app.use() is used to add middleware functions to your application.
app.use(express.json({limit:"16kb"})) // allowins recieving json data
app.use(express.urlencoded({extended:true,limit:"16kb"}))//parses forms/URL encoded requests
// extended=true allows nested objects.

app.use(express.static("public"));// It tells express to serve static files from the public folder
// These files can be directly accessed by the browsers
// No app.get() needed for these files

app.use(cookieParser());
//--------------------END OF BASIC CONFIGURATIONS----------------------

// CORS CONFIGURATIONS
app.use(cors({
    origin: process.env.CORS_ORIGIN?.split(",") || "http://localhost:5173", //Specifies which frontend origins are allowed to access your backend.
    credentials:true,//credentials: true allows the browser to send and receive credentials (cookies, auth headers, etc.) in cross-origin requests.
    methods: ["GET","POST","PUT","PATCH","DELETE","OPTIONS"],
    allowedHeaders:["Content-Type","Authorization"],// allowedHeaders is used to tell the browser which HTTP headers the client is allowed to send in a cross-origin request.
}));

// importing routes

import healthCheckRouter from "./routes/healthcheck.routes.js"
import authRouter from "./routes/auth.routes.js"


app.use("/api/v1/healthcheck",healthCheckRouter);
app.use("/api/v1/auth",authRouter);

app.get("/",(req,res)=>{
    res.send("Welcome to bootcampy!");
})




export default app;