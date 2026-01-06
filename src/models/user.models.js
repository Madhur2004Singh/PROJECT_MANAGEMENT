import mongoose, {Schema} from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const userSchema= new Schema({ // This schema represents one user document in mongoDB.
    avatar: {
        type: {
            url:String,
            localPath:String
        },
        default:{
            url:`https://placehold.co/200x200`,
            localPath:""
        }
    },
    username:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true, // It removes all the pre and after space.
        index:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true
    },
    fullName:{
        type:String,
        trim:true
    },
    password:{
        type:String,
        required:[true,"Password is required!"] // We will show this error message in case the user does not fill the password.
    },
    isEmailVerified:{
        type:Boolean,
        default:false // No one is pre verified.
    },
    refreshToken:{
        type:String
    },
    forgotPasswordToken:{
        type:String
    },
    forgotPasswordExpiry:{
        type:Date
    },
    emailVerificationToken:{
        type:String
    },
    emailVerificationExpiry:{
        type:Date
    }

},{
    timestamps:true
}
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, 10);
});


// method for checking the password correction
userSchema.methods.isPasswordCorrect=async function(password) {
    return await bcrypt.compare(password,this.password);
};

// Generating access and refresh tokens

userSchema.methods.generateAccessToken=function(){
    return jwt.sign(
        {
            _id:this._id,
            email:this.email,
            username:this.username
        },
        process.env.ACCESS_TOKEN_SECRET,// This is the key used to sign the token.
        {expiresIn:process.env.ACCESS_TOKEN_EXPIRY}
    )
};

userSchema.methods.generateRefreshToken=function(){
    return jwt.sign(
        {
            _id:this._id,
            email:this.email,
            username:this.username
        },
        process.env.REFRESH_TOKEN_SECRET,
        {expiresIn:process.env.REFRESH_TOKEN_EXPIRY}
    )
};

// Generating temporary token(Token without data)

userSchema.methods.generateTemporaryToken=function(){
    const unHashedToken=crypto.randomBytes(20).toString("hex");
    // Hashing the token
    const hashedToken=crypto
        .createHash("sha256") // hashing algorithm used
        .update(unHashedToken)// value that has to be hashed
        .digest("hex")

    const tokenExpiry=Date.now()+(20*60*1000) // token expiry duration of 20 mins

    return {unHashedToken,hashedToken,tokenExpiry};
}

export const User=mongoose.model("User",userSchema);// The "User" becomes "users" in MongoDB