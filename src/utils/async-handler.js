

// Here we will simplify and optimize what we did in healthcheck.controller.js
//Automatically catches async errors and passes them to error middleware.
const asyncHandler=(requestHandler)=>{ // Here "requestHandler" is the async function we mentioned in the file healthcheck.controller.js
    return(req,res,next)=>{
        Promise.resolve(requestHandler(req,res,next)).catch((err)=>next(err));
    }


};
export {asyncHandler};