import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({

    title:{
        type:String,
        required:true,
    },
    content:{
        type:String,
        required:true,
    },
    url:{
        type:String,
        required:true,
    },

  
});

export const UserModel = mongoose.model("User", UserSchema, "users");
