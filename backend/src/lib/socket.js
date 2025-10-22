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

//we will use this function to check if the user is online or not
export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

//this is for storing online users
const userSocketMap = {}; //{userId:SocketId}

io.on("connection", (socket) => {
    console.log("🟢 User connected:", socket.user.username, "| Socket ID:", socket.id);

    const userId = socket.user._id;
    userSocketMap[userId] = socket.id;
    
    console.log("📊 Current online users:", Object.keys(userSocketMap).length);
    console.log("📍 User socket map:", userSocketMap);

    // io.emit is used to send events to all connected clients
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on("disconnect", () => {
        console.log("🔴 User disconnected:", socket.user.username, "| Socket ID:", socket.id);
        delete userSocketMap[userId];
        console.log("📊 Remaining online users:", Object.keys(userSocketMap).length);
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
  });

  export {io, app, server};