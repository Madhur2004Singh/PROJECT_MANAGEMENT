class ApiResponse{
    constructor(statusCode, data, message="Success"){
        this.statusCode=statusCode;
        this.data=data;
        this.message=message; // In case we have overwritten it.
        this.success=statusCode<400;// automatically decides whether an API response is a success or a failure, based purely on the HTTP status code.
    }
}

export {ApiResponse}