import { User } from "../models/user.models.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import {emailVerificationMailgenContent, forgotPasswordMailgenContent, sendEmail} from "../utils/mail.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const generateAccessAndRefreshTokens=async (userId)=>// once a user is registered a user _id is generated
    {
        try {
            const user=await User.findById(userId);// It returns all the information about the user in form of an object from the mongoDB using unique '_id'
            // Here through 'User' we are accessing the 'users' collection in database.


            const accessToken=user.generateAccessToken();
            const refreshToken=user.generateRefreshToken();

            user.refreshToken=refreshToken;// the refresh token that we created is now going into the database.
            await user.save({validateBeforeSave:false});// Saving the data
            return {accessToken,refreshToken}
        } catch (error) {
            throw new ApiError(500,"Something went wrong while generating access token!");
            
        }

    }

const registerUser=asyncHandler(async (req,res)=>{
    const {email,username,password,role}=req.body;// We are getting the data from the body of request

    const existedUser=await User.findOne({ // checking wheter the user with the given username and email already exists
        $or: [{username},{email}]
        
    })

    if(existedUser){
        throw new ApiError(409,"User already present",[]);
        
    }

    // If new user then we will register him/her

    const user=await User.create({
        email,
        password,
        username,
        isEmailVerified:false
    })

    const {unHashedToken,hashedToken,tokenExpiry}=user.generateTemporaryToken();
    
    user.emailVerificationToken=hashedToken
    user.emailVerificationExpiry=tokenExpiry

    await user.save({validateBeforeSave:false})

    // Now we need to send the verification email

    await sendEmail({
        email:user?.email,
        subject:"Please verify your email!",
        mailgenContent: emailVerificationMailgenContent(user.username,
            `${req.protocol}://${req.get("host")}/api/v1/users/verify-email/${unHashedToken}`
        )
    });

    const createdUser=await User.findById(user._id).select(
        "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
    );// Things that we don't want to send in the response

    if(!createdUser){
        throw new ApiError(500,"Something went wrong while registering the user!");
        
    }

    return res.status(201)
        .json(new ApiResponse(200,
            {user:createdUser},
            "User registered successfully and verification email sent."
        ))
    
});

const login=asyncHandler(async(req,res)=>{
    const {email,password,username}=req.body;

    if(!email){
        throw new ApiError(400,"email is required");
        
    }

    const user=await User.findOne({ email });

    if(!user){
        throw new ApiError(400,"User does not exists!");
        
    }

    const ispasswordValid=await user.isPasswordCorrect(password);

    if(!ispasswordValid){
        throw new ApiError(400,"Incorrect passowrd! Please try again.");
        
    }
    
    const {accessToken,refreshToken}=await generateAccessAndRefreshTokens(user._id);

    // Now we will send the token in cookies

    const LoggedInUser=await User.findById(user._id).select(
        "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
    );

    const options={
        httpOnly:true, //The cookie cannot be accessed by JavaScript running in the browser.
        secure:true // Prevents Man-in-the-Middle (MITM) attacks
    }

    return res
      .status(200)
      .cookie("accessToken",accessToken,options)
      .cookie("refreshToken",refreshToken,options)
      .json(
        new ApiResponse(
            200,
            {
                user: LoggedInUser,
                accessToken,
                refreshToken
            },
            "User logged in successfully!"
        )
      )


})

const logoutUser=asyncHandler(async(req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken:"",
            },
        },
        {
            new:true,
        }
    );

    const options={
        httpOnly:true, // Prevents JavaScript (browser-side) from accessing the cookie
        secure:true // Cookie is sent only over HTTPS not via HTTP
    }

    return res
          .status(200)
          .clearCookie("accessToken",options)
          .clearCookie("refreshToken",options)
          .json(
            new ApiResponse(200,{},"User loggedOut!")
          )
});

const getCurrentUser=asyncHandler(async(req,res)=>{

    return res
      .status(200)
      .json(
        new ApiResponse(
            200,
            req.user,
            "Current user fetched successfully."
        )
      )

});

const verifyEmail=asyncHandler(async(req,res)=>{
    // this is exactly what happens on the backend when a user clicks the “Verify Email” link sent to them.
    const {verificationToken}=req.params // this gives the access to the URL and from URL we get the unhashedToken.

    if(!verificationToken){
        throw new ApiError(400, "Email verification token is missing!");
    }

    let hashedToken=crypto // This process gives us the same token that is stored in our database.
        .createHash("sha256")
        .update(verificationToken)
        .digest("hex")

    const user=await User.findOne({
        emailVerificationToken: hashedToken,
        emailVerificationExpiry:{$gt:Date.now()}// {} here used for condition and $gt refers should be greater than.
        //So token must still be valid at this moment
    });
    if(!user){
        throw new ApiError(400,"Token is invalid or Token is expired!")
    }

    user.emailVerificationToken=undefined;// prevents replay attacks
    user.emailVerificationExpiry=undefined;

    user.isEmailVerified=true;

    await user.save({validateBeforeSave:false})

    return res
      .status(200)
      .json(
        new ApiResponse(
            200,
            {isEmailVerified:true},
            "Email is verified!"
        ),
      );
});

const resendEmailVerification=asyncHandler(async(req,res)=>{
    // the user must be logged in for this case.
    // Ask the question how are we checking whether the user is logged in or not.
    const user=User.findById(req.user._id);// user._id is only accessible if the user is loggedIn
    if(!user){
        throw new ApiError(404,"User does not exist!");
    }

    if(user.isEmailVerified){
        throw new ApiError(409,'Email is already verified!')
    }

    const {unHashedToken,hashedToken,tokenExpiry}=user.generateTemporaryToken();
    
    user.emailVerificationToken=hashedToken
    user.emailVerificationExpiry=tokenExpiry

    await user.save({validateBeforeSave:false})

    // Now we need to send the verification email

    await sendEmail({
        email:user?.email,
        subject:"Please verify your email!",
        mailgenContent: emailVerificationMailgenContent(user.username,
            `${req.protocol}://${req.get("host")}/api/v1/users/verify-email/${unHashedToken}`
        )
    });

    return res
      .status(200)
      .json(
        new ApiResponse(
            200,
            {},
            "Verification E-mail has been sent!"
        )
      )

});

// as the Access Token is temporary and if it gets expired then we need to use the refresh Token to regenerate the Access Token. The next method will do the same...

const refreshAccessToken=asyncHandler(async(req,res)=>{
    const incomingRefreshToken=req.cookies.refreshToken || req.body.refreshToken; // Refresh and Access Tokens are usually stored in cookies

    if(!incomingRefreshToken){
        throw new ApiError(401,"Unauthorized Access!");
    }
    try {
        const decodedToken=jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET);
        
        const user=await User.findById(decodedToken?._id);
        if(!user){
            throw new ApiError(401,"Incorrect Refresh Token");
        }

        if(incomingRefreshToken!==user?.refreshToken){
            throw new ApiError(401,"Refresh token is expired!") // The refresh token is not in the dartabase maybe the user has loggedout.This checks whether the incoming token is the same as the last one used. This is to avoid hacking attempts as hackers can use old refresh tokens to get access to the user's account.
        }

        const options={
            httpOnly:true,
            secure:true
        }

        const {accessToken,refreshToken:newRefreshToken}=await generateAccessAndRefreshTokens(user._id);
        // refreshAccessToken:newRefreshToken -> this means that the new refresh token generated will be called newRefreshToken
        user.refreshToken=newRefreshToken;

        await user.save();

        return res   
            .status(200)
            .cookie("accessToken",accessToken,options)
            .cookie("refreshToken",newRefreshToken,options)
            .json(
               new ApiResponse(
                 200,
                {accessToken,refreshToken:newRefreshToken},
                "New Access and Refresh Tokens generated!"
               )
            )


    } catch (error) {
        throw new ApiError(401,"Invalid refresh token!");
    }

});

const forgotPasswordRequest=asyncHandler(async(req,res)=>{
    const {email}=req.body // req.body is an object
    const user=await User.findOne({email}); //.findOne() takes an object as an argument
    if(!user){
        throw new ApiError(404,"User does not exist!")
    }
    const {unHashedToken,hashedToken,tokenExpiry}=user.generateTemporaryToken();

    user.forgotPasswordToken=hashedToken;
    user.forgotPasswordExpiry=tokenExpiry;

    await user.save({validateBeforeSave:false})

    await sendEmail({
        email:user?.email,
        subject:"Password reset request!",
        mailgenContent: forgotPasswordMailgenContent(user.username,
            `${process.env.FORGOT_PASSWORD_REDIRECT_URL}/${unHashedToken}`
        ),
    });

    return res
       .status(200)
       .json(new ApiResponse(
        200,
        {},
        "Password reset e-mail has been sent!"
       ))
});

const resetForgotPassword=asyncHandler(async(req,res)=>{
    const {resetToken}=req.params;//Curly braces are used because req.params is an object.
    const {newPassword}=req.body;

    let hashedToken=crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex")

    const user=await User.findOne({
        forgotPasswordToken: hashedToken,
        forgotPasswordExpiry:{$gt:Date.now()}
    })

    if(!user){
        throw new ApiError(489,"Token is Invalid or expired!");
    }

    user.forgotPasswordExpiry=undefined;
    user.forgotPasswordToken=undefined;

    user.password=newPassword;
    await user.save({validateBeforeSave:false})

    return res  
        .status(200)
        .json(new ApiResponse(
            200,
            {},
            "Password reset successfully!"
        ))
});

const changeCurrentPassword=asyncHandler(async(req,res)=>{
    // In this case the user is already logged in.
    const {oldPassword,newPassword}=req.body;
    const user=await User.findById(req.user?._id);
    if(!user){
        throw new ApiError(400,"User does not exist!")
    }
    const isPasswordValid=await user.isPasswordCorrect(oldPassword);
    if(!isPasswordValid){
        throw new ApiError(400,"Invalid old Password!")
    }

    user.password=newPassword;
    await user.save({validateBeforeSave:false});

    return res
       .status(200)
       .json(new ApiResponse(
        200,
        {},
        "Password changed successfully!"
       ))
});

export {registerUser,login,logoutUser,getCurrentUser,verifyEmail,resendEmailVerification,refreshAccessToken,forgotPasswordRequest,resetForgotPassword,changeCurrentPassword};