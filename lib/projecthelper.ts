import Projects from "@/Models/Projects";
import { mongo } from "./mongo";
import mongoose from "mongoose";

export async function checkProjectAccess(projectId: string, userId: string) {
    try {

        if (!mongoose.Types.ObjectId.isValid(projectId)) {
            return null;
        }
        const project = await Projects.findById(projectId);
        if (!project) {
            return {
                hasAccess: false,
                error: 'project not found'
            }
        }
        if (project.ownerId.toString() === userId.toString()) {
            return {
                hasAccess: true,
                role: "owner"
            }
        }
        const collaborators = project.collaborators.some((some: any) => some.toString() === userId.toString());
        if (!collaborators) {
            return {
                hasAccess: 'false',
                error: 'access denied'
            }
        }
        return {
            hasAccess: true,
            project,
            role: collaborators
        };


    } catch (error) {
        return { hasAccess: false, error: 'Error checking access' };

    }

}