import mongoose, { Schema } from "mongoose";

export interface IFiles extends mongoose.Document {
    name: string,
    content: string,
    projectId: mongoose.Types.ObjectId,
    parentId: mongoose.Types.ObjectId,
    isFolder: boolean,
    language: string;
    createdBy: mongoose.Types.ObjectId,
    createdAt: Date,
    updatedAt: Date,
}

const FilesSchema = new mongoose.Schema<IFiles>({

    name: {
        type: String,
        required: true,
        minlength: 1,
        maxlength: 100,
        index: true
    },
    content: {
        type: String,
        default: "",
    },
    projectId: {
        type: Schema.Types.ObjectId,
        ref: "Projects",
        required: true,
        index: true,
    },
    parentId: {
        type: Schema.Types.ObjectId,
        ref: "Files",
        default: null,
        index: true,
    },
    isFolder: {
        type: Boolean,
        required: true,
        default: false,
        index: true,
    },
    language: {
        type: String,
        default: "text",
        enum: [
            "text",
            "javascript",
            "typescript",
            "python",
            "java",
            "cpp",
            "c",
            "csharp",
            "go",
            "rust",
            "php",
            "ruby",
            "swift",
            "kotlin",
            "html",
            "css",
            "scss",
            "json",
            "xml",
            "yaml",
            "markdown",
            "sql",
            "shell",
            "dockerfile",
            "gitignore",
            "env",
            "plaintext",
        ],
    },

    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    }
},
{timestamps: true})
FilesSchema.index({ projectId: 1, isFolder: 1 });
FilesSchema.index({ projectId: 1, parentId: 1 });
FilesSchema.index({ projectId: 1, parentId: 1, name: 1 }, { unique: true })
const Files = mongoose.models.Files || mongoose.model<IFiles>('Files', FilesSchema);
export default Files;