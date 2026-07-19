import { mongo } from "@/lib/mongo";
import User from "@/Models/User";
import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import Jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";




interface LoginRequest {
    email: string,
    password: string
}
interface LoginResponse {
    success: true,
    message: string,
    token: string,
    user: {
        id: string,
        name: string,
        email: string
    };
}

interface ErrorResponse {
    error: string,
    success: false
}

function isValidEmail(email: string): { valid: boolean, error?: string } {
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!email) {
        return { valid: false, error: "email is req" };
    }

    if (!emailRegex.test(email)) {
        return { valid: false, error: "not a std email" };
    }
    return { valid: true };
}
function isValidPassword(password: string): boolean {
    if (!password) return false;
    if (password.length < 6) return false;

    return true;
}

function getToken(userId: string, email: string) {
    const JWT_SECRET = process.env.JWT_SECRET;

    if (!JWT_SECRET) {
        throw new Error("JWT_SECRET is missing");
    }
    const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

    return Jwt.sign(
        {
            id: userId,
            email: email
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    )
}
export async function POST(req: NextRequest): Promise<NextResponse<ErrorResponse | LoginResponse>> {
    try {
        const body: LoginRequest = await req.json();
        const { email, password } = body;
        
        const {searchParams} = new URL(req.url);
        console.log("🥹🥹🥹",new URL(req.url))
        const emailValidation = isValidEmail(email);

        if (!emailValidation.valid) {
            return NextResponse.json<ErrorResponse>(
                { error: "not a valid email", success: false },
                { status: 400 }
            )
        }
        if (!isValidPassword(password)) {
            return NextResponse.json<ErrorResponse>(
                { error: "not a valid password", success: false },
                { status: 400 }
            )
        }
        await mongo();
        const user = await User.findOne({
            email: email.toLowerCase().trim()
        })

        if (!user) {
            return NextResponse.json<ErrorResponse>(
                { error: "User not found", success: false },
                { status: 401 }
            )
        }

        const isPasswordValid = await bcrypt.compare(
            password,
            user.password
        )

        if (!isPasswordValid) {
            return NextResponse.json<ErrorResponse>(
                { error: "not a valid password", success: false },
                { status: 401 }
            )
        }

        const token = getToken(user._id.toString(), user.email);

        const UserData = {
            id: user._id.toString(),
            email: user.email,
            name: user.name
        }
        const response = NextResponse.json({
            success: true,
            message: "Login successful",
            user: UserData,
        });

        response.cookies.set({
            name: "token",
            value: token,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/",
            maxAge: 60 * 60 * 24 * 7,
        });
        return response;

    } catch (error) {
        console.log("logg page error", error);
        if (error instanceof Error && error.name === "JsonWebTokenError") {
            return NextResponse.json<ErrorResponse>(
                { error: "tokken failed", success: false }
            )
        }
        return NextResponse.json<ErrorResponse>(
            { error: "Login failed. Please try again.", success: false },
            { status: 500 }
        );

    }
}
