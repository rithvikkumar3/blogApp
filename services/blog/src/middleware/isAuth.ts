import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

export interface IUser extends Document{
    _id: string
    name: string
    email: string
    image: string
    instagram: string
    linkedin: string
    bio: string
}

export interface AuthenticatedRequest extends Request{
    user?: IUser | null
}

export const isAuth = async (
    req: AuthenticatedRequest, 
    res: Response, 
    next: NextFunction
): Promise<void> => {
    try {
        const authheader = req.headers.authorization;

        if (!authheader || !authheader.startsWith("Bearer ")) {
            res.status(401).json({
                message: "Please login - No auth header",
            })
            return
        }
        const token = authheader.split(" ")[1]
        if (!token) {
            res.status(401).json({
                message: "Please login - Token missing",
            });
            return;
        }
        const decodeValue = jwt.verify(token, process.env.JWT_SEC as string) as JwtPayload
        if(!decodeValue || !decodeValue.user){
            res.status(401).json({
                message: "Invalid Token",
            })
            return;
        }

        req.user = decodeValue.user;
        next();
    } catch (error) {
        console.log("JWT verification error: ", error);
        res.status(401).json({
            message: "Please login - Jwt error",
        })
    }
}