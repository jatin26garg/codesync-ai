'use client'

import { yjsManager } from "@/lib/yjs";
import { Editor } from "@monaco-editor/react"
import { useEffect, useRef, useState } from "react";
import CursorOverlay from "./CursorOverlay";
import { useSelector, UseSelector } from "react-redux"
import { Rootstate } from "@/app/store/store"
interface CollaborativeEditorProps {
    fileId: string;
    projectId: string;
    
    initialContent?: string;
    language?: string;
}
export default function CollaborativeEditor({
    fileId,
    projectId,
    initialContent = '',
    language = 'typescript'
}: CollaborativeEditorProps) {
    const userId = useSelector(
        (state: Rootstate) => state.user.userId
    );
    const  userName = useSelector(
        (state: Rootstate) => state.user.userId
    );

    const editorRef = useRef<any>(null);
    const [users, setusers] = useState<any[]>([])
    const [isConnected, setisConnected] = useState(false);
    const [isReady, setisReady] = useState(false);
    const providerRef = useRef<any>(null);

    useEffect(() => {
        const roomId = `file-${fileId}`;
        const provider = yjsManager.getProvider(roomId, userId, userName);
        providerRef.current = provider;

        provider.onAwarenessChange((awarenessUsers) => {
            console.log("AWARENESS USERS:", awarenessUsers);
            setusers(awarenessUsers);
        })

        const syncHandler = () => {
            setisConnected(true);
        }
        provider.provider.on('sync', syncHandler);

        setisReady(true);

        return () => {
            yjsManager.removeProvider(roomId);
        }
    }, [fileId, userId, userName]);

    const handleEditorMount = (editor: any) => {
        editorRef.current = editor;

        if (initialContent) {
            editor.setValue(initialContent);
        }
        if (providerRef.current) {
            providerRef.current.bindEditor(editor);
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
        <div className="relative h-full">

            {isReady && (
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