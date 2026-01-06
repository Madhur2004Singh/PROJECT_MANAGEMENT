import { body } from "express-validator";



const userRegisterValidator=()=>{
    return [
        body("email")
           .trim()
           .notEmpty()
           .withMessage("Email is required!") // This is used for the immeadiate predecessor method which in this case is .notEmpty()
           .isEmail()
           .withMessage("Email is invalid!"),

        body("username")
           .trim()
           .notEmpty()
           .withMessage("Username is required!")
           .isLowercase()
           .withMessage("Username must be in lowercase.")
           .isLength({min: 3})
           .withMessage("Username must be of 3 characters or more."),

        body("password")
           .trim()
           .notEmpty()
           .withMessage("Password should not be empty!")
           .isLength({min:3})// this section is added by me
           .withMessage("Password should be of 3 characters or more."),
        body("fullName")
           .optional()
           .trim()
           
    ]
};

const userLoginValidator=()=>{
   return [
      body("email").optional().isEmail().withMessage("Email is invalid!"),
      body("password")
         .notEmpty()
         .withMessage("password is required!")
   ]
}

const userChangeCurrentPasswordValidator=()=>{
   return [
      body("oldPassword").notEmpty().withMessage("Old password is required!"),
      body("newPassword").notEmpty().withMessage("New password is required!")
   ]
}

const userForgotPasswordValidator=()=>{
   return[
      body("email")
        .notEmpty()
        .withMessage("Email is required!")
        .isEmail()
        .withMessage('Email is invalid!')
   ];
};

const userResetForgotPasswordValidator=()=>{
   return [
      body("newPassword")
        .notEmpty()
        .withMessage("Password is required!")
   ]
}

export {
    userRegisterValidator,userLoginValidator,userChangeCurrentPasswordValidator,userForgotPasswordValidator,userResetForgotPasswordValidator
}