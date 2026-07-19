import mongoose from "mongoose";
import { Schema } from "mongoose";

interface IMessage extends Document {
    projectId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    message: string;
    createdAt: Date;
}

const MessageSchema = new mongoose.Schema<IMessage>({

        projectId: {
            type: Schema.Types.ObjectId,
            ref: "Projects",
            required: true,
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        message: {
            type: String,
            required: true,
            trim: true,
        },
    },
    {
        timestamps: true
    }

)
const Message = mongoose.models.Message || mongoose.model<IMessage>('Message',MessageSchema);
export default Message;