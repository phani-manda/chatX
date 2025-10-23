import mongoose from "mongoose";

const groupMessageSchema = new mongoose.Schema(
    {
        groupId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Group",
            required: true
        },
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        text: {
            type: String,
            trim: true,
            maxlength: 2000
        },
        image: {
            type: String
        },
        replyTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "GroupMessage",
            default: null
        }
    },
    { timestamps: true }
);

// Index for faster queries
groupMessageSchema.index({ groupId: 1, createdAt: -1 });

const GroupMessage = mongoose.model("GroupMessage", groupMessageSchema);

export default GroupMessage;
