
import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { mongo } from "@/lib/mongo";
import Invitation from "@/Models/Invitation";
import Projects from "@/Models/Projects";
import User from "@/Models/User";
import { io } from "socket.io-client";

export async function GET(req: NextRequest) {
    try {


        const authUser = await getAuthUser(req);
        const { searchParams } = new URL(req.url);

        const token = req.url.split("/")[5].split("?")[0].split("=")[1];
        console.log("🤣🤣🤣🤣", token)
        //a031765b9995a4ef3b048d7d15cae32cbb155784b24f6efc2665b0279078d9b3?_rsc=yJVSf2-mUsVl2a-v
        if (!authUser) {
            const loginUrl = new URL('/login', process.env.NEXT_PUBLIC_APP_URL);
            loginUrl.searchParams.set('redirect', `/invite/accept/token=${token}`);
            loginUrl.searchParams.set('message', 'Please login to accept the invitation');

            return NextResponse.redirect(loginUrl.toString());
        }
        await mongo();
        const invitations = await Invitation.find({});
        console.log(
            "ALL TOKENS =",
            invitations.map((invite:any) => ({
                token: JSON.stringify(invite.token),
                length: invite.token.length,
            }))
        );
        console.log("token = ",token);
        const invitation = await Invitation.findOne({ token });
        console.log("RESULT =", invitation);
        if (!invitation) {
            return NextResponse.redirect(
                `${process.env.NEXT_PUBLIC_APP_URL}/invite/error?not avalid invitation`
            )
        }
        if (invitation.expiresAt < new Date()) {
            return NextResponse.redirect(
                `${process.env.NEXT_PUBLIC_APP_URL}/invite/error?message=expired`
            )
        }

        if (invitation.status === "accepted") {
            return NextResponse.redirect(
                `${process.env.NEXT_PUBLIC_APP_URL}/invite/error?message=this user alredy exist`
            )
        }
        if (invitation.email !== authUser.email) {
            return NextResponse.redirect(
                `${process.env.NEXT_PUBLIC_APP_URL}/invite/error?message=this invite was sent to diff email address`
            )
        }
        const project = await Projects.findById(invitation.projectId);

        if (!project) {
            return NextResponse.redirect(
                `${process.env.NEXT_PUBLIC_APP_URL}/invite/error?message=project not found`
            )
        }
        const isCollaborator = project.collaborators.some((it: any) => it.toString() === authUser.id.toString())

        if (isCollaborator) {
            invitation.status = 'accepted';
            await invitation.save();
            return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/invite/success?message=Already the part of the project`)
        }
        project.collaborators.push(authUser.id)
        await project.save();

        invitation.status = 'accepted';

        await invitation.save();

        

        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/projects/${invitation.projectId}?invite=accepted`)


    } catch (error) {
        console.log("error in accept ", error);
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/invite/error?message=somethingggg wentrr wring broee`)
    }
}