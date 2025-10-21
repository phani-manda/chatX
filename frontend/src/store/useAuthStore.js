import {create} from 'zustand';
import {axiosInstance} from '../lib/axios.js';
import toast from 'react-hot-toast';


export const useAuthStore = create((set) => ({
    authUser:null,
    isCheckingAuth: true,
    isSigningUp: false,


    checkAuth: async () => {
        try {
            const res = await axiosInstance.get("/auth/check");
            set({authUser: res.data, isCheckingAuth: false});
            
        } catch (error) {
            console.log("Error in authcheck:", error);
            set({authUser: null, isCheckingAuth: false});  
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

            toast.success("Account created successfully!")
            
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to create account");
            console.log("Error in signup:", error);
            
        } finally{
            set({isSigningUp: false});
        
        }
    }

}));