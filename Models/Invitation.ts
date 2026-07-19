import mongoose from "mongoose";
import { Schema } from "mongoose";

interface IInvitations extends Document{
    projectId : mongoose.Types.ObjectId,
    invitedBy : mongoose.Types.ObjectId,
    email : string,
    token : string,
    expiresAt : Date,
    status: "pending"|"accepted"|"rejected",
}

const InvitationSchema = new mongoose.Schema<IInvitations>({

    projectId :{
        type: Schema.Types.ObjectId,
        ref :"Projects",
        required: true,
    },
    invitedBy : {
        type: Schema.Types.ObjectId,
        ref:"User",
        required: true
    },
    email: {
        type: String,
        required: true,
        lowercase : true,
        trim : true,
    },
    token:{
        type : String,
        required: true,
        unique :true,
    },
    expiresAt : {
        type :Date,
        required : true,
    },
    status :{
        type : String,
        enum:["pending","accepted","rejected"],
        default:"pending"
    }
},
{timestamps :true});

const Invitation = mongoose.models.Invitation || mongoose.model<IInvitations>('Invitation',InvitationSchema);
export default Invitation;