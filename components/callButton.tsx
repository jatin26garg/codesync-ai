"use client "
import React from "react"
import { socket } from "@/lib/socket"
import { UseSelector, useSelector } from "react-redux"
import { useState } from "react"
import { Rootstate } from "@/app/store/store"
import { peer } from "@/lib/webRTC"

export default function CallButton({ projectId, onlineUsers }: {
    projectId: string,
    onlineUsers:
    {
        id: string;
        name: string;
    }[]
}) {

    const [iscalling, setiscalling] = useState(false)
    const [isDropDown, setisDropDown] = useState(false)
    const [selectUser, setselectUser] = useState<{ id: string; name: string } | null>(null)
    const callerId = useSelector(
        (state: Rootstate) => state.user.userId
    );
    const callerName = useSelector(
        (state: Rootstate) => state.user.name
    )

    const handleCall = async (targetUserId : string, targetUserName : string) => {
        try {
            if(targetUserId === callerId?.toString())return;

            setiscalling(true);
            setisDropDown(false);
            socket.emit("call-user", { projectId, callerId, callerName,targetUserId,targetUserName });
        } catch (error) {
            console.log("call-button error", error);
        }
    }
    return (
        <div className="relative">
            {/* Main Button */}
            <button
                onClick={() => setisDropDown(!isDropDown)}
                disabled={iscalling}
                className="hover:cursor-pointer flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 
                        bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 
                        text-white shadow-lg shadow-green-600/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <span>{iscalling ? '📞 Calling...' : '📞 Call'}</span>
                <svg className={`w-4 h-4 transition-transform ${isDropDown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* Dropdown */}
            {isDropDown && !iscalling && (
                <div className="absolute top-full mt-2 right-0 w-56 bg-[#1e1e1e] rounded-xl shadow-2xl border border-[#3d3d3d] overflow-hidden z-50">
                    <div className="p-2 border-b border-[#3d3d3d]">
                        <span className="text-xs text-gray-400 font-medium">Online Users</span>
                        <span className="text-xs text-gray-500 ml-2">({onlineUsers.length})</span>
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                        {onlineUsers.length === 0 ? (
                            <div className="px-4 py-3 text-sm text-gray-500 text-center">
                                No online users
                            </div>
                        ) : (
                            onlineUsers.map((user) => (
                                <button
                                    key={user.id}
                                    onClick={() => handleCall(user.id, user.name)}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#2d2d2d] transition-colors text-left"
                                >
                                    <div className="relative">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-[#1e1e1e]"></div>
                                    </div>
                                    <span className="text-sm text-white">{user.name}</span>
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}