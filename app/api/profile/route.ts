import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import User from "@/Models/User";
import { mongo } from "@/lib/mongo";

interface MeResponse {
    success: true;
    user: {
        id: string;
        name: string;
        email: string;
        createdAt: Date;
    };
}


export async function GET(req: NextRequest) {
    try {

        const authUser = getAuthUser(req);
        if (!authUser) {
            return NextResponse.json(
                { error: "Unauthorized", success: false },
                { status: 401 }
            )
        }
        await mongo();

        const user  = await  User.findById(authUser.id).select('-password');
        if (!user) {
            return NextResponse.json(
                { error: "user not found ", success: false },
                { status: 404 }
            )
        }
        return NextResponse.json<MeResponse>(
            {
                success: true,
                user: {
                    id: user._id.toString(),
                    name: user.name,
                    email: user.email,
                    createdAt: user.createdAt

                }
            }
        )

    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch profile", success: false },
            { status: 500 }
        );
    }
}