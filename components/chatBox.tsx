"use client "
import { socket } from "@/lib/socket"
import React, { useRef } from "react"
import { useState } from "react"
import { useEffect } from "react"
import { useSelector, UseSelector } from "react-redux"
import { Rootstate } from "@/app/store/store"

export type MessageType = {
    userId: string,
    message: string,
    userName: string
    time: Date,
}
type props = {
    projectId: string,
    messages: MessageType[],
    onlineusers: { name: string, id: string }[]
}

export default function ChatBox({
    projectId,
    messages,
    onlineusers,
}: props) {

    const [message, setmessage] = useState("")
    const messageRef = useRef<HTMLDivElement | null>(null);
    const [typing, settyping] = useState(false)
    useEffect(() => {
        messageRef.current?.scrollIntoView({
            behavior : "smooth",
        })
    }, [messages]);
     const userId = useSelector(
    (state: Rootstate) => state.user.userId
);
    
    const handleSendMessage = (e :React.FormEvent<HTMLFormElement>)=>{
        e.preventDefault();
        console.log("hhhhhhhhhhhhhhhhh",userId)

        if(!message.trim())return;

        socket.emit("send-message",{
            projectId,
            message,
        })
        setmessage("")
        settyping(false)
    }
   
    


    return (
    <div className="w-80 bg-[#1e1e1e] border-l border-[#2A2B2C] flex flex-col h-full">
    {/* Chat Header */}
    <div className="bg-[#252526] px-4 py-3 border-b border-[#3d3d3d] flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
            <span className="text-lg">💬</span>
            <span className="text-white font-medium">Project Chat</span>
        </div>
        <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-xs text-gray-400">{onlineusers.length}</span>
        </div>
    </div>

    {/* Messages */}
    <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <span className="text-4xl mb-2">💬</span>
                <span className="text-sm">No messages yet</span>
            </div>
        ) : (
            messages.map((msg, index) => (
                <div 
                    className={`flex items-end gap-2 ${msg.userId === userId ? 'flex-row-reverse' : ''}`} 
                    key={index}
                >
                    {/* Avatar */}
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0 ${
                        msg.userId === userId ? 'bg-blue-500' : 'bg-purple-500'
                    }`}>
                        {msg.userName?.charAt(0).toUpperCase() || 'U'}
                    </div>

                    {/* Message Content */}
                    <div className={`max-w-[80%] ${msg.userId === userId ? 'items-end' : ''}`}>
                        {/* Name & Time */}
                        <div className={`text-xs text-gray-400 mb-0.5 ${
                            msg.userId === userId ? 'text-right' : ''
                        }`}>
                            {msg.userId === userId ? 'You' : msg.userName}
                            <span className="ml-1 text-[10px] text-gray-500">{msg.time}</span>
                        </div>

                        {/* Message Bubble */}
                        <div className={`px-3 py-1.5 rounded-lg text-sm break-words ${
                            msg.userId === userId 
                                ? 'bg-blue-600 text-white rounded-tr-none' 
                                : 'bg-[#2d2d2d] text-gray-300 rounded-tl-none'
                        }`}>
                            {msg.message}
                        </div>
                    </div>
                    <div ref={messageRef}></div>
                </div>
            ))
        )}

        {/* Typing Indicator */}
        {typing && (
            <div className="flex items-center gap-2 text-sm text-gray-400">
                <span className="w-6 h-6 bg-gray-500 rounded-full flex items-center justify-center text-white text-xs">T</span>
                <span>typing</span>
                <span className="flex gap-0.5">
                    <span className="animate-bounce">.</span>
                    <span className="animate-bounce delay-75">.</span>
                    <span className="animate-bounce delay-150">.</span>
                </span>
            </div>
        )}
    </div>

    {/* Chat Input - Fixed at bottom */}
    <div className="bg-[#252526] p-3 border-t border-[#3d3d3d] flex-shirnk-0 py-10">
        <form onSubmit={handleSendMessage} className="flex gap-2">
            <button type="button" className="px-2 text-gray-400 hover:text-white transition">😊</button>
            <input
                type="text"
                placeholder="Type a message..."
                value={message}
                onChange={(e) => {
                    setmessage(e.target.value);
                    settyping(true);
                }}
                className="flex-1 bg-[#1e1e1e] border border-[#3d3d3d] rounded-lg px-3 py-1.5 text-white text-sm focus:border-blue-500 focus:outline-none transition placeholder-gray-500"
            />
            <button
                type="submit"
                disabled={!message.trim()}
                className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            >
                Send
            </button>
        </form>
    </div>
</div>
);
}
