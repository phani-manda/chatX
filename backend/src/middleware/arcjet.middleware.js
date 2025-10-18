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
                message: "Maliciour bot activity detected.",
            });
        }

        next();
        
    } catch (error) {
        console.log("Error in arcjet protection:", error);
        next();
        
    
    }
}