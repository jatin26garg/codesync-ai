import bcrypt from "bcryptjs";
import mongoose from "mongoose";


export interface IUser extends mongoose.Document {
    name: string;
    email: string;
    password: string;
    createdAt: Date;
}

const Userschema =new mongoose.Schema<IUser>({
    name: {
        type:String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        minlength: [6, 'Password must be at least 6 characters'],
        
    },
    createdAt :{
        type:Date,
     default: Date.now
    }
})

Userschema.pre('save', async function () {
    if(!this.isModified('password')){
        return ;
    }
   
        const salt = await  bcrypt.genSalt(10);
        this.password  = await bcrypt.hash(this.password,salt);
        
   
})


const User = mongoose.models.User ||mongoose.model<IUser>('User', Userschema);
export default User;