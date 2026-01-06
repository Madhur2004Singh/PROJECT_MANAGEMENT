import {User} from "../models/user.models.js"
import { asyncHandler } from "../utils/async-handler.js"
import { ApiResponse } from "../utils/api-response.js"
import { ApiError } from "../utils/api-error.js"
import jwt from "jsonwebtoken"

// this middleware is being written for requests that the server recieves from the client.
/* For all the requests we need to check whether the request has the authentic Access Token or not so we can't write a middleware for every type of request but we can write a middleware code and use it everywhere. */


export const verifyJWT=asyncHandler(async(req,resizeBy,next)=>{
    const token=req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","");
    
    if(!token){
        throw new ApiError(401,"Unauthorized access!")
    }

    try {
        const decodedToken=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
        const user=await User.findById(decodedToken?._id).select("-password -refreshToken -emailVerificationToken -emailVerificationExpiry");

        if(!user){
            throw new ApiError(401,"Invalid access Token!")
        }

        req.user=user; // We are adding this new property so that the decoded information of the user can be added to the request.
        next();
    } catch (error) {
        throw new ApiError(401,"Invalid Access tokemn!");// This may be the case when user is not there or token caqnnot be decoded.
    }
});