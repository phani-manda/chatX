import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";

export const useGroupStore = create((set, get) => ({
  groups: [],
  selectedGroup: null,
  groupMessages: [],
  isGroupsLoading: false,
  isGroupMessagesLoading: false,
  isGroupUserTyping: false,
  typingUsers: [],
  replyingTo: null,

  setSelectedGroup: (selectedGroup) => set({ selectedGroup }),
  setReplyingTo: (message) => set({ replyingTo: message }),

  emitGroupTyping: (groupId, isTyping) => {
    const socket = useAuthStore.getState().socket;
    if (socket) {
      socket.emit("groupTyping", { groupId, isTyping });
    }
  },

  // Get all groups for current user
  getUserGroups: async () => {
    set({ isGroupsLoading: true });
    try {
      const res = await axiosInstance.get("/groups");
      set({ groups: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch groups");
    } finally {
      set({ isGroupsLoading: false });
    }
  },

  // Create new group
  createGroup: async (groupData) => {
    try {
      const res = await axiosInstance.post("/groups/create", groupData);
      set({ groups: [res.data, ...get().groups] });
      toast.success("Group created successfully!");
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create group");
      throw error;
    }
  },

  // Get group messages
  getGroupMessages: async (groupId) => {
    set({ isGroupMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/groups/${groupId}/messages`);
      set({ groupMessages: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch messages");
    } finally {
      set({ isGroupMessagesLoading: false });
    }
  },

  // Send group message
  sendGroupMessage: async (groupId, messageData) => {
    const { selectedGroup, groupMessages } = get();
    const { authUser } = useAuthStore.getState();
    const tempId = new Date().getTime();

    const optimisticMessage = {
      _id: tempId,
      groupId,
      senderId: {
        _id: authUser._id,
        username: authUser.username,
        profilePic: authUser.profilePic
      },
      text: messageData.text,
      image: messageData.image,
      replyTo: messageData.replyTo || null,
      createdAt: new Date().toISOString(),
      isOptimistic: true,
    };

    set({ groupMessages: [...groupMessages, optimisticMessage] });

    try {
      const res = await axiosInstance.post(`/groups/${groupId}/messages`, messageData);
      set({
        groupMessages: get().groupMessages.filter(m => m._id !== tempId).concat(res.data)
      });
    } catch (error) {
      set({ groupMessages: get().groupMessages.filter(m => m._id !== tempId) });
      toast.error(error.response?.data?.message || "Failed to send message");
    }
  },

  deleteGroupMessage: async (groupId, messageId) => {
    try {
      await axiosInstance.delete(`/groups/${groupId}/messages/${messageId}`);
      set({ groupMessages: get().groupMessages.filter(m => m._id !== messageId) });
      toast.success("Message deleted");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete message");
    }
  },

  // Subscribe to group messages
  subscribeToGroupMessages: () => {
    const { selectedGroup } = get();
    if (!selectedGroup) return;

    const socket = useAuthStore.getState().socket;
    const { authUser } = useAuthStore.getState();

    console.log("🔔 Subscribing to group messages for:", selectedGroup.name);

    socket.on("newGroupMessage", ({ groupId, message }) => {
      if (groupId === selectedGroup._id) {
        const currentMessages = get().groupMessages;
        // Avoid duplicates
        if (!currentMessages.find(m => m._id === message._id)) {
          set({ groupMessages: [...currentMessages, message] });
        }
      }
      
      // Update group list with new message
      const groups = get().groups;
      const updatedGroups = groups.map(g =>
        g._id === groupId ? { ...g, lastMessage: message, updatedAt: new Date() } : g
      );
      set({ groups: updatedGroups.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)) });
    });

    socket.on("groupMessageDeleted", ({ groupId, messageId }) => {
      if (groupId === selectedGroup._id) {
        set({ groupMessages: get().groupMessages.filter(m => m._id !== messageId) });
      }
    });

    socket.on("groupUpdated", (updatedGroup) => {
      const groups = get().groups;
      const updatedGroups = groups.map(g =>
        g._id === updatedGroup._id ? updatedGroup : g
      );
      set({ groups: updatedGroups });

      if (selectedGroup && selectedGroup._id === updatedGroup._id) {
        set({ selectedGroup: updatedGroup });
      }
    });

    socket.on("newGroup", (newGroup) => {
      set({ groups: [newGroup, ...get().groups] });
    });

    socket.on("removedFromGroup", (groupId) => {
      set({ groups: get().groups.filter(g => g._id !== groupId) });
      if (selectedGroup && selectedGroup._id === groupId) {
        set({ selectedGroup: null, groupMessages: [] });
      }
      toast.info("You have been removed from a group");
    });

    socket.on("groupUserTyping", ({ groupId, userId, username, isTyping }) => {
      if (groupId === selectedGroup._id && userId !== authUser._id) {
        if (isTyping) {
          set({
            typingUsers: [...new Set([...get().typingUsers, username])]
          });
        } else {
          set({
            typingUsers: get().typingUsers.filter(u => u !== username)
          });
        }
      }
    });
  },

  unsubscribeFromGroupMessages: () => {
    const socket = useAuthStore.getState().socket;
    console.log("🔕 Unsubscribing from group messages");
    socket.off("newGroupMessage");
    socket.off("groupMessageDeleted");
    socket.off("groupUpdated");
    socket.off("newGroup");
    socket.off("removedFromGroup");
    socket.off("groupUserTyping");
    set({ typingUsers: [] });
  },

  // Add member to group
  addGroupMember: async (groupId, userId) => {
    try {
      const res = await axiosInstance.post(`/groups/${groupId}/members/add`, { userId });
      const groups = get().groups.map(g => g._id === groupId ? res.data : g);
      set({ groups });
      if (get().selectedGroup?._id === groupId) {
        set({ selectedGroup: res.data });
      }
      toast.success("Member added successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add member");
    }
  },

  // Remove member from group
  removeGroupMember: async (groupId, userId) => {
    try {
      const res = await axiosInstance.post(`/groups/${groupId}/members/remove`, { userId });
      const groups = get().groups.map(g => g._id === groupId ? res.data : g);
      set({ groups });
      if (get().selectedGroup?._id === groupId) {
        set({ selectedGroup: res.data });
      }
      toast.success("Member removed successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to remove member");
    }
  },

  // Update group info
  updateGroup: async (groupId, groupData) => {
    try {
      const res = await axiosInstance.put(`/groups/${groupId}`, groupData);
      const groups = get().groups.map(g => g._id === groupId ? res.data : g);
      set({ groups });
      if (get().selectedGroup?._id === groupId) {
        set({ selectedGroup: res.data });
      }
      toast.success("Group updated successfully!");
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update group");
      throw error;
    }
  },

  // Leave group
  leaveGroup: async (groupId) => {
    try {
      await axiosInstance.post(`/groups/${groupId}/leave`);
      set({ groups: get().groups.filter(g => g._id !== groupId) });
      if (get().selectedGroup?._id === groupId) {
        set({ selectedGroup: null, groupMessages: [] });
      }
      toast.success("Left group successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to leave group");
    }
  },
}));
