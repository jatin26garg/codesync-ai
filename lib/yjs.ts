
import * as Y from 'yjs';
import { WebsocketProvider } from "y-websocket";
// import { MonacoBinding } from 'y-monaco';
import { Awareness } from 'y-protocols/awareness.js';
import { FileNode } from '@/app/projects/[id]/page';


export class YjsProvider {
    private doc: Y.Doc;
    private provider: WebsocketProvider;
    private awareness: Awareness
    private binding: any;
    private editor: any = null;
    private filesMap: Y.Map<any>;
    private fileCallbacks: ((data: any) => void)[] = [];
    private projectId: string;

    constructor(projectId: string, userId: string, userName: string) {
        this.doc = new Y.Doc();
        this.projectId = projectId;
        this.filesMap = this.doc.getMap("files");
        this.provider = new WebsocketProvider(
            process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3002',
            `collab-${projectId}`,
            this.doc
        )

        this.awareness = this.provider.awareness;
        this.awareness.setLocalState({
            user: {
                id: userId,
                name: userName,
                color: "red",
            },
            cursor: null,
            selection: null,
        });
        this.filesMap.observe(() => {
        console.log("📁 Files changed, notifying listeners");
        this.notifyFileChange();
    });
    }
    private notifyFileChange() {
        const data = {
            type: 'files_changed',
            projectId: this.projectId,
            files: this.getFiles(),
        };
        this.fileCallbacks.forEach(cb => cb(data));
    }

    private async getProjectFiles(projectId: string) {
        try {
            const res = await fetch(`/api/projects/${projectId}/files`,
                { method: "GET", credentials: "include" }
            )
            if (!res.ok) {
                throw new Error("cannot get files ");
            }
            const data = await res.json();

            return data.files;

        } catch (error) {

        }
    }
    private async initaliseFiles(projectId: string) {

        if (this.filesMap.size > 0) return;

        const files = await this.getProjectFiles(projectId);


        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const fileMap = new Y.Map;
            const entries = Object.entries(file);

            for (let j = 0; j < entries.length; j++) {
                const [key, value] = entries[j];
                fileMap.set(key, value as any)
            }
            this.filesMap.set(file.id, fileMap);
        }
        console.log("!!!!!!!!!!!!!!!!!!23", this.filesMap);
    }

    async createFile(file: any) {
        this.doc.transact(() => {
            this.filesMap.set(file.id, file);
        })
    }



    async init(projectId: string) {
        await this.initaliseFiles(projectId);
    }



    async bindEditor(editor: any, fileId: string) {
        this.editor = editor;
        const { MonacoBinding } = await import("y-monaco")

        this.binding = new MonacoBinding(
            this.doc.getText(fileId),
            editor.getModel()!,
            new Set([editor]),
            this.awareness
        );
        this.setupCursorSync();
    }

    private setupCursorSync() {

        if (!this.editor) return;

        this.editor.onDidChangeCursorPosition((e: any) => {
            const position = e.position;
            console.log("cursor position = ", position);
            this.awareness.setLocalStateField('cursor', {
                lineNumber: position.lineNumber,
                column: position.column,
            })
        })
        this.editor.onDidChangeCursorSelection((e: any) => {
            const selection = e.selection;
            if (!selection.isEmpty()) {
                this.awareness.setLocalStateField('selection ', {
                    startLineNumber: selection.startLineNumber,
                    startColumn: selection.startColumn,
                    endLineNumber: selection.endLineNumber,
                    endColumn: selection.endColumn,
                })
            }
            else {
                this.awareness.setLocalStateField('selection', null);
            }
        })
    }

    getUsers() {
        const states = this.awareness.getStates();
        const users: any[] = [];

        states.forEach((state, clientId) => {
            if (state.user) {
                users.push({
                    clientId,
                    ...state.user,
                    cursor: state.cursor,
                    Selection: state.selection,
                })
            }
        })
        return users;
    }
    getFiles() {
        const files: any[] = [];
        const fileMap = new Map(this.filesMap);
        for (const [id, data] of fileMap) {

            if (data instanceof Y.Map) {
                const obj: any = {};
                data.forEach((value, key) => {
                    obj[key] = value;
                });
                files.push({ id, ...obj });
            } else {
                files.push({ id, ...data });
            }
        }
        return files;
    }
    getFileContent(fileId: string): string {
        const file = this.filesMap.get(fileId);
        return file?.content || ' ';
    }

    onFilesChange(callback: (data: any) => void) {
        this.fileCallbacks.push(callback);

    }

    onAwarenessChange(callback: (users: any[]) => void) {

        this.awareness.on('change', () => {
            callback(this.getUsers());
        })
    }
    destroy() {
        if (this.binding) {
            this.binding.destroy();
        }
        this.provider.destroy();
        this.doc.destroy();
    }
}

class YjsProviderManager {
    private providers: Map<string, YjsProvider> = new Map();

    async getProvider(projectId: string, roomId: string, userId: string, userName: string): Promise<YjsProvider> {
        if (!this.providers.has(roomId)) {

            const provider = new YjsProvider(roomId, userId, userName);

            this.providers.set(roomId, provider);
            await provider.init(projectId);

        }
        return this.providers.get(roomId)!;
    }

    removeProvider(roomId: string) {
        const provider = this.providers.get(roomId);
        if (provider) {
            provider.destroy();
            this.providers.delete(roomId);
        }
    }
}
export const yjsManager = new YjsProviderManager();