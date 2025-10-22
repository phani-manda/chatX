import jwt from "jsonwebtoken";
import {ENV} from "../lib/env.js";
import User from "../models/user.js";

export const socketAuthMiddleware = async (socket, next) => {
    try {
        //extract token from http-only cookies
        const token = socket.handshake.headers.cookie?.split(";").find((row) => row.startsWith("jwt="))?.split("=")[1];

        if(!token){
            console.log("❌ Socket connection rejected: no token provided");
            return next(new Error("Authentication error"));
        }
        //verify token
        const decoded = jwt.verify(token, ENV.JWT_SECRET);
        if(!decoded) {
            console.log("❌ Socket connection rejected: invalid token");
            return next(new Error("Authentication error - invalid token"));
        }

        //find the user from db
        const user = await User.findById(decoded.userId).select("-password");
        if(!user){
            console.log("❌ Socket connection rejected: user not found");
            return next(new Error("Authentication error - user not found"));
        }

         //attach user info to socket
        socket.user = user;
        socket.userId = user._id.toString();
        console.log(`✅ Socket authenticated for user: ${user.username} (${user._id})`);
        next();
        
    } catch (error) {
        console.log("❌ Socket authentication error:", error.message);
        next(new Error("Authentication error"));
        
    }
}