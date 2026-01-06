import { Router } from "express";
import {changeCurrentPassword, forgotPasswordRequest, getCurrentUser, login, logoutUser, refreshAccessToken, registerUser, resendEmailVerification, resetForgotPassword, verifyEmail} from "../controllers/auth.controllers.js"
import { validate } from "../middlewares/validator.middleware.js";
import {userRegisterValidator,userLoginValidator,userChangeCurrentPasswordValidator,userForgotPasswordValidator,userResetForgotPasswordValidator} from "../validators/index.js"
import {verifyJWT} from "../middlewares/auth.middlewares.js"

const router=Router();

// unsecured routes
router.route("/register").post(userRegisterValidator(),validate,registerUser);
router.route("/login").post(userLoginValidator(),validate,login);
router.route("/verify-email/:verificationToken").get(verifyEmail);// the name verificationToken used here should be the same as the one inside the verifyEmail function in the controller file
router.route("/refresh-token").post(refreshAccessToken);
router.route("/forgot-password").post(userForgotPasswordValidator(),validate,forgotPasswordRequest);
router.route("/reset-password/:resetToken").post(userResetForgotPasswordValidator(),validate,resetForgotPassword);

// secure routes
router.route("/logout").post(verifyJWT,logoutUser);
router.route("/current-user").post(verifyJWT,getCurrentUser);
router.route("/change-password").post(verifyJWT,userChangeCurrentPasswordValidator(),
validate,changeCurrentPassword);
router.route("/resend-email-verification").post(verifyJWT,resendEmailVerification);

export default router;