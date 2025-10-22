import {create} from 'zustand';
import {axiosInstance} from '../lib/axios.js';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:3000" : "/";


export const useAuthStore = create((set, get) => ({
    authUser:null,
    isCheckingAuth: true,
    isSigningUp: false,
    isLogingIn: false,
    socket: null,
    onlineUsers: [],


    checkAuth: async () => {
        try {
            const res = await axiosInstance.get("/auth/check");
            set({authUser: res.data});
            console.log("✅ Auth check successful. User:", res.data.username);
            get().connectSocket();

            
        } catch (error) {
            console.log("❌ Error in auth check:", error.message);
            set({authUser: null});  
        }
        finally{
            set({isCheckingAuth: false});
        }

    },

    signup: async(data) => {
        set({isSigningUp: true})
        try {
            const res = await axiosInstance.post("/auth/signup", data);
            set({authUser: res.data});
            console.log("✅ Signup successful. User:", res.data.username);

            toast.success("Account created successfully!")

            get().connectSocket();
            
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to create account");
            console.log("❌ Error in signup:", error.message);
            
        } finally{
            set({isSigningUp: false});
        
        }
    },


    login: async (data) => {
        set({ isLoggingIn: true });
        try {
        const res = await axiosInstance.post("/auth/login", data);
        set({ authUser: res.data });
        console.log("✅ Login successful. User:", res.data.username);

        toast.success("Logged in successfully");
        
        get().connectSocket();

        } catch (error) {
        toast.error(error.response.data.message);
        console.log("❌ Error in login:", error.message);
        } finally {
        set({ isLoggingIn: false });
        }
    },

    logout: async () => {
        try {
            console.log("🚪 Logging out...");
            await axiosInstance.post("/auth/logout");
            set({ authUser: null });
            toast.success("Logged out successfully");
            get().disconnectSocket();
            console.log("✅ Logout successful");
            
        } catch (error) {
            toast.error(error.response.data.message);
            console.log("❌ Error in logout:", error.message);     
        }
    },

    updateProfile: async(data) => {
        try {
            const res = await axiosInstance.put("/auth/update-profile", data);
            set({authUser: res.data});
            toast.success("Profile updated successfully!");
        } catch (error) {
            console.log("error in update profile:", error);
            toast.error(error.response.data.message);
            
        }
    },

    connectSocket: () => {
        const {authUser} = get()
        if(!authUser || get().socket?.connected) return;

        console.log("🔌 Attempting to connect socket for user:", authUser.username);

        const socket = io(BASE_URL, {
            withCredentials:true // this ensures cookies are sent with the connection
        })
        
        socket.on("connect", () => {
            console.log("✅ Socket connected successfully. Socket ID:", socket.id);
        });

        socket.on("connect_error", (error) => {
            console.error("❌ Socket connection error:", error.message);
        });

        socket.connect()

        set({socket});

        //listen for online users event
        socket.on("getOnlineUsers", (userIds) => {
            console.log("👥 Online users updated:", userIds.length, "users online");
            set({onlineUsers: userIds});
        })
    },

    disconnectSocket: () => {
        if(get().socket?.connected){
            console.log("🔌 Disconnecting socket...");
            get().socket.disconnect();
            console.log("✅ Socket disconnected");
        }
    },
    
}));