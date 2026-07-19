import { getAuthUser } from "@/lib/auth";
import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import Invitation from "@/Models/Invitation";
import { mongo } from "@/lib/mongo";
import mongoose from "mongoose";
import crypto from "crypto"
import Projects from "@/Models/Projects";
import User from "@/Models/User";
import { sendInvitationEmail } from "@/lib/email";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {

    try {

        const authUser = getAuthUser(req);
        const { id } = await params;
        // if (!authUser) {
        //     return NextResponse.json(
        //         { success: false, error: "unauthorized" },
        //         { status: 401 }
        //     )
        // }
        await mongo();


        const { email, role = "collaborator" } = await req.json();


        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                { success: false, error: "invalid ID" },
                { status: 400 }
            )
        }

        if (!email) {
            return NextResponse.json(
                { success: false, error: "Email is req" },
                { status: 400 }
            )
        }

        const project = await Projects.findById(id);
        if (!project) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Project not found",
                },
                { status: 404 }
            );
        }


        console.log("😡😡😡INVITE API HIT", email);


        const isCollaborator = project.collaborators.some((ownerId: any) => ownerId.toString() === user._id.toString());
        if (isCollaborator) {
            return NextResponse.json(
                {
                    success: false,
                    message: "User is a collaborator",
                },
                { status: 400 }
            );
        }
        const existingCollaborator = project.collaborators.some((email: any) => email.toString() === email);
        if (existingCollaborator) {
            return NextResponse.json(
                { error: "User is already a collaborator", success: false },
                { status: 400 }
            );
        }
         

        const existingInvite  = await Invitation.findOne({
            email :email.toLowerCase(),
            projectId: id, 
            status: "pending"
        })
        if(existingInvite){
            return NextResponse.json({
                success: false, error : "invitation already exists"
            },{status: 400})
        }

        const token = crypto.randomBytes(32).toString("hex");
        const expiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000);

        const invitation = await Invitation.create({
            projectId: project._id,
            invitedBy: project.ownerId,
            email: email.toLowerCase(),
            token,
            expiresAt
        });
        await sendInvitationEmail(
            email,
            project.name,
            token,
            project.ownerId.name,
        )

        return NextResponse.json({
            success: true,
            email : email,
            message: "Invitation created",
            invitationId: invitation._id,
            token,
        });
    } catch (error) {
        console.error("invitattion ERROR:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Something went wrong",
            },
            { status: 500 }
        )
    }
}