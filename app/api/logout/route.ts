import { NextRequest, NextResponse } from "next/server";


interface LogoutResponse {
    success: boolean,
    message?: string
}
interface ErrorResponse {
    error: string;
    success: false;
}
export async function POST(req: NextRequest): Promise<NextResponse<LogoutResponse|ErrorResponse>>{
    try {
        const res = NextResponse.json<LogoutResponse>(
            {success: true, message : "loggedOut successfully"}
        )
        res.cookies.set({
            name: "token",
            value: "",
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/",
            maxAge:0,
            
        })
        return res
    } catch (error) {
        console.error("Logout error:", error);
        return NextResponse.json<ErrorResponse>(
            {error: "failed", success: false},
            { status: 500 }
        )
    }
}