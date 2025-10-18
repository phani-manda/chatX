import User from "../models/user.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../lib/utils.js";
import { sendWelcomeEmail } from "../emails/emailHandlers.js";
import {ENV} from "../lib/env.js";

export const signup = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        if(!username || !email || !password){
            return res.status(400).json({message:"All fields are required"})
        }

        if(password.length < 6)
        {
            return res.status(400).json({message:"Password must be at least 6 characters"})
        }

        //checks if emails valid: regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(!emailRegex.test(email)){
            return res.status(400).json({message:"Invalid email format"});
        }

        

        // 123456  ==> w2okeqfndc2ccrd hashing
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            username,
            email,
            password:hashedPassword,
        });

        if (newUser) {
            const savedUser = await newUser.save();
            generateToken(savedUser._id, res);


            res.status(201).json({
                _id: newUser._id,
                username: newUser.username,
                email: newUser.email,
                profilePic: newUser.profilePic,
            });

            // Send welcome email (await so we can log failures). We don't fail the request
            // if email sending fails, but we log the error for investigation.
            try {
                await sendWelcomeEmail(savedUser.email, savedUser.username, ENV.CLIENT_URL);
            } catch (error) {
                console.error("Error sending welcome email:", error);
            }

            
        
    }

            else{
                res.status(400).json({message:"Invalid user data"});

            }

    }
    
        catch (error) {

            console.log("Error in signup controller:",error);
            res.status(500).json({message:"Internal server error"});
        
    
    }

};