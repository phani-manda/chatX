import jwt from "jsonwebtoken";
import {ENV} from "../lib/env.js";
import User from "../models/user.js";

export const socketAuthMiddleware = async (socket, next) => {
    try {
        //extract token from http-only cookies
        const rawCookie = socket.handshake.headers.cookie || "";
        const token = (() => {
          const parts = rawCookie.split(";").map(v => v.trim());
          const row = parts.find(v => v.startsWith("jwt="));
          if (!row) return undefined;
          const idx = row.indexOf("=");
          return row.slice(idx + 1);
        })();
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