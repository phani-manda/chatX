import express from 'express';
import { arcjetProtection } from '../middleware/arcjet.middleware.js';
import { protectRoute } from '../middleware/auth.middleware.js';
import { getChatPartners, sendMessage, getAllContacts, getMessagesByUserId } from '../controller/message.controller.js';


const router = express.Router();

router.use(arcjetProtection,protectRoute);

router.get("/contacts",getAllContacts);
router.get("/chats", getChatPartners);
router.get("/:id", getMessagesByUserId);
router.post("/send/:id", sendMessage); 

export default router;