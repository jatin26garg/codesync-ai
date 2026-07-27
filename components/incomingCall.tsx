"use client"
import { socket } from "@/lib/socket"
import { peer } from "@/lib/webRTC";
import { useEffect, useState } from "react"
import VideoCall from "./videocall";

export default function IncomingCall({ projectId }: { projectId: string }) {


    const [incomingCall, setincomingCall] = useState<{ callerId: string; callerName: string; callerSocketId: string } | null>(null);
    const [localStream, setlocalStream] = useState<MediaStream | null>(null)
    useEffect(() => {

        const handleCall = ({ callerId, callerName, callerSocketId }: { callerId: string, callerName: string, callerSocketId: string }) => {
            console.log("incoming - call abc", callerId, callerName, callerSocketId);

            setincomingCall({ callerId, callerName, callerSocketId });

        }
        
        socket.on("incoming-call", handleCall);
       
        return () => {
            socket.off("incoming-call", handleCall);
           
        };
    }, []);

    const handleAccept = async () => {
        try {
           socket.emit("accept-call",{callerId:incomingCall?.callerId,projectId,callerSocketId:incomingCall?.callerSocketId});
           setincomingCall(null);
        }catch(error){
            console.log("error",error);
        }

    }
    const handlereject = () => {
        socket.emit("reject-call", { callerId: incomingCall?.callerId, projectId });
        setincomingCall(null);
    }
    return (
        <>
            {incomingCall && (
                <div className="fixed top-4 right-4 z-50 w-80 bg-[#1e1e1e] rounded-xl shadow-2xl border border-[#3d3d3d] p-5 animate-in slide-in-from-top-2 duration-300">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                            {incomingCall.callerName?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-white font-medium text-sm truncate">
                                {incomingCall.callerName}
                            </p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                                <span className="text-xs text-gray-400">Incoming call...</span>
                            </div>
                        </div>
                    </div>


                    <div className="flex items-center gap-3 mt-2">

                        <button
                            onClick={handleAccept}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition shadow-lg shadow-green-500/25">
                            <span className="text-lg">📞</span>
                            Accept
                        </button>


                        <button
                            onClick={handlereject}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition shadow-lg shadow-red-500/25">
                            <span className="text-lg rotate-[135deg]">📞</span>
                            Reject
                        </button>
                    </div>
                </div>

            )}
            {localStream && (<VideoCall stream={localStream} />)}
        </>
    )

}