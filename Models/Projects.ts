import mongoose, { Schema } from "mongoose";


export interface IProjects extends mongoose.Document {
    name: string;
    email: string;
    description: string;
    ownerId: mongoose.Types.ObjectId;
    collaborators: mongoose.Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
}

const ProjectsSchema = new mongoose.Schema<IProjects>({

    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    ownerId: {
        type: Schema.Types.ObjectId,
        ref: "User",

        required: true,
    },
    collaborators: {
        type: [Schema.Types.ObjectId],
        ref: "User",
        default: [],
        index: true,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
    createdAt:{
        type: Date,
        default: Date.now,
    }

})
const Projects = mongoose.models.Projects ||mongoose.model<IProjects>('Projects', ProjectsSchema);
export default Projects;