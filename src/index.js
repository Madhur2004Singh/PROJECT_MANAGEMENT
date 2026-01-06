import dotenv from "dotenv"
import app from "./app.js";
import connectDB from "./db/index.js"

dotenv.config({
    path:"./.env",//The line of code is telling your Node.js application: "Go to the file named .env in the root of my project, read all the KEY=VALUE pairs inside it, and make them available to my application via the process.env object."
});


const port = process.env.PORT || 3000;

connectDB()
.then(()=>{
  app.listen(port, () => { // This is used to start the server.
  console.log(`Example app listening on port http://localhost:${port}`)
});

})
.catch((error)=>{
  console.error("MongoDB connection error",error)

})



