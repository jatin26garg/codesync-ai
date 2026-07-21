"use client"
import { useParams } from "next/navigation"
import React, { useRef, useState } from "react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { ProjectResponse } from "@/app/api/projects/route"
import { Editor } from "@monaco-editor/react"
import Link from "next/link"
import { SiTypescript, SiJavascript, SiReact, SiHtml5, SiCplusplus, SiCss, SiTailwindcss, SiJson, SiLocal, SiMarkdown } from "react-icons/si"
import { FaFolder, FaFolderOpen } from "react-icons/fa"
import { socket } from "@/lib/socket"
import * as monaco from "monaco-editor";
import { MessageType } from "@/components/chatBox"
import ChatBox from "@/components/chatBox"
import { InviteButton } from "@/components/InviteButton"
import { toast } from "sonner"
import Terminal from "@/components/terminal"
import TerminalComponent from "@/components/terminal"


interface Project {
    success: true,
    project: ProjectResponse
}
interface fileResponse {
    id: string,
    name: string,
    parentId: string | null,
    isFolder: boolean,
    createdAt: string,
    updatedAt: string,
}
interface resFiles {
    success: true,
    file: fileResponse[],
}

interface FileNode {
    id: string;
    name: string;
    parentId: string | null;
    isFolder: boolean;
    language: string;
    children: FileNode[];
    createdAt: string;
    updatedAt: string;
}

interface File {
    id: string;

    name: string,
    content: string,
    language: string;

    createdAt: string;
    updatedAt: string;
}
type RemoteCursor = {
    userId: string;
    fileId: string;
    position: {
        line: number;
        column: number;
    };
};
type RemoteSelection = {
    userId: string;
    fileId: string;
    selection: {
        startLineNumber: number;
        startColumn: number;
        endLineNumber: number;
        endColumn: number;
    };
};

type UserFile = {
    userId: string;
    fileId: string;
};


export default function ProjectPage() {
    const [projects, setprojects] = useState<ProjectResponse | null>(null);
    const [loading, setloading] = useState(false);
    const [error, seterror] = useState('');
    const [isdeleting, setisdeleting] = useState(false)
    const [files, setfiles] = useState<fileResponse[]>([])
    const [fileroot, setfileroot] = useState<FileNode[]>([])


    const [isfolder, setisfolder] = useState(false);

    const [code, setcode] = useState("")
    const [selectedfile, setselectedfile] = useState<File | null>(null)
    const [BreadcrumbPath, setBreadcrumbPath] = useState<string[]>([])
    const [filemap, setfilemap] = useState<Record<string, FileNode[]>>({})

    const [openedfiles, setopenedfiles] = useState<FileNode[]>([])
    const [newname, setnewname] = useState('')
    const [ismodal, setismodal] = useState(false)
    const [name, setname] = useState("");
    const [language, setlanguage] = useState("typescript")
    const [parentId, setparentId] = useState<string | null>(null)
    const [isActive, setisActive] = useState('');
    const [isopen, setisopen] = useState(false);
    const [isvisible, setisvisible] = useState(false)
    const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
    const [isaving, setisaving] = useState(false)
    const [draggedFile, setdraggedFile] = useState<FileNode | null>(null)
    const [RenameFileId, setRenameFileId] = useState<string | null>(null)


    const [contextmenu, setcontextmenu] = useState({
        visible: false,
        x: 0,
        y: 0,
        file: null,
    })
    const router = useRouter();
    const params = useParams();
    const [SidebarCollapsed, setSidebarCollapsed] = useState(false)
    const [istyping, setistyping] = useState(false)
    const [onlineusers, setonlineusers] = useState<{ id: string, name: string }[]>([])
    const map = useRef<FileNode | null>(null)
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const id = params.id as string;
    const editorRef = useRef<any>(null);
    const codeUpdate = useRef(false);
    const [remoteCursor, setremoteCursor] = useState<RemoteCursor[]>([])
    const decorationsRef = useRef<string[]>([]);
    const [cursorPosition, setcursorPosition] = useState({ line: 1, column: 1 })
    const FileIDRef = useRef<string>("");
    const [remoteSelctions, setremoteSelctions] = useState<RemoteSelection[]>([])
    const selectionDecorationsRef = useRef<string[]>([]);

    const [userFiles, setuserFiles] = useState<UserFile[]>([])
    const [messsages, setmesssages] = useState<MessageType[]>([])
    const [sendMessages, setsendMessages] = useState("")


    useEffect(() => {
        // console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$$")
        const fetchMessages = async () => {
            try {
                setloading(true);

                const res = await fetch(`/api/projects/${id}/message`, {
                    credentials: "include",
                })

                const data = await res.json();
                if (!res.ok) {
                    console.log("messages nahi aye");
                }
                if (data.success) {
                    setmesssages(
                        data.messages.map((msg: any) => ({
                            userId: msg.userId._id,
                            userName: msg.userId.name,
                            message: msg.message,
                            time: msg.createdAt,
                        }))
                    )
                    console.log("meassages use effect", messsages)
                }

            } catch (error) {
                console.log("fetch mesg error");
            } finally {
                setloading(false);
            }
        }
        if (id)
            fetchMessages()
    }, [id])



    useEffect(() => {
        if (!editorRef.current) return;

        const decorations = remoteCursor
            .filter((cursor) => cursor.fileId === isActive)
            .map((cursor) => ({
                range: {
                    startLineNumber: cursor.position.line,
                    startColumn: cursor.position.column,
                    endLineNumber: cursor.position.line,
                    endColumn: cursor.position.column,
                },
                options: {
                    beforeContentClassName: "remote-cursor",
                    hoverMessage: {
                        value: cursor.userId,
                    },
                },
            }));

        decorationsRef.current =
            editorRef.current.deltaDecorations(
                decorationsRef.current,
                decorations
            );
    }, [remoteCursor, isActive]);

    useEffect(() => {
        if (!editorRef.current) return;

        const decorations = remoteSelctions
            .filter(
                (selection) =>
                    selection.fileId === FileIDRef.current
            )
            .filter((selection) => {
                const userfile = userFiles.find(
                    (user) =>
                        user.userId === selection.userId
                );

                return userfile?.fileId === FileIDRef.current;
            })
            .map((selection) => ({
                range: {
                    startLineNumber:
                        selection.selection.startLineNumber,

                    startColumn:
                        selection.selection.startColumn,

                    endLineNumber:
                        selection.selection.endLineNumber,

                    endColumn:
                        selection.selection.endColumn,
                },

                options: {
                    className: "remote-selection",

                    hoverMessage: {
                        value: selection.userId,
                    },
                },
            }));

        selectionDecorationsRef.current =
            editorRef.current.deltaDecorations(
                selectionDecorationsRef.current,
                decorations
            );
    }, [remoteSelctions, isActive]);

    useEffect(() => {

        if (!socket.connected) {
            console.log("👑👑👑👑")
            socket.connect();
        }
        else console.log("🥹🥹🥹🥹")

        const handleOnlineMembers = (users: { id: string, name: string }[]) => {
            setonlineusers(users);
            setremoteCursor((prev) => prev.filter((cursor) => users.some((user) => user.id === cursor.userId)))
            console.log("remote-cursor = ", remoteCursor)
        };


        const handleCodeUpdate = ({ code, fileId }: { code: string, fileId: string }) => {
            console.log("code-update", code, fileId)
            console.log("code-upadte", isActive)
            console.log("code-upadte", isActive === fileId)
            if (isActive === fileId) {

                console.log(code)
                codeUpdate.current = true;
                setcode(code);

            } else return;
        }


        const handleCursorUpdate = ({ userId, fileId, position }: RemoteCursor) => {
            console.log("handleCursorUpdate$$$$$$$$$$$$$$$$$$");

            setremoteCursor((prev) => {
                const filtered = prev.filter((cursor) => cursor.userId !== userId);
                return [...filtered, { userId, fileId, position }];
            })


        }
        const handleSelectionUpdate = (selection: RemoteSelection) => {
            console.log("hi9999999999999999999999999999999999999999999999999999")
            setremoteSelctions((prev) => {
                const filtered = prev.filter((item) => item.userId !== selection.userId)
                return [...filtered, selection];
            })
            console.log("setremoteSelctions", setremoteSelctions);

        }
        const handleUserFileChanged = ({ userId, fileId }: { userId: string, fileId: string }) => {
            console.log("handleUserFileChanged fileid = ", fileId)
            console.log("handleUserFileChanged userid = ", userId)

            setuserFiles((prev) => { const filtered = prev.filter((user) => user.userId !== userId); return [...filtered, { userId, fileId }] })
        }

        const handleNewMessage = ({ userId, message, time, userName }: MessageType) => {
            console.log("handleNewMessage", userId, message, time, userName);

            setmesssages((prev) => [...prev, { message, userId, time, userName }]);


        }
        const handleUserJoined = ({ userId, name }: { userId: string, name: string }) => {
            console.log("🗣️🗣️", userId, name);
            toast.success(`${name} joined the project`)

        }
        socket.on("selection-update", handleSelectionUpdate);

        socket.emit("joined", id);

        socket.on("code-update", handleCodeUpdate)

        socket.on("online-members", handleOnlineMembers)

        socket.on("cursor-update", handleCursorUpdate)

        socket.on("new-message", handleNewMessage)

        socket.on("user-file-changed", handleUserFileChanged)

        socket.on("user-joined", handleUserJoined);




        return () => {

            socket.off("online-members", handleOnlineMembers)
            socket.off("code-update", handleCodeUpdate)
            socket.off("cursor-update", handleCursorUpdate)
            socket.off("user-file-changed", handleUserFileChanged)
            socket.off("selection-update", handleSelectionUpdate);
            socket.off("new-message", handleNewMessage)
            socket.off("user-joined", handleUserJoined);


        }
    }, [id, isActive])




    useEffect(() => {
        fetchdata();
        fetchFiles();
        const handleconnect = () => {
            console.log("😭😭😭")
            console.log("connected", socket.id)
            socket.emit("joined", id);
        }
        socket.on("connect", handleconnect)

        return () => {
            socket.off("connect", handleconnect)
        }

    }, []);

    useEffect(() => {
        console.log("debounce")
        if (!isopen) {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
                timerRef.current = null;
            }
            return;
        }
        if (selectedfile?.content === code) {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
                timerRef.current = null;
            }
            return
        }
        // console.log(selectedfile?.content);
        // console.log("8", code);
        // console.log(selectedfile?.content === code)
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }
        timerRef.current = setTimeout(() => {
            console.log("debounce efect")
            handleSave();
        }, 4000);
        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };

    }, [code, isopen, selectedfile?.content]);
    useEffect(() => {
        const closeMenu = () => {
            setcontextmenu((prev) => ({
                ...prev, visible: false,
            }))
        }
        window.addEventListener("click", closeMenu);
        return () => {
            window.removeEventListener("click", closeMenu);
        };

    }, [])


    const handleEditorMount = (editor: any) => {
        editorRef.current = editor;

        editor.onDidChangeCursorPosition((e: any) => {
            const position = {
                line: e.position.lineNumber,
                column: e.position.column,
            }
            console.log("onDidChangeCursorPosition", isActive)
            setcursorPosition(position)
            if (socket?.connected) {
                console.log("id--------", isActive)
                console.log("id--------", FileIDRef.current)
                socket.emit("cursor-move", {
                    projectId: id,
                    fileId: FileIDRef.current,
                    position: position,
                })
            }
        })
        editor.onDidChangeCursorSelection((e: any) => {
            const selection = e.selection;

            socket.emit("selction-change", {
                projectId: id,
                fileId: FileIDRef.current,
                selection: {
                    startLineNumber: selection.startLineNumber,
                    startColumn: selection.startColumn,
                    endLineNumber: selection.endLineNumber,
                    endColumn: selection.endColumn,
                }
            })
        })
    }

    const handleFileBroadcast = async (fileId: string) => {
        socket.emit("file-opened", {
            projectID: id,
            fileId: fileId,
        })
    }
    const handleDelete = async () => {
        if (!confirm("Are you sure to delete this file?")) return;
        try {
            setisdeleting(true);
            setloading(true);
            seterror('');
            const res = await fetch(`/api/projects/${id}`,
                { method: "DELETE", credentials: "include" }
            )
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || "failed to delete data")
            }
            alert("file deleted successfully");
            router.push("/dashboard");
            router.refresh()
        } catch (error) {
            console.log("error = ", error);
            seterror(error instanceof Error ? error.message : "failed to delete project");
        } finally {
            setloading(false)
        }
    }
    const handleDeleteFile = async () => {
        if (!confirm("are you sure to delete this file/folder ")) return;
        try {
            setloading(true);
            seterror('');
            const res = await fetch(`/api/files/${contextmenu.file?.id}`,
                { method: "DELETE", credentials: "include" }
            )
            const data = await res.json();
            if (!res.ok) {
                throw new Error("unable to delete");
            }
            alert("file/folder deleted successfully");
            fetchFiles()
        } catch (error) {
            seterror("cant delete")
        } finally {
            setloading(false);
            setcontextmenu({ visible: false, x: 0, y: 0, file: null })
        }
    }
    const fetchdata = async () => {
        if (!id) {
            throw new Error("Project ID is required");
        }
        try {
            setloading(true);
            seterror("")

            const res = await fetch(`/api/projects/${id}`,
                {
                    method: "GET",
                    credentials: "include",
                }
            )
            console.log("res = ", res)
            if (!res.ok) {
                if (res.status === 401) {
                    router.push("/login");
                    router.refresh();
                }
                if (res.status === 404) {
                    throw new Error("file not found")

                }
                if (res.status === 403) {
                    router.push("/dashboard")
                    router.refresh();
                }
                throw new Error("invalid")

            }
            const data: Project = await res.json();
            if (data.success && data.project) {
                setprojects(data.project)
                console.log("single project page", projects);
            } else throw new Error("data NOT found")
        } catch (error) {
            console.log("error", error);
            seterror(error instanceof Error ? error.message : "failed to load")
        } finally {
            setloading(false);
        }

    }
    const fetchFiles = async () => {
        if (!id) {
            return;
        }
        try {
            setloading(true);
            seterror('');
            // console.log("checkkkkkkkkkkkkkkkkkkk");
            const res = await fetch(`/api/projects/${id}/files`,
                { method: "GET", credentials: "include" }
            )
            if (!res.ok) {
                throw new Error("cannot get files ");
            }
            const data = await res.json();
            if (data.success && data.files) {
                setfiles(data.files)
                const { roots, map } = buildFileTree(data.files);

                console.log("files=", files)
                setfileroot(roots);
            }
        } catch (error) {
            seterror("Fetch files error:");
        } finally {
            setloading(false)
        }
    }
    const buildFileTree = (files: any[]): { roots: FileNode[], map: Record<string, any> } => {

        const map: Record<string, any> = {};
        const roots: any[] = [];

        files.forEach((file) => {
            console.log("file= ", file)
            map[file.id] = { ...file, children: [] };
        });
        // console.log("map= ", map);

        files.forEach((file) => {
            if (file.parentId) {
                const parent = map[file.parentId];
                // console.log("parent = ", parent);
                if (parent) {
                    map[file.parentId].children.push(map[file.id])
                }
            } else {
                roots.push(map[file.id])
            }
        })
        console.log("roots = ", roots);
        setfilemap(map);

        return { roots, map };
    }
    const togglefolder = (id: string) => {
        const newExpanded = new Set(expandedFolders);
        if (newExpanded.has(id)) {
            newExpanded.delete(id)
        }
        else newExpanded.add(id);
        setExpandedFolders(newExpanded)
    }
    const fetchfilecontent = async (id: string) => {
        try {
            setloading(true);
            seterror('');
            console.log("in fetchfilecontent id=  ", id)
            const res = await fetch(`/api/files/${id}`,
                {
                    method: "GET",
                    credentials: "include",
                }
            )

            if (!res.ok) {
                throw new Error("file not found");
            }

            const data = await res.json();
            if (data.success && data.files) {

                console.log("name ====", data.files.name)
                console.log("content = ", data.files.content)
                setselectedfile(data.files);
                setcode(data.files.content)
            }

        } catch (error) {
            seterror("Fetch files error:");
        } finally {
            setloading(false);
        }
    }
    const movefile = async (idxId: string, srcId: string | null) => {
        try {
            setloading(true);
            seterror('');
            const res = await fetch(`/api/files/${idxId}`,
                {
                    method: "PATCH", headers: { "Content-Type": "application/json", },
                    body: JSON.stringify({
                        parentId: srcId
                    })
                }
            )
            if (!res.ok) {
                throw new Error("try again later");
            }
            fetchFiles();
        } catch (error) {
            seterror(error instanceof Error ? error.message : "failed to move file");
        } finally {
            setloading(false);
            setdraggedFile(null);
        }
    }
    const getFileIcon = (file: FileNode) => {
        if (file.isFolder) {
            return expandedFolders.has(file.id) ? <FaFolderOpen /> : <FaFolder />
        }
        const extnetion = file.name.split(".").pop()?.toLowerCase();
        switch (extnetion) {
            case "ts":
                return <SiTypescript />;

            case "tsx":
                return <SiReact />;

            case "js":
                return <SiJavascript />;

            case "jsx":
                return <SiReact />;

            case "html":
                return <SiHtml5 />;

            case "css":
                return <SiCss />;

            case "json":
                return <SiJson />;

            case "md":
                return <SiMarkdown />;

            default:
                return "📄";
        }
    }
    const Breadcrumb = (file: FileNode) => {
        const path: string[] = [];

        let curr: FileNode | any = filemap[file.id];

        while (curr) {
            path.unshift(curr.name);
            if (!curr.parentId) break;
            curr = filemap[curr.parentId]
        }

        setBreadcrumbPath(path);
    }
    const renderfiles = (file: FileNode[], depth: number = 0) => {
        return file.map((file) => (
            <div key={file.id} className="select-none">
                <div
                    className={`group flex items-center justify-between px-2 py-1 rounded-md transition-all duration-150 hover:bg-[#2C2D2E] cursor-pointer ${isActive === file.id ? 'bg-[#2C2D2E] border-l-2 border-blue-500' : ''
                        }`}
                    draggable
                    onDragStart={() => setdraggedFile(file)}
                    onDragOver={(e) => {

                        if (file.isFolder) e.preventDefault();
                    }}
                    onDrop={(e) => {
                        if (!draggedFile) return;
                        e.stopPropagation();
                        movefile(draggedFile.id, file.id)
                    }}
                    style={{ paddingLeft: `${depth * 20 + 12}px` }}
                    onClick={() => {

                        //for Breadcrumb only 
                        Breadcrumb(file)
                        //---

                        if (!file.isFolder && RenameFileId === null) {
                            setisActive(file.id);
                            FileIDRef.current = file.id
                            console.log("render-file", isActive)
                            const isAlreadyOpen = openedfiles.some(f => f.id === file.id);
                            if (!isAlreadyOpen) {
                                setopenedfiles(prev => [...prev, file]);
                            }
                            console.log("openedfies = ", openedfiles)
                            setselectedfile(file.id)
                            fetchfilecontent(file.id);
                            setisopen(true);
                            handleFileBroadcast(file.id)

                        } else {
                            togglefolder(file.id);
                            setisActive('');
                            setisopen(false);
                        }
                    }}
                    onContextMenu={(e) => { e.preventDefault(); setcontextmenu({ visible: true, x: e.clientX, y: e.clientY, file: file }) }}
                >

                    <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span className="flex-shrink-0">
                            {getFileIcon(file)}
                        </span>
                        <span className={`text-sm truncate ${isActive === file.id ? 'text-white' : 'text-gray-300'
                            }`}>
                            {RenameFileId === file.id ? <input type="text" value={name}
                                autoFocus
                                onChange={(e) => { setname(e.target.value); }}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") handleRename(); if (e.key === "Escape") setRenameFileId(null)
                                }}
                                onBlur={() => { setRenameFileId(null) }}
                            />
                                : <span >{file.name} </span>}
                        </span>
                    </div>


                    {file.isFolder && (
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0 ml-2">
                            <button

                                onClick={(e) => {
                                    e.stopPropagation();
                                    setisfolder(false);
                                    setismodal(true);
                                    setparentId(file.id);
                                }}
                                className="p-1 rounded hover:bg-[#3d3d3d] text-gray-400 hover:text-blue-400 transition-colors"
                                title="New File"
                            >
                                <span className="text-sm">📄</span>
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setisfolder(true);
                                    setismodal(true);
                                    setparentId(file.id);
                                }}
                                className="p-1 rounded hover:bg-[#3d3d3d] text-gray-400 hover:text-yellow-400 transition-colors"
                                title="New Folder"
                            >
                                <span className="text-sm">📁</span>
                            </button>
                        </div>
                    )}


                    {!file.isFolder && (
                        <div className="flex-shrink-0 ml-2">
                            <span className="text-[10px] text-gray-500">
                                {file.language || 'txt'}
                            </span>
                        </div>
                    )}
                </div>
                {file.isFolder && expandedFolders.has(file.id) && file.children && (
                    <div className="mt-0.5">
                        {renderfiles(file.children, depth + 1)}
                    </div>
                )}
            </div>
        ));
    };
    const handlesubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        seterror('');
        if (!name.trim()) {
            seterror('Name is required');
            return;
        }
        try {
            setloading(true);
            console.log("is folder = ", isfolder);
            const res = await fetch(`/api/projects/${id}/files`,
                {
                    method: "POST", headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        name,
                        parentId,
                        isfolder,
                        language,
                        content: "",
                    })


                }
            )
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to create item");
            }
            setname("");
            setisfolder(false);
            setismodal(false);
            alert("file created");
            fetchFiles();
        } catch (error) {
            console.error("Create item error:", error);
            alert(error instanceof Error ? error.message : "Failed to create item");
        } finally {
            setloading(false);
        }
    }
    const handleSave = async () => {
        try {
            console.log("handlesave");
            console.log(code)
            setloading(true);
            seterror('');
            setisaving(true);
            if (!selectedfile) {
                alert("select the file")
                return;
            }
            // console.log("@@@@@@@@@@@");
            const res = await fetch(`/api/files/${selectedfile?.id}`,
                {
                    method: "PATCH", headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        content: code,
                        name: selectedfile.name,
                        language: selectedfile.language,
                        updatedAt: selectedfile.updatedAt

                    })
                }
            )
            console.log("@@@@@@@@@@@", res.ok);

            if (!res.ok) {
                throw new Error("try again later");
            }

            setselectedfile(prev => prev ? { ...prev, content: code } : null);
        } catch (error) {
            console.log("error = ", error);
            seterror(error instanceof Error ? error.message : "failed to save project");
        }
        finally {
            setloading(false);
            setisaving(false);
        }
    }
    const handleEditorChange = (value: string | undefined) => {

        if (value === undefined || !isActive) return;

        if (codeUpdate.current === true) {
            codeUpdate.current = false;
            return;
        }

        if (isActive) {
            console.log("handleEditorChange= ", isActive)
            setcode(value);
            console.log("handleEditorChange.selectedfil  ", code)

            socket.emit("code-change", {
                fileId: isActive,
                projectId: id,
                code: value,
            })
        }
    }
    const handleRename = async () => {
        try {
            setloading(true);
            seterror('');
            if (name.length < 2) return;
            const res = await fetch(`/api/files/${contextmenu.file.id}`,
                {
                    method: "PATCH", headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        name: name,
                    })
                }
            )
            if (!res.ok) {
                throw new Error("cant rename");
            }
            await fetchFiles();
            alert("file renamed")
            setRenameFileId(null)
            setname("");
        } catch (error) {
            seterror("cant rename:");
        } finally { setloading(false) }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading project...</p>
                </div>
            </div>
        );
    }


    if (error || !projects) {
        return (
            <div className="max-w-4xl mx-auto">
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                    {error || "Project not found"}
                    <button
                        onClick={fetchdata}
                        className="ml-2 text-blue-500 hover:text-blue-700 font-medium"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }


    return (
        <div className="h-screen bg-[#121314] text-gray-50 flex flex-col overflow-hidden mx-0">

            {/* ============ TOP BAR ============ */}
            <div className="bg-[#191A1B] text-white flex items-center justify-between border-b px-4 mx-0 border-[#151617] py-2 flex-shrink-0">

                {/* Left Section */}
                <div className="flex items-center gap-4 flex-1 min-w-0">
                    <InviteButton projectId={id} />

                    <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-blue-400 text-lg">📁</span>
                        <span className="text-white font-bold text-sm truncate max-w-[150px]">{projects.name}</span>
                    </div>

                    <div className="flex flex-col flex-1 min-w-0">
                        {openedfiles.length !== 0 && (
                            <div className="flex overflow-x-auto gap-1 pb-1 scrollbar-thin scrollbar-thumb-[#2A2B2C]">
                                {openedfiles.map(files => (
                                    <div
                                        key={files.id}
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-t-md border-b-2 transition-all duration-200 ${(isActive === files.id)
                                            ? 'border-blue-500 bg-[#1e1e1e] text-white'
                                            : 'border-transparent hover:bg-[#1e1e1e]/50 text-gray-400'
                                            }`}
                                    >
                                        <button
                                            onClick={() => { Breadcrumb(files); fetchfilecontent(files.id); setisActive(files.id); setisopen(true) }}
                                            className="text-sm truncate max-w-[100px]"
                                        >
                                            {files.name}
                                        </button>
                                        <button
                                            onClick={() => {
                                                const idx = openedfiles.findIndex(file => file.id === files.id);
                                                const newfiles = openedfiles.filter(file => file.id !== files.id);
                                                setopenedfiles(newfiles);
                                                if (newfiles.length === 0) {
                                                    setcode("");
                                                    setisActive("");
                                                    setisopen(false)
                                                    setBreadcrumbPath([])
                                                }
                                                if (isActive === files.id) {
                                                    const next = newfiles[idx] ?? newfiles[idx - 1]
                                                    Breadcrumb(next)
                                                    fetchfilecontent(next.id);
                                                    setisActive(next.id)
                                                }
                                            }}
                                            className="text-gray-500 hover:text-white hover:bg-gray-700/50 rounded-full w-5 h-5 flex items-center justify-center text-xs transition"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {BreadcrumbPath.length !== 0 && (
                            <div className="bg-[#121314] px-2 py-1 rounded-md mt-1">
                                <div className="flex items-center gap-1 text-xs text-gray-400">
                                    <span className="text-blue-400">📁</span>
                                    {BreadcrumbPath.map((file, index) => (
                                        <span key={index} className="flex items-center gap-1">
                                            <span className="hover:text-white transition cursor-default">{file}</span>
                                            {index !== (BreadcrumbPath.length - 1) && (
                                                <span className="text-gray-600">▸</span>
                                            )}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Section */}
                <div className="flex items-center gap-3 flex-shrink-0">
                    {onlineusers.length !== 0 && (
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-[#1e1e1e] rounded-full">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            <span className="text-xs text-gray-400">{onlineusers.length}</span>
                            {onlineusers.slice(0, 3).map((value, idx) => (
                                <div key={idx} className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-semibold border border-[#2A2B2C]">
                                    {value.name?.charAt(0).toUpperCase() || 'U'}
                                </div>
                            ))}
                            {onlineusers.length > 3 && (
                                <span className="text-xs text-gray-500">+{onlineusers.length - 3}</span>
                            )}
                        </div>
                    )}

                    <button
                        onClick={handleSave}
                        disabled={isaving}
                        className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 
                bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/25
                disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isaving ? (
                            <>
                                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                <span>Saving...</span>
                            </>
                        ) : (
                            <>
                                <span>💾</span>
                                <span>Save</span>
                            </>
                        )}
                    </button>

                    <button
                        onClick={handleDelete}
                        disabled={isdeleting}
                        className="text-gray-400 hover:text-red-400 transition p-1.5 rounded hover:bg-[#3d3d3d] disabled:opacity-50"
                        title="Delete Project"
                    >
                        🗑️
                    </button>

                    <Link
                        onClick={() => { socket.emit("user-left", { projectId: id }); console.log("cross button clicked ♾️") }}
                        href="/dashboard"
                        className="text-gray-400 hover:text-white transition p-1.5 rounded hover:bg-[#3d3d3d]"
                        title="Back to Dashboard"
                    >
                        ✕
                    </Link>
                </div>
            </div>

            {/* ============ MAIN CONTENT ============ */}
            <div className="flex flex-1 overflow-hidden">

                {/* ============ SIDEBAR ============ */}
                <div
                    className="bg-[#191A1B] border-r border-[#2A2B2C] flex flex-col transition-all duration-200 flex-shrink-0"
                    onDragOver={(e) => { e.preventDefault() }}
                    onDrop={() => {
                        if (!draggedFile) return;
                        movefile(draggedFile.id, null);
                    }}
                >
                    <button
                        onClick={() => setSidebarCollapsed(!SidebarCollapsed)}
                        className="p-2 hover:bg-[#3d3d3d] transition text-gray-400 hover:text-white text-sm flex items-center gap-2 border-b border-[#3d3d3d]"
                    >
                        {SidebarCollapsed ? '☰' : '◀'}
                        {!SidebarCollapsed && <span className="text-xs">Collapse</span>}
                    </button>

                    {!SidebarCollapsed && (
                        <div className="flex flex-col w-60 px-0 mx-0">
                            <div className="flex items-center justify-between px-3 py-2 border-b border-[#2A2B2C]">
                                <span className="text-sm font-medium text-gray-400 truncate">{projects.name}</span>
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => { setisfolder(false); setismodal(true); setparentId(null) }}
                                        className="p-1 hover:bg-[#3d3d3d] rounded transition text-gray-400 hover:text-white"
                                        title="New File"
                                    >
                                        📄+
                                    </button>
                                    <button
                                        onClick={() => { setisfolder(true); setismodal(true); setparentId(null) }}
                                        className="p-1 hover:bg-[#3d3d3d] rounded transition text-gray-400 hover:text-white"
                                        title="New Folder"
                                    >
                                        📁+
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-1">
                                {fileroot.length === 0 ? (
                                    <div className="flex items-center justify-center h-20 text-gray-500 text-sm">
                                        <span>📂 No files</span>
                                    </div>
                                ) : (
                                    renderfiles(fileroot)
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* ============ EDITOR + TERMINAL + CHAT ============ */}
                <div className="flex-1 flex overflow-hidden">
                    {/* Editor + Terminal Container */}
                    <div className="flex-2 flex flex-col h-[95%] overflow-hidden -py-2">
                        {/* Editor */}
                        <div className="flex-1 overflow-hidden relative">
                            <Editor
                                height="100%"
                                className="overflow-y-auto pb-7 pt-0.5"
                                value={code.length == 0 ? "no code yet" : code}
                                defaultLanguage={selectedfile?.language}
                                onChange={handleEditorChange}
                                onMount={handleEditorMount}
                                theme="vs-dark"
                            />
                        </div>

                        <TerminalComponent projectId={projects.id} projectName={projects.name}/>
                        
                    </div>

                    {/* ============ CHAT BOX ============ */}
                    <div className="w-80 flex-shrink-0 border-l border-[#2A2B2C]">
                        <ChatBox
                            projectId={id}
                            messages={messsages}
                            onlineusers={onlineusers}
                        />
                    </div>
                </div>

                {/* ============ STATUS BAR ============ */}
                <div className="fixed bottom-0 left-0 w-full h-7 bg-[#191A1B] text-white flex items-center justify-between px-4 text-xs border-t border-[#2A2B2C] z-50">
                    <div className="flex gap-4">
                        <span className="text-gray-400">{language}</span>
                        <span className="text-gray-500">UTF-8</span>
                        <span className="text-gray-500">LF</span>
                        <span className="text-gray-500">lines: 4</span>
                    </div>
                    <div className="flex gap-4">
                        <span className="text-gray-400">Ln 10, Col 5</span>
                        <span className="text-green-400">● Ready</span>
                    </div>
                </div>
            </div>

            {/* ============ MODAL ============ */}
            {ismodal && (
                <form onSubmit={handlesubmit}>
                    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-[#252526] rounded-xl p-6 max-w-md w-full border border-[#3d3d3d] shadow-2xl">
                            <div className="flex items-center justify-between mb-5">
                                <h3 className="text-lg font-semibold text-white">
                                    {!isfolder ? '📄 Create New File' : '📁 Create New Folder'}
                                </h3>
                                <button
                                    onClick={() => { setismodal(false); setname(""); setparentId(null); setlanguage("") }}
                                    className="text-gray-400 hover:text-white transition p-1 rounded hover:bg-[#3d3d3d]"
                                >
                                    ✕
                                </button>
                            </div>

                            <input
                                type="text"
                                placeholder={!isfolder ? "Enter file name..." : "Enter folder name..."}
                                value={name}
                                onChange={(e) => setname(e.target.value)}
                                className="w-full bg-[#1e1e1e] border border-[#3d3d3d] rounded-lg px-3 py-2.5 text-white text-sm focus:border-blue-500 focus:outline-none transition"
                                autoFocus
                            />

                            {!isfolder && (
                                <select
                                    value={language}
                                    onChange={(e) => setlanguage(e.target.value)}
                                    className="w-full bg-[#1e1e1e] text-white rounded-lg border border-[#3d3d3d] px-3 py-2.5 text-sm mt-3 focus:border-blue-500 focus:outline-none transition"
                                >
                                    <option value="typescript">📘 TypeScript</option>
                                    <option value="javascript">📜 JavaScript</option>
                                    <option value="python">🐍 Python</option>
                                    <option value="java">☕ Java</option>
                                    <option value="cpp">⚙️ C++</option>
                                    <option value="c">⚙️ C</option>
                                    <option value="html">🌐 HTML</option>
                                    <option value="css">🎨 CSS</option>
                                    <option value="json">📦 JSON</option>
                                    <option value="markdown">📝 Markdown</option>
                                    <option value="plaintext">📄 Plain Text</option>
                                </select>
                            )}

                            {parentId !== null && (
                                <div className="w-full bg-[#1e1e1e] border border-[#3d3d3d] rounded-lg px-3 py-2 text-white text-sm mt-3 flex items-center gap-2">
                                    <span>📁</span>
                                    <span className="text-gray-400">{parentId}</span>
                                </div>
                            )}

                            {error && (
                                <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-2 rounded-lg text-sm mt-3">
                                    ⚠️ {error}
                                </div>
                            )}

                            <div className="flex gap-3 mt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
                                >
                                    {loading ? (
                                        <>
                                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            Creating...
                                        </>
                                    ) : (
                                        'Create'
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setismodal(false); setname(""); setparentId(null); setlanguage("") }}
                                    className="flex-1 px-4 py-2 bg-[#3d3d3d] text-gray-300 rounded-lg hover:bg-[#4d4d4d] transition font-medium"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            )}

            {/* ============ CONTEXT MENU ============ */}
            {contextmenu.visible && (
                <div
                    className="fixed z-50 w-56 rounded-lg border border-[#3c3c3c] bg-[#252526] shadow-2xl text-sm text-gray-200 py-1 overflow-hidden"
                    style={{
                        left: contextmenu.x,
                        top: contextmenu.y,
                    }}
                >
                    {contextmenu.file?.isFolder && (
                        <>
                            <button
                                className="w-full px-4 py-2 flex items-center gap-3 hover:bg-[#094771] transition text-left"
                                onClick={() => { setisfolder(false); setismodal(true); setparentId(contextmenu.file.id) }}
                            >
                                <span>📄</span>
                                <span>New File</span>
                            </button>
                            <button
                                className="w-full px-4 py-2 flex items-center gap-3 hover:bg-[#094771] transition text-left"
                                onClick={() => { setisfolder(true); setismodal(true); setparentId(contextmenu.file.id) }}
                            >
                                <span>📁</span>
                                <span>New Folder</span>
                            </button>
                            <div className="border-t border-[#3c3c3c] my-1" />
                        </>
                    )}

                    <button
                        className="w-full px-4 py-2 flex items-center gap-3 hover:bg-[#094771] transition text-left"
                        onClick={() => { setRenameFileId(contextmenu.file.id); setname(contextmenu.file.name) }}
                    >
                        <span>✏️</span>
                        <span>Rename</span>
                    </button>

                    <button
                        className="w-full px-4 py-2 flex items-center gap-3 hover:bg-[#094771] transition text-left text-red-400 hover:text-red-300"
                        onClick={() => handleDeleteFile()}
                    >
                        <span>🗑️</span>
                        <span>Delete</span>
                    </button>
                </div>
            )}
        </div>
    );
}