import { getAuthUser } from "@/lib/auth";
import Projects from "@/Models/Projects";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { mongo } from "@/lib/mongo";
import mongoose from "mongoose";


export interface ProjectResponse {
    id: string;
    name: string;
    email: string,
    description: string;
    owner: {
        id: string,
        name: string,
        email: string,
    }
    role: string,
    collaborators: {
        id: string,
        name : string,
        email: string,
    }[];
    createdAt: Date;
    updatedAt: Date;
}
export interface Iuser{
    _id: mongoose.Types.ObjectId,
    name: string,
    email: string,

}

export async function POST(req: NextRequest) {
    try {
        const authUser = getAuthUser(req);
        if (!authUser) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }
        await mongo();
        const { name, description } = await req.json();
        const project = new Projects({
            name,
            description,
            email: authUser.email,
            ownerId: authUser.id,
        })
        await project.save();
        return NextResponse.json({
            success: true,
            project,
        });


    } catch (error) {
        if (error instanceof mongoose.Error.ValidationError) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Validation failed",
                    details: Object.values(error.errors).map(err => err.message)
                },
                { status: 400 }
            );
        }
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : "Failed to create project",
            },
            { status: 500 }
        );
    }
}


export async function GET(req: NextRequest) {
    try {
        const authUser = getAuthUser(req);
        if (!authUser) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        await mongo();

        const projects = await Projects.find({
            $or:[{ownerId: authUser.id},{collaborators:authUser.id}]
        }).sort({ updatedAt: -1 }).populate("ownerId", "name email").populate("collaborators", "name email")

        const ProjectResponse: ProjectResponse[] = projects.map((project) => {
            const owner = project.ownerId as any;
            const isOwner = project.ownerId.toString()===authUser.id.toString();

            const collaborators = project.collaborators as any[];

            return {
                id : project._id.toString(),
                name :project.name,
            
                email : project.email,
                description :project.description,
                owner : {
                    id : owner._id.toString(),
                    name: owner.name,
                    email : owner.email
                },

                collaborators : collaborators.map((collab: Iuser )=> ({
                    id:collab._id.toString(),
                    name :collab.name,
                    email : collab.email,
                })),
                role: isOwner?"owner":"collaborator",
                createdAt : project.createdAt,
                updatedAt : project.updatedAt,
            }
        });
        return NextResponse.json(
            {success: true, projects : ProjectResponse},
            {status : 200}
        )

    } catch (error) {
        console.log("projects page error === ", error);
        return NextResponse.json(
            {success : false, error : "failed to fetch"},
            {status : 500},
        )
    }
}

