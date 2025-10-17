import mongoose from "mongoose";

const schema = new mongoose.Schema({
    email:{
        type: String,
        required:true,
        unique:true,
    },
    username:{
        type: String,
        required:true,
        unique:true,
    },
    password:{
        type: String,
        required:true,
        minlength:6
    },
    profilePic:{
        type: String,
        default:"",
    
    },

},
{ timestamps: true}

);

const User = mongoose.model("User", schema);

export default User;