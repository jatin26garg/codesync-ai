import { NextResponse, NextRequest } from "next/server";
import { mongo } from "@/lib/mongo";
import Message from "@/Models/Message";
import { getAuthUser } from "@/lib/auth";
import mongoose from "mongoose";
import { checkProjectAccess } from "@/lib/projecthelper";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {

    try {
        const authUser = await getAuthUser(req);
        const { id } = await params;
        if (!authUser) {
            return NextResponse.json(
                { success: false, error: "unauthorized" },
                { status: 401 }
            )
        }
        await mongo();
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                { success: false, error: "invalid ID" },
                { status: 400 }
            )
        }
        const access = await checkProjectAccess(id, authUser.id);
        if (!access) {
            return NextResponse.json(
                {
                    success: false,
                    error: "project does not exist",
                },
                { status: 404 }
            );
        }
        if (!access.hasAccess) {
            return NextResponse.json(
                {
                    success: false,
                    error: "not a valid user",
                },
                { status: 403 }
            );
        }

        const messages = await Message.find({ projectId: id }).populate("userId", "name").sort({ createdAt: -1 });

        return NextResponse.json({
            success: true, messages
        }, { status: 200 })
    } catch (error) {
        console.log("MEssage  error = ", error);
        return NextResponse.json(
            { success: false, error: "try again later" },
            { status: 500 }
        )
    }
}