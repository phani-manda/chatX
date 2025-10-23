import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  allContacts: [],
  contacts: [], // Alias for allContacts for easier access
  chats: [],
  messages: [],
  activeTab: "chats",
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  isSoundEnabled: JSON.parse(localStorage.getItem("isSoundEnabled")) === true,
  isUserTyping: false,
  replyingTo: null,

  setReplyingTo: (message) => set({ replyingTo: message }),

  toggleSound: () => {
    localStorage.setItem("isSoundEnabled", !get().isSoundEnabled);
    set({ isSoundEnabled: !get().isSoundEnabled });
  },

  emitTyping: (receiverId, isTyping) => {
    const socket = useAuthStore.getState().socket;
    if (socket) {
      socket.emit("typing", { receiverId, isTyping });
    }
  },

  setActiveTab: (tab) => set({ activeTab: tab }),
  setSelectedUser: (selectedUser) => set({ selectedUser }),

  getAllContacts: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/contacts");
      set({ allContacts: res.data, contacts: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },
  getMyChatPartners: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/chats");
      set({ chats: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessagesByUserId: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    const {authUser} = useAuthStore.getState();
    const tempId = new Date().getTime();

    const optimisticMessage = {
      _id: tempId,
      senderId: authUser._id,
      receiverId: selectedUser._id,
      text: messageData.text,
      image: messageData.image,
      replyTo: messageData.replyTo || null,
      createdAt: new Date().toISOString(),
      isOptimistic:true,
    };

    set({messages:[...messages,optimisticMessage]});


   try {
    const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData)
    set({messages: get().messages.filter(m => m._id !== tempId).concat(res.data)});
    toast.success("Message sent successfully");
    
   } catch (error) {
    set({messages: get().messages.filter(m => m._id !== tempId)});
    toast.error(error.response?.data?.message || "Something went wrong");
   }
  },

  deleteMessage: async (messageId) => {
    try {
      await axiosInstance.delete(`/messages/${messageId}`);
      set({ messages: get().messages.filter(m => m._id !== messageId) });
      toast.success("Message deleted");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete message");
    }
  },

  subscribeToMessages: () => {
    const {selectedUser , isSoundEnabled } = get();
    if(!selectedUser) return;

    const socket = useAuthStore.getState().socket;

    console.log("🔔 Subscribing to messages for user:", selectedUser.username);

    socket.on("newMessage", (newMessage) => {
      console.log("📬 Received new message:", newMessage);
      const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id;
      if(!isMessageSentFromSelectedUser) return;

      const currentMessages = get().messages;
      set({messages: [...currentMessages, newMessage]});

      if(isSoundEnabled) {
        const notificationSound = new Audio("/sounds/notification.mp3");

        notificationSound.currentTime = 0; //reset to start
        notificationSound.play().catch((e) => console.log("Audio play failed", e));
      }
    });

    socket.on("messageDeleted", ({ messageId }) => {
      set({ messages: get().messages.filter(m => m._id !== messageId) });
    });

    socket.on("userTyping", ({ senderId, isTyping }) => {
      if (senderId === selectedUser._id) {
        set({ isUserTyping: isTyping });
      }
    });

  },
  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    console.log("🔕 Unsubscribing from messages");
    socket.off("newMessage");
    socket.off("messageDeleted");
    socket.off("userTyping");
  },
}));