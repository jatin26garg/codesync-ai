import { getAuthUser } from "@/lib/auth";
import Files from "@/Models/Files";
import { mongo } from "@/lib/mongo";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import Projects from "@/Models/Projects";
import mongoose from "mongoose";
import { checkProjectAccess } from "@/lib/projecthelper";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {

        const authUser = getAuthUser(req);
        const { id } = await params;
        if (!authUser) {
            return NextResponse.json(
                { success: false, error: "Unaauthorized" },
                { status: 401 }
            )
        }
        await mongo();

        const project = await Projects.findById(id);
        // console.log("project = ", project)
        if (!project) {
            return NextResponse.json(
                { success: false, error: "Project not found" },
                { status: 404 }
            );
        }

        if (project.ownerId.toString() !== authUser.id) {
            return NextResponse.json(
                { success: false, error: "Forbidden" },
                { status: 403 }
            );
        }

        // console.log("here--")
        const { name, parentId, isfolder, language, content } = await req.json();
        // console.log("here--")
        console.log("isfolder = ", isfolder);

        if (!name || name.trim() === "") {
            return NextResponse.json(
                { success: false, error: "name is req" },
                { status: 400 }
            )
        }
        if (parentId) {
            const parent = await Files.findById(parentId)
            console.log("parent = ", parent)
            if (!parent || !parent.isFolder) {
                return NextResponse.json(
                    { success: false, error: "Cant create" },
                    { status: 400 }
                )
            }
            if (parent.projectId.toString() !== id) {
                return NextResponse.json({
                    success: false, error: "Parent folder doesn't belong to this project"
                }, { status: 400 })
            }
        }
        const file = new Files({
            name,
            projectId: id,
            parentId: parentId || null,
            isFolder: isfolder || false,
            language: isfolder ? "plaintext" : (language || "text"),
            content: content || "",
            createdBy: authUser.id,
        })

        await file.save();
        return NextResponse.json({
            success: true,
            message: `${isfolder ? "plaintext" : "file"} created successfully`,
            file: {
                id: file._id.toString(),
                name: file.name,
                parentId: file.parentId,
                isFolder: file.isFolder,
                language: file.language,
                createdAt: file.createdAt,
                updatedAt: file.updatedAt
            }

        }, { status: 201 })
    } catch (error) {
        console.error("Create file error:", error);
        if (error instanceof Error && "code" in error && error.code === 11000) {
            return NextResponse.json({
                success: false,
                error: "cant create duplicate file"
            }, { status: 409 })
        }
        return NextResponse.json(
            {
                success: false,
                error: "Internal Server Error"
            },
            { status: 500 }
        );


    }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const authUser = await getAuthUser(req);

        const { id } = await params;
        if (!authUser) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            )
        }
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                { success: false, errror: "not a valid id" },
                { status: 400 }
            )
        }
        await mongo();
        // console.log("id= ",id )
        const access = await checkProjectAccess(id, authUser.id);

        if (!access) {
            return NextResponse.json(
                { success: false, error: "project not found" },
                { status: 404 }
            )
        }

        if (!access.hasAccess) {
            return NextResponse.json(
                { success: false, error: "access denied" },
                { status: 403 }
            )
        }

        const files = await Files.find({ projectId: id }).sort({ isFolder: -1, name: -1 });

        if (files.length === 0) {
            return NextResponse.json({
                success: false, error: "files not found",
            }, { status: 400 })
        }
        // console.log("files  = ", files)
        const response = files.map((file => ({
            id: file._id.toString(),
            name: file.name,
            parentId: file.parentId?.toString(),
            isFolder: file.isFolder,
            language: file.language,
            createdAt: file.createdAt,
            updatedAt: file.updatedAt,
        })))
        console.log("response  = ", response)
        return NextResponse.json({
            success: true, files: response
        }, { status: 200 })
    } catch (error) {
        console.error("Create file error:", error);
        if (error instanceof Error && "code" in error && error.code === 11000) {
            return NextResponse.json({
                success: false,
                error: "cant "
            }, { status: 409 })
        }
    }
}

