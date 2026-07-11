import User from "@/Models/User";
import { mongo } from "@/lib/mongo";
import { NextRequest, NextResponse } from "next/server";
import { IUser } from "@/Models/User";

interface RegisterRequest {
    email: string,
    name: string,
    password: string
}
interface UserResponse {
    id: string,
    name: string,
    email: string,
    createdAt: Date
}

interface SuccesResponse {
    success: true,
    message: string,
    user?: UserResponse
}
interface ErrorResponse {
    error: string,
    details: string[] | Record<string, unknown>
}


export async function POST(req: NextRequest): Promise<NextResponse<SuccesResponse | ErrorResponse>> {
    try {
        await mongo();
        const body: RegisterRequest = await req.json();
        const { email, password, name } = body;

        if (!email || !name || !password) {
            return NextResponse.json<ErrorResponse>(
                {
                    error: "password is too short",
                    details: {
                        email: !email ? "email is req" : undefined,
                        name: !name ? "name is req" : undefined,
                        password: !password ? "password is req" : undefined
                    }
                },
                { status: 400 });
        }


        if (password.length < 6) {
            return NextResponse.json<ErrorResponse>(
                {
                    error: "password is too short",
                    details: { password: "len is too small" }
                },
                { status: 400 });
        }

        const emailRegex = /^\S+@\S+\.\S+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json<ErrorResponse>(
                {
                    error: "not a valid email",
                    details: { email: "wrong email format" }
                },
                { status: 400 }

            )
        }

        const exist = await User.findOne({ email: email.toLowerCase().trim() });

        if (exist) {
            return NextResponse.json<ErrorResponse>({ error: "User already exist", details: {} }, { status: 409 });
        }


        const newuser = new User({
            email: email.toLowerCase().trim(),
            password,
            name
        })


        const savedUser = await newuser.save();

        const userResponse: UserResponse = {
            id: savedUser._id.toString(),
            name: savedUser.name,
            email: savedUser.email,
            createdAt: savedUser.createdAt
        }
        return NextResponse.json<SuccesResponse>({
            success: true,
            message: "account created successfully",
            user: userResponse

        },
            { status: 201 }
        )
    }
    catch (error: unknown) {
        console.error("reg error", error);
        if (error instanceof Error && 'code' in error && error.code === 11000) {
            return NextResponse.json<ErrorResponse>(
                { error: "Email already exists", details: {} },
                { status: 409 }


            );
        }
        if (error instanceof Error && error.name === 'ValidationError') {
            return NextResponse.json<ErrorResponse>(
                {
                    error: "Validation failed",
                    details: { message: error.message }
                },
                { status: 400 }
            );
        }
        const errorMessage = error instanceof Error ? error.message : "Internal server error";

        return NextResponse.json<ErrorResponse>(
            {
                error: "Registration failed",
                details: { message: errorMessage }
            },
            { status: 500 }
        );
    }

}