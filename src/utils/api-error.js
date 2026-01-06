class ApiError extends Error{ // 'extends' helps us utilize the already existing built-in class in node.js
    constructor(statusCode,message="Something went wrong!",errors=[],stack=""){
        super(message);
        this.statusCode=stack;
        this.data=null;
        this.message=message;
        this.success=false;
        this.errors=errors;

        if(stack){
            this.stack=stack;
        }
        else{
            Error.captureStackTrace(this,this.constructor) // This is used to generate the stack trace automatically and assign it to the constructor.
        }

    }


}

export {ApiError}


/*IMPORTANT
A stack trace answers: “Which functions were called, in what order, and where exactly the error happened?”

 */