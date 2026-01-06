import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";

/*const healthCheck=async(req,res,next)=>{
     /* This is the old code which does not include async-await and next
    try {
        res.status(200).json(new ApiResponse(200, {message:"Server is running!"}));
    } catch (error) {
        
    } */

    // this is the new code
    /*try {
        const user=await getUserFromDB();
        res.status(200).json(new ApiResponse(200, {message:"Server is running!"}));
    } catch (error) {
        next(error);
    } 
};*/

// New way of writing the function using asyncHandler

const healthCheck=asyncHandler(async(req,res)=>{res.status(200).json(new ApiResponse(200, {message:"Server is running!"}));
});

export {healthCheck}