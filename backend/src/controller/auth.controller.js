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

        // Check if user email is valid: regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Invalid email format" });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(400).json({
                message: existingUser.email === email
                    ? "Email already exists"
                    : "Username already taken"
            });
        }

        // 123456  ==> w2okeqfndc2ccrd hashing
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            username,
            email,
            password: hashedPassword,
        });

        const savedUser = await newUser.save();
        generateToken(savedUser._id, res);

        // Welcome email logic remains here...
        try {
            await sendWelcomeEmail(savedUser.email, savedUser.username, ENV.CLIENT_URL);
            console.log("Welcome email initiated for:", savedUser.email);
        } catch (error) {
            console.error("Error sending welcome email:", error);
        }

        res.status(201).json({
            _id: savedUser._id,
            username: savedUser.username,
            email: savedUser.email,
            profilePic: savedUser.profilePic,
        });

    } catch (error) {
        console.log("Error in signup controller:", error);
        res.status(500).json({ message: "Internal server error" });
    }

};