import { NextFunction, Request, Response } from "express";
import config from "../config";
import { JwtPayload } from "jsonwebtoken";
import { prisma } from "../lib/prisma";
import { catchAsync } from "../utils/catchAsync";
import { jwtUtils } from "../utils/jwt";
import { Role } from "../../../prisma/generated/prisma/enums";

declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                email: string;
                name: string;
                role: Role;
            }
        }
    }
}

export const auth = (...requiredRoles : Role[]) => {
    return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const token = req.cookies.accessToken ?req.cookies.accessToken :
            req.headers.authorization?.startsWith("Bearer ") ? req.headers.authorization?.split(" ")[1] : 
            req.headers.authorization;

        if(!token){
            throw new Error("Authentication required. Please log in.");
        }

        const verifiedToken = jwtUtils.verifyToken(token, config.JWT_ACCESS_SECRET);

        if (!verifiedToken.success) {
            throw new Error(verifiedToken.error);
        }

        const { id, name, email, role } = verifiedToken.data as JwtPayload;

        if(requiredRoles.length && !requiredRoles.includes(role)){
            throw new Error("Access denied. You do not have permission to perform this action.");
        }

        const user = await prisma.user.findUnique({
            where: {
                id,
                name,
                email,
                role
            }
        });

        if(!user){
            throw new Error("User not found.");
        }

        if(user.status === "BLOCKED"){
            throw new Error("Your account has been banned. Please contact support.");
        }

        req.user = {
            id,
            name,
            email,
            role
        }

        next();
        
    }
)
}