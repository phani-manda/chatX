import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import { arcjetProtection } from '../middleware/arcjet.middleware.js';
import {
    createGroup,
    getUserGroups,
    getGroupById,
    getGroupMessages,
    sendGroupMessage,
    addGroupMember,
    removeGroupMember,
    updateGroup,
    leaveGroup,
    deleteGroupMessage
} from '../controller/group.controller.js';

const router = express.Router();

router.use(arcjetProtection, protectRoute);

// Group CRUD
router.post("/create", createGroup);
router.get("/", getUserGroups);
router.get("/:id", getGroupById);
router.put("/:id", updateGroup);
router.post("/:id/leave", leaveGroup);

// Group messages
router.get("/:id/messages", getGroupMessages);
router.post("/:id/messages", sendGroupMessage);
router.delete("/:id/messages/:messageId", deleteGroupMessage);

// Group members
router.post("/:id/members/add", addGroupMember);
router.post("/:id/members/remove", removeGroupMember);

export default router;
