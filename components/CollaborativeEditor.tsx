'use client'

import { yjsManager } from "@/lib/yjs";
import { Editor } from "@monaco-editor/react"
import { useEffect, useRef, useState } from "react";
import CursorOverlay from "./CursorOverlay";
import { useSelector } from "react-redux"
import { Rootstate } from "@/app/store/store"
interface CollaborativeEditorProps {
    fileId: string;
    projectId: string;

    initialContent?: string;
    language?: string;
    newFile: any;
    newFileTrigger: Number;
}
export default function CollaborativeEditor({
    fileId,
    projectId,
    initialContent = '',
    language = 'typescript',
    newFile,
    newFileTrigger
}: CollaborativeEditorProps) {
    console.log("new file  ------- 👍👍👍👍  666 ", newFile,newFileTrigger);
    useEffect(() => {
        console.log("EFFECT TRIGGERED", newFile);
    }, [newFile, newFileTrigger]);
    const userId = useSelector(
        (state: Rootstate) => state.user.userId
    );
    const userName = useSelector(
        (state: Rootstate) => state.user.name
    );

    const editorRef = useRef<any>(null);
    const [users, setusers] = useState<any[]>([])
    const [isConnected, setisConnected] = useState(false);
    const [isReady, setisReady] = useState(false);
    const [files, setfiles] = useState([])
    const providerRef = useRef<any>(null);
    const [isclient, setisclient] = useState(false)
    const [room, setroom] = useState("")
    const pendingFileRef = useRef<any>(null);
    

    useEffect(() => {
        setisclient(true);
    }, [])


    useEffect(() => {

        const initProvider = async () => {
            const roomId = `project-${projectId}`;
            setroom(roomId);

            const provider = await yjsManager.getProvider(projectId, roomId, userId!, userName!);
            providerRef.current = provider;

            // setfiles(provider.getfiles());

            if (newFile) {
                console.log("is working 0000000000000000")
                provider.createFile(newFile);
                newFile = null;
            }




            provider.onAwarenessChange((awarenessUsers) => {
                console.log("AWARENESS USERS:", awarenessUsers);
                setusers(awarenessUsers);
            })
            provider.onFilesChange((files) => {

                setfiles(files);
                console.log("😋😋😋😋😋😋😋", files);
            })
            const syncHandler = () => {
                setisConnected(true);
            }
            provider.provider.on('sync', syncHandler);

            setisReady(true);
        }

        initProvider();

        return () => {
            yjsManager.removeProvider(room);
            setisConnected(false);
            setisReady(false);
        }
    }, [projectId, userId, userName]);


    useEffect(() => {

        if (!newFile) {
            console.log("real time update ------- 👍👍👍👍 ");

            console.log(" new file is not ready is getting real time update ------- 👍👍👍👍 ");
            return;
        }
        if (!providerRef.current) {
            console.log("provider is not redy real time update ------- 👍👍👍👍 ");
            return;
        }
        console.log("new file has arrived  ------- 👍👍👍👍  666 ");
        providerRef.current.createFile(newFile)

    }, [newFile, newFileTrigger]);

    const handleEditorMount = (editor: any) => {
        editorRef.current = editor;

        if (initialContent) {
            editor.setValue(initialContent);
        }
        if (providerRef.current) {
            providerRef.current.bindEditor(editor, fileId);
        }
    }
    const handleContentChange = (value: string | undefined) => {
        if (!value) return;
        saveToDatabase(value);
    }
    const saveToDatabase = async (content: string) => {
        try {
            await fetch(`/api/files/${fileId}`, {
                method: "PATCH", headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    content
                }),
            })
        } catch (error) {
            console.log("update nahi hua , error = ", error);
        }
    }


    return (
        <div className="relative h-full" suppressHydrationWarning>

            {fileId &&isclient && isReady && (
                <div className="relative h-full">
                    <Editor
                        height="100%"
                        language={language}
                        theme="vs-dark"
                        onMount={handleEditorMount}
                        onChange={handleContentChange}
                        options={{
                            minimap: { enabled: false },
                            fontSize: 14,
                            automaticLayout: true,
                            lineNumbers: 'on',
                            renderWhitespace: 'selection',
                            fontFamily: 'JetBrains Mono, monospace',
                        }}
                    />


                    <CursorOverlay
                        users={users}
                        currentUserId={userId!}
                        editor={editorRef.current}
                    />
                </div>
            )}
        </div>
    );

}