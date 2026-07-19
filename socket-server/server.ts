import { createServer } from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../Models/User";
import Message from "../Models/Message";



dotenv.config({
    path: ".env.local",
});
import { mongo } from "../lib/mongo";
import { getOrCreateTerminal } from "@/lib/terminal";
const httpServer = createServer();

const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:3000",
        credentials: true,
    },
});

const projectUsers = new Map<
    string,
    Map<string, { id: string; name: string }>
>();

io.use((socket, next) => {
    try {

        const cookie = socket.handshake.headers.cookie;

        if (!cookie) {
            console.log("No cookies ");
            return next(new Error("Unauthorised"));
        }

        const token = cookie.split(';').find((row) => row.trim().startsWith("token="))?.split("=")[1];

        if (!token) {
            console.log("token not found");
            return next(new Error("Unauthorized"));
        }
        const JWT_SECRET = process.env.JWT_SECRET
        if (!JWT_SECRET) {
            console.log("JWT_SECRET not found");
            return next(new Error("Server configuration error"));
        }
        const decoded = jwt.verify(token, JWT_SECRET);
        socket.data.user = decoded;
        console.log("reached here");
        next();

    } catch (error) {
        next(new Error("Unauthorized"));
    }
})
function adduser(projectId: string, socketId: string, UserId: string, UserName: string) {
    if (!projectUsers.has(projectId)) {
        projectUsers.set(projectId, new Map());
    }
    projectUsers.get(projectId)!.set(socketId, { id: UserId, name: UserName })
}
function getusers(projectId: string) {

    if (!projectUsers.has(projectId)) return [];

    const usermap = projectUsers.get(projectId)

    const users: { name: string, id: string }[] = [];
    if (usermap === undefined) return []
    for (const [key, value] of usermap) {
        users.push({ name: value.name, id: value.id });
    }
    return users;

}
function removeUser(fileId: string, id: string, socketId: string) {
    if (!projectUsers.has(fileId)) return;

    const usermap = projectUsers.get(fileId);
    if (!usermap) return;
    usermap.delete(socketId);
    if (usermap.size === 0) {
        projectUsers.delete(fileId);
    }
}
io.on("connection", async (socket) => {

    console.log("client connected", socket.id);
    console.log("data = ", socket.data.user);

    let currProjectId: string | null = null;
    let UserName: string | any = "Unknown"
    let UserId = socket.data.user?.id;

    if (socket.data.user?.id) {
        try {

            const DBdata = await User.findById(socket.data.user.id).select("name");
            console.log("mongoData = ", DBdata)
            if (DBdata) {
                UserName = DBdata.name;
                console.log("userName  =", UserName)
                console.log("id  =", DBdata._id.tostring());
            }
            else console.log("User not found in DB");

        } catch (error) {
            console.error("Error fetching user:", error);
        }
    }
    else {
        console.log("No user ID found");
    }

    socket.on("code-change", ({ fileId, projectId, code }) => {
        console.log("data = ", fileId, code);
        socket.to(projectId).emit("code-update", { code, fileId })
    })
    socket.on("cursor-move", ({ projectId, fileId, position }) => {
        if (!fileId || !projectId) {
            console.log("id cursor move me nahi ayye");;
            socket.emit("error", { message: "id is req" });
        }
        console.log("position === ", position)
        console.log("fileId = ", fileId);
        console.log("projectId = ", projectId);
        socket.to(projectId).emit("cursor-update", {
            userId: UserId,
            fileId: fileId,
            position,
        })

    })
    socket.on("joined", (id: string) => {

        if (!id) {
            console.log(" project ID nahi aye");

            socket.emit("error", { message: "Project ID is required" });
            return;

        }

        currProjectId = id;
        socket.join(id)

        console.log(`${socket.id} joined ${id}`)

        if (UserId)
            adduser(id, socket.id, UserId, UserName);

        io.to(id).emit("user-joined",
            {
                userId: UserId,
                name: UserName,
            }
        )

        const users = getusers(id);
        console.log("users===", users);

        const user = io.sockets.adapter.rooms.get(id);
        const UserCount = user ? user.size : 0;

        console.log("count = ", UserCount)


        io.to(id).emit("online-members", users)
    })
    socket.on("selction-change", ({ projectId, fileId, selection }) => {
        console.log("selction-change ")
        console.log("selction-change slectin =  ", selection)
        console.log("ids =  ", UserId, fileId)
        socket.to(projectId).emit("selection-update", {
            userId: UserId,
            fileId: fileId,
            selection
        })
    })
    socket.on("file-opened", ({ projectID, fileId }) => {
        console.log("file Opened", fileId, projectID);
        socket.to(projectID).emit("user-file-changed", { userId: UserId, fileId })
    })

    socket.on("send-message", async ({ projectId, message }) => {

        try {
            const newMessage = await Message.create({
                projectId,
                userId: UserId,
                message,
            })

            io.to(projectId).emit("new-message", {
                userId: UserId,
                message: message,
                userName: UserName,
                time: new Date(),
            })

        } catch (error) {
            console.error(
                "MESSAGE ERROR:",
                error
            );
            throw new Error("cant save in server req message");
        }

    })
    socket.on("user-left", ({ projectId }) => {
        console.log("😡😡")
        if (!projectId) return;
        removeUser(projectId, UserId, socket.id);
        socket.leave(projectId);
        const user = getusers(projectId);

        io.to(projectId).emit("online-members", user);

    })
    socket.on("terminal-input",({projectId, command})=>{
        const terminal =  getOrCreateTerminal(projectId);
        
        console.log("terminal socket 🫡",projectId,command);
        terminal.onData((data)=>{
            io.to(projectId).emit("terminal-output", data)
        })
    })
    socket.on("disconnect", () => {

        try {
            if (!currProjectId) return;
            console.log("user disconnected", socket.id);

            const usermap = projectUsers.get(currProjectId);
            if (usermap === undefined) return;
            usermap.delete(socket.id)

            const onlineUsers = Array.from(usermap.values())

            console.log("left = ", onlineUsers)
            io.to(currProjectId).emit("online-members", onlineUsers)
            if (usermap.size === 0) {
                projectUsers.delete(currProjectId)
            }
        } catch (error) {
            console.error("DISCONNECT ERROR:", error);
        }

    })

})

async function startServer() {
    await mongo();

    httpServer.listen(3001, () => {
        console.log("running on port 3001");
    });
}

startServer();