import { createSlice,PayloadAction ,configureStore} from "@reduxjs/toolkit";

type Userstate = {
    userId : string| null,
    name : string|null,
}
const initialState :Userstate = {
    userId : null,
    name: null,
}

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers : {
        setUser: (
            state,
            action : PayloadAction<Userstate>
        )=>{
            state.userId = action.payload.userId;
            state.name = action.payload.name;
        },
        clearUser :(state)=>{
            state.userId= null;
            state.name = null;
        }
    }
})
export const{
    setUser,
    clearUser
} = userSlice.actions;

export default userSlice.reducer