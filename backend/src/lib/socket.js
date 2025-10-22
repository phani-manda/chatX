import { Server } from "socket.io";
import http from "http";
import { ENV } from "./env.js";
import express from "express";
import {socketAuthMiddleware} from "../middleware/socket.auth.middleware.js";


const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [ENV.CLIENT_URL],
    credentials: true,
  },
});

//apply authentication middleware to all socket connections
io.use(socketAuthMiddleware);

//this is for storing online users
const userSockets = new Map(); //{userId:SocketId}

io.on("connection", (socket) => {
    console.log("🟢 User connected:", socket.user.username, "| Socket ID:", socket.id);

    const userId = socket.user._id.toString();
    let set = userSockets.get(userId);

    if(!set){
        set = new Set();
        userSockets.set(userId, set);
    }
    set.add(socket.id);
    
    
    console.log("📊 Current online users:", Array.from(userSockets.keys()).length);
    console.log("📍 User socket map:", userSockets);

    // io.emit is used to send events to all connected clients
    io.emit("getOnlineUsers", Array.from(userSockets.keys()));

    socket.on("disconnect", () => {
        console.log("🔴 User disconnected:", socket.user.username, "| Socket ID:", socket.id);
        const set = userSockets.get(userId);
        if(set){
            set.delete(socket.id);
            if(set.size === 0){
                userSockets.delete(userId);
            }
        }
        console.log("📊 Remaining online users:", Array.from(userSockets.keys()).length);
        io.emit("getOnlineUsers", Array.from(userSockets.keys()));
    });
  });

  export {io, app, server};