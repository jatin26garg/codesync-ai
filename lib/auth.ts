import { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import Jwt  from "jsonwebtoken";

const JWT_SECRET  = process.env.JWT_SECRET ;
if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined");
}
export interface AuthUser{
    id: string,
    email: string,
    
} 
export function getAuthUser(req :NextRequest) : AuthUser|null{
    try {
        const token = req.cookies.get("token")?.value;
        if(!token){
            return null;
        }
        const decoded = Jwt.verify(token,JWT_SECRET);
        if(typeof decoded === "string"){
            return null;
        }
        return decoded as AuthUser;
    } catch (error) {
        return null;
    }
}

export function withAuth(handler: Function){
    return async function (req: NextRequest) {
        const user =  getAuthUser(req);
        if(!user){
            return NextResponse.json(
                {error : "unauthorized", success: false},
                {status : 401}
            )
        }
        (req as any ).user = user
        return handler(req);
    }
}