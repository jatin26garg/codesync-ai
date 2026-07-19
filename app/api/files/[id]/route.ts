import { getAuthUser } from "@/lib/auth";
import { NextResponse, NextRequest } from "next/server";
import { mongo } from "@/lib/mongo";
import mongoose from "mongoose";
import Files from "@/Models/Files";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const authUser = getAuthUser(req);
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

        const file = await Files.findById(id)
        console.log("GET FILE+ ",file)
        if (!file) {
            return NextResponse.json(
                { success: false, error: " file not found" },
                { status: 402 }
            )
        }
        
        console.log("content = =======",file)
        return NextResponse.json(
            {
                success: true,
                files: {
                    id: id,
                    name: file.name,
                    content: file.content,
                    language: file.language,
                    createdAt: file.createdAt,
                    updatedAt: file.updatedAt,

                }
            }
        )

    } catch (error) {

    }
}
const ispossible = async (parentId: string, id: string) => {
    const files = await Files.find({ parentId: id });
    for (let i = 0; i < files.length; i++) {
        if (files[i]._id.toString() === parentId) {
            return false;
        }
        const possible = await ispossible(parentId, files[i]._id.toString());
        if (possible === false) return false;

    }
    return true;
}
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const authUser = getAuthUser(req);
        const { id } = await params;
        console.log("@@@@@@@@@@@");
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



        const file = await Files.findById(id);
        console.log("PATCH", file)
        if (!file) {
            return NextResponse.json(
                { success: false, error: "File not found" },
                { status: 404 }
            );
        }
        const { content, name, parentId } = await req.json();
        console.log("PATCH data= ", content)
        console.log("PATCH data= ", name)
        console.log("PATCH data= ", parentId)
        if (content !== undefined)
            file.content = content;
            console.log("PATCH file",file.content)

        if (name !== undefined) file.name = name

        if (parentId !== undefined) {
            if (parentId !== null) {
                const parentfile = await Files.findById(parentId)
                if (parentId === id) {
                    return NextResponse.json(
                        { success: false, error: "cant drop into the same file" },
                        { status: 404 }
                    );
                }
                else if (!parentfile) {
                    return NextResponse.json(
                        { success: false, error: "cant drop into the  file" },
                        { status: 404 }
                    );
                }
                else if (!parentfile.isFolder) {
                    return NextResponse.json(
                        {
                            success: false,
                            error: "Cannot drop into a file"
                        },
                        { status: 400 }
                    );
                }
                else {
                    if (!(await ispossible(parentId, id))) {
                        return NextResponse.json(
                            { success: false, error: "cant drop into the  file" },
                            { status: 400 }
                        );
                    }
                }
            }
            file.parentId = parentId;

        }

        await file.save();
        console.log("PATCH update", file)
        return NextResponse.json(
            {
                success: true,
                file: {
                    id: file._id.toString(),
                    content: file.content,
                }
            },
            { status: 200 }
        )

    } catch (error) {
        return NextResponse.json(
            { success: false, error: "cant save" },
            { status: 500 }
        )
    }
}
const deletefolder = async (id: string) => {
    let children = await Files.find({ parentId: id });

    for (let i = 0; i < children.length; i++) {
        if (children[i].isFolder) {
            await deletefolder(children[i]._id.toString());

        }
        await Files.findByIdAndDelete(children[i]._id);
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const authUser = getAuthUser(req);
        const { id } = await params;
        if (!authUser) {
            return NextResponse.json({
                success: false, error: "Unauthorized"
            }, { status: 401 })
        }
        await mongo();
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({
                success: false, error: "not a valid id"
            }, { status: 400 })
        }

        const file = await Files.findById(id);
        if (!file) {
            return NextResponse.json({
                success: false, error: "cant delete"
            }, { status: 403 })
        }
        if (file.isFolder) {
            await deletefolder(file.id.toString());

        }
        await file.deleteOne();
        return NextResponse.json({
            success: true,
            deletedId: id,
        }, { status: 200 })
    } catch (error) {
        return NextResponse.json(
            { success: false, error: "cant delete" },
            { status: 500 }
        )
    }

}