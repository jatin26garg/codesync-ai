import { useEffect } from "react";
import { socket } from "@/lib/socket";

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
type OnlineUser = {
    id: string;
    name: string;
};

type 

export function useCollaborationSocket