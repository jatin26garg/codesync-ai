
import * as Y from 'yjs';
import { WebsocketProvider } from "y-websocket";
import { MonacoBinding } from 'y-monaco';
import { Awareness } from 'y-protocols/awareness.js';

export class YjsProvider {
    private doc: Y.Doc;
    private provider: WebsocketProvider;
    private awareness: Awareness
    private binding: MonacoBinding | null = null;
    private editor: any = null;

    constructor(roomId: string, userId: string, userName: string) {
        this.doc = new Y.Doc();
        
        this.provider = new WebsocketProvider(
            process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3002',
            `collab-${roomId}`,
            this.doc
        )
        this.awareness = this.provider.awareness;
        this.awareness.setLocalState({
            user: {
                id: userId,
                name: userName,
                color: this.getrandomcolor(),
            },
            cursor: null,
            selection: null,
        });
    }

    private getrandomcolor(): string {
        const colors = [
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
            '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    bindEditor(editor: any) {
        this.editor = editor;
        this.binding = new MonacoBinding(
            this.doc.getText('monaco'),
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
            console.log("cursor position = ",position);
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
    private providers : Map<string , YjsProvider> = new Map();

    getProvider(roomId: string ,userId : string, userName : string): YjsProvider{
        if(!this.providers.has(roomId)){
            const provider  = new YjsProvider(roomId, userId ,userName);
            this.providers.set(roomId , provider);
        }
        return this.providers.get(roomId)!;
    }
    removeProvider(roomId: string){
        const provider = this.providers.get(roomId);
        if(provider){
            provider.destroy();
            this.providers.delete(roomId);
        }
    }
}
export const yjsManager = new YjsProviderManager();