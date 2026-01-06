import { validationResult } from "express-validator";
import {ApiError} from "../utils/api-error.js"

export const validate=(req,res,next)=>{
    const errors=validationResult(req);
    if(errors.isEmpty()){
        return next();// the request reaches the controller.
    }

    const extractedErrors=[];
    errors.array().map((err)=>extractedErrors.push({
        [err.path]:err.message
    }));
    throw new ApiError(422,"Recieved data is not valid!")
};

// errors.array() converts the erros into an array.(It may be in some other format or data structure.)