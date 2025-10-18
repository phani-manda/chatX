import {aj} from '../lib/arcjet.js';
import { isSpoofedBot } from '@arcjet/inspect';

export const arcjetProtection = async (req, res, next) => {
    try {
        const decision = await aj.protect(req)

        if(decision.isDenied()){

            if(decision.reason.isRateLimit()) {
                return res.status(429).json({message:"Too many requests, try again later."});
                }
            else if(decision.reason.isBot()){
                return res.status(403).json({message:"Bot detected, access denied."});
            }
            else{
                return res.status(403).json({message:"Access denied by security policy."});
            }
        }

        if(decision.results.some(isSpoofedBot)){
            return res.status(403).json({
                error: "Spoofed not detected",
                message: "Malicious bot activity detected.",
            });
        }

        if (process.env.NODE_ENV === 'production') {
            return res.status(503).json({
                message: "Security service temporarily unavailable. Please try again later."
           });
        }

        next();
        
    } catch (error) {
        console.log("Error in arcjet protection:", error);
        next();
        
    
    }
}