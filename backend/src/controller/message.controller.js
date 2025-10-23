import Message from "../models/message.js";
import User from "../models/user.js";
import cloudinary from "../lib/cloudinary.js";
import {getReceiverSocketId, io} from "../lib/socket.js";


export const getAllContacts = async (req, res) =>{
    try {
        const loggedInUserId = req.user._id;
        const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");

        res.status(200).json(filteredUsers);
    } catch (error) {
        console.log("Error in getAllContacts:", error);
        res.status(500).json({message: "Internal server error"});
        
    }
};

export const getMessagesByUserId = async (req, res) => {
    try {
        const myId = req.user._id;
        const { id: userToChatId } = req.params;

        const messages = await Message.find({
            $or: [
                { senderId: myId, receiverId: userToChatId },
                { senderId: userToChatId, receiverId: myId },
            ],
        })
        .populate({
            path: 'replyTo',
            populate: { path: 'senderId', select: 'username profilePic' }
        })
        .sort({ createdAt: 1 });

        res.status(200).json(messages);

    } catch (error) {
        console.log("Error in getmessages controller:" , error.message);
        res.status(500).json({error: "Internal server error"});
    }
};

export const sendMessage = async (req, res) => {
    try {
        const { text, image, replyTo } = req.body;
        const { id: receiverId } = req.params;
        const senderId = req.user._id;

        if(!text && !image) return res.status(400).json({error: "Text or image is required"});
        
        if(senderId === receiverId) return res.status(400).json({error: "cannot send messages to yourself."});

        const receiverExists = await User.findById(receiverId);
        if(!receiverExists) return res.status(400).json({error: "Receiver does not exist"});

        let imageUrl;
        if (image){
            //upload to cloudinary
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            image: imageUrl,
            replyTo: replyTo || null,
            });

        await newMessage.save();

        // Populate replyTo before sending
        await newMessage.populate({
            path: 'replyTo',
            populate: { path: 'senderId', select: 'username profilePic' }
        });

        const receiverSocketId = getReceiverSocketId(receiverId);
        if(receiverSocketId){
            io.to(receiverSocketId).emit("newMessage", newMessage);
        }
        res.status(201).json(newMessage);
        
    } catch (error) {
        console.log("Error in sendMessage controller:", error.message);
        res.status(500).json({error: "Internal server error"});
    }
};

export const getChatPartners = async (req, res) => {
     try {
        const loggedInUserId = req.user._id;
            
            //find all the messages where the logged-in user is either sender or receiver
        const messages = await Message.find({
                $or: [
                    { senderId: loggedInUserId },
                    { receiverId: loggedInUserId },
                ],
            });

        const chatPartnerIds = [
                ...new Set(
                    messages.map((msg) =>
                        msg.senderId.toString() === loggedInUserId.toString()
                            ? msg.receiverId.toString()
                            : msg.senderId.toString()
                    )
                )
            ]


        const chatPartners = await User.find({ _id: { $in: chatPartnerIds } }).select("-password");
        res.status(200).json(chatPartners);
     } catch (error) {
        console.log("Error in getChatPartners controller:", error.message);
        res.status(500).json({error: "Internal server error"});
     }
}

export const deleteMessage = async (req, res) => {
    try {
        const { id: messageId } = req.params;
        const userId = req.user._id;

        const message = await Message.findById(messageId);
        if (!message) {
            return res.status(404).json({ message: "Message not found" });
        }

        // Only sender can delete their message
        if (message.senderId.toString() !== userId.toString()) {
            return res.status(403).json({ message: "You can only delete your own messages" });
        }

        // Delete image from cloudinary if exists
        if (message.image) {
            const publicId = message.image.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(publicId);
        }

        await Message.findByIdAndDelete(messageId);

        // Emit delete event to receiver
        const receiverSocketId = getReceiverSocketId(message.receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("messageDeleted", { messageId });
        }

        res.status(200).json({ message: "Message deleted successfully" });
    } catch (error) {
        console.log("Error in deleteMessage controller:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};