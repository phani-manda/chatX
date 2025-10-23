import Group from "../models/group.js";
import GroupMessage from "../models/groupMessage.js";
import User from "../models/user.js";
import cloudinary from "../lib/cloudinary.js";
import { io } from "../lib/socket.js";

// Create a new group
export const createGroup = async (req, res) => {
    try {
        const { name, description, memberIds } = req.body;
        const adminId = req.user._id;

        if (!name || !name.trim()) {
            return res.status(400).json({ message: "Group name is required" });
        }

        if (!memberIds || memberIds.length === 0) {
            return res.status(400).json({ message: "At least one member is required" });
        }

        // Verify all members exist
        const members = await User.find({ _id: { $in: memberIds } });
        if (members.length !== memberIds.length) {
            return res.status(400).json({ message: "Some members not found" });
        }

        // Create group with admin and members
        const allMembers = [adminId, ...memberIds.filter(id => id !== adminId.toString())];

        const newGroup = new Group({
            name: name.trim(),
            description: description?.trim() || "",
            admin: adminId,
            members: allMembers
        });

        await newGroup.save();

        // Populate group data
        const populatedGroup = await Group.findById(newGroup._id)
            .populate("admin", "username profilePic")
            .populate("members", "username profilePic");

        // Emit to all members
        allMembers.forEach(memberId => {
            io.to(memberId.toString()).emit("newGroup", populatedGroup);
        });

        res.status(201).json(populatedGroup);
    } catch (error) {
        console.log("Error in createGroup controller:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Get all groups for current user
export const getUserGroups = async (req, res) => {
    try {
        const userId = req.user._id;

        const groups = await Group.find({ members: userId })
            .populate("admin", "username profilePic")
            .populate("members", "username profilePic")
            .populate("lastMessage")
            .sort({ updatedAt: -1 });

        res.status(200).json(groups);
    } catch (error) {
        console.log("Error in getUserGroups controller:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Get group by ID
export const getGroupById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const group = await Group.findById(id)
            .populate("admin", "username profilePic email")
            .populate("members", "username profilePic email");

        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }

        // Check if user is a member
        if (!group.members.some(member => member._id.toString() === userId.toString())) {
            return res.status(403).json({ message: "You are not a member of this group" });
        }

        res.status(200).json(group);
    } catch (error) {
        console.log("Error in getGroupById controller:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Get group messages
export const getGroupMessages = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        // Check if user is a member
        const group = await Group.findById(id);
        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }

        if (!group.members.some(m => m.toString() === userId.toString())) {
            return res.status(403).json({ message: "You are not a member of this group" });
        }

        const messages = await GroupMessage.find({ groupId: id })
            .populate("senderId", "username profilePic")
            .populate({
                path: 'replyTo',
                populate: { path: 'senderId', select: 'username profilePic' }
            })
            .sort({ createdAt: 1 });

        res.status(200).json(messages);
    } catch (error) {
        console.log("Error in getGroupMessages controller:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Send group message
export const sendGroupMessage = async (req, res) => {
    try {
        const { id: groupId } = req.params;
        const { text, image, replyTo } = req.body;
        const senderId = req.user._id;

        if (!text && !image) {
            return res.status(400).json({ message: "Text or image is required" });
        }

        // Check if user is a member
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }

        if (!group.members.some(m => m.toString() === senderId.toString())) {
            return res.status(403).json({ message: "You are not a member of this group" });
        }

        let imageUrl;
        if (image) {
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }

        const newMessage = new GroupMessage({
            groupId,
            senderId,
            text,
            image: imageUrl,
            replyTo: replyTo || null
        });

        await newMessage.save();

        // Update group's last message
        group.lastMessage = newMessage._id;
        await group.save();

        // Populate sender info and replyTo
        const populatedMessage = await GroupMessage.findById(newMessage._id)
            .populate("senderId", "username profilePic")
            .populate({
                path: 'replyTo',
                populate: { path: 'senderId', select: 'username profilePic' }
            });

        // Emit to all group members
        group.members.forEach(memberId => {
            io.to(memberId.toString()).emit("newGroupMessage", {
                groupId,
                message: populatedMessage
            });
        });

        res.status(201).json(populatedMessage);
    } catch (error) {
        console.log("Error in sendGroupMessage controller:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Add member to group
export const addGroupMember = async (req, res) => {
    try {
        const { id: groupId } = req.params;
        const { userId } = req.body;
        const requesterId = req.user._id;

        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }

        // Only admin can add members
        if (group.admin.toString() !== requesterId.toString()) {
            return res.status(403).json({ message: "Only admin can add members" });
        }

        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if already a member
        if (!group.members.some(m => m.toString() === userId.toString())) {
            return res.status(400).json({ message: "User is already a member" });
        }

        group.members.push(userId);
        await group.save();

        const updatedGroup = await Group.findById(groupId)
            .populate("admin", "username profilePic")
            .populate("members", "username profilePic");

        // Notify all members including new member
        updatedGroup.members.forEach(member => {
            io.to(member._id.toString()).emit("groupUpdated", updatedGroup);
        });

        res.status(200).json(updatedGroup);
    } catch (error) {
        console.log("Error in addGroupMember controller:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Remove member from group
export const removeGroupMember = async (req, res) => {
    try {
        const { id: groupId } = req.params;
        const { userId } = req.body;
        const requesterId = req.user._id;

        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }

        // Only admin can remove members (or member can remove themselves)
        if (group.admin.toString() !== requesterId.toString() && userId !== requesterId.toString()) {
            return res.status(403).json({ message: "Not authorized" });
        }

        // Can't remove admin
        if (userId === group.admin.toString()) {
            return res.status(400).json({ message: "Cannot remove admin" });
        }

        group.members = group.members.filter(id => id.toString() !== userId);
        await group.save();

        const updatedGroup = await Group.findById(groupId)
            .populate("admin", "username profilePic")
            .populate("members", "username profilePic");

        // Notify remaining members
        updatedGroup.members.forEach(member => {
            io.to(member._id.toString()).emit("groupUpdated", updatedGroup);
        });

        // Notify removed member
        io.to(userId).emit("removedFromGroup", groupId);

        res.status(200).json(updatedGroup);
    } catch (error) {
        console.log("Error in removeGroupMember controller:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Update group info
export const updateGroup = async (req, res) => {
    try {
        const { id: groupId } = req.params;
        const { name, description, avatar } = req.body;
        const userId = req.user._id;

        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }

        // Only admin can update group
        if (group.admin.toString() !== userId.toString()) {
            return res.status(403).json({ message: "Only admin can update group" });
        }

        if (name) group.name = name.trim();
        if (description !== undefined) group.description = description.trim();
        
        if (avatar) {
            const uploadResponse = await cloudinary.uploader.upload(avatar);
            group.avatar = uploadResponse.secure_url;
        }

        await group.save();

        const updatedGroup = await Group.findById(groupId)
            .populate("admin", "username profilePic")
            .populate("members", "username profilePic");

        // Notify all members
        updatedGroup.members.forEach(member => {
            io.to(member._id.toString()).emit("groupUpdated", updatedGroup);
        });

        res.status(200).json(updatedGroup);
    } catch (error) {
        console.log("Error in updateGroup controller:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Leave group
export const leaveGroup = async (req, res) => {
    try {
        const { id: groupId } = req.params;
        const userId = req.user._id;

        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }

        // Admin cannot leave, must transfer admin first
        if (group.admin.toString() === userId.toString()) {
            return res.status(400).json({ message: "Admin must transfer ownership before leaving" });
        }

        group.members = group.members.filter(id => id.toString() !== userId.toString());
        await group.save();

        // Notify remaining members
        const updatedGroup = await Group.findById(groupId)
            .populate("admin", "username profilePic")
            .populate("members", "username profilePic");

        updatedGroup.members.forEach(member => {
            io.to(member._id.toString()).emit("groupUpdated", updatedGroup);
        });

        res.status(200).json({ message: "Left group successfully" });
    } catch (error) {
        console.log("Error in leaveGroup controller:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Delete group message
export const deleteGroupMessage = async (req, res) => {
    try {
        const { id: groupId, messageId } = req.params;
        const userId = req.user._id;

        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }

        if (!group.members.includes(userId)) {
            return res.status(403).json({ message: "You are not a member of this group" });
        }

        const message = await GroupMessage.findById(messageId);
        if (!message) {
            return res.status(404).json({ message: "Message not found" });
        }

        // Only sender or admin can delete
        if (message.senderId.toString() !== userId.toString() && group.admin.toString() !== userId.toString()) {
            return res.status(403).json({ message: "You can only delete your own messages or be admin" });
        }

        // Delete image from cloudinary if exists
        if (message.image) {
            const publicId = message.image.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(publicId);
        }

        await GroupMessage.findByIdAndDelete(messageId);

        // Notify all group members
        group.members.forEach(memberId => {
            io.to(memberId.toString()).emit("groupMessageDeleted", { groupId, messageId });
        });

        res.status(200).json({ message: "Message deleted successfully" });
    } catch (error) {
        console.log("Error in deleteGroupMessage controller:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
