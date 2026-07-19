"use client"
import { socket } from "@/lib/socket"
import React, { useRef } from "react"
import { useState } from "react"
import { useEffect } from "react"
import { ProjectResponse } from "@/app/api/projects/route"

export default function Terminal({ projectId, projectName }: { projectId: string, projectName: string }) {

    const [command, setcommand] = useState("")
    const [output, setoutput] = useState<string[]>([])
    const terminalRef = useRef<HTMLDivElement|null>(null)
    useEffect(() => {
        const handleTerminalOutput = ({ output }: { output: string }) => {
            setoutput((prev) => [...prev, output]);
        }
        socket.on("terminal-output", handleTerminalOutput);
        return () => {
            socket.off("terminal-output", handleTerminalOutput);
        }
    }, [])
    useEffect(() => {
        terminalRef.current?.scrollIntoView({
            behavior : "smooth",
        })
    }, [output]);

    const handleCommand = () => {

        if (!command.trim()) return;
        socket.emit("terminal-input", {
            projectId,
            command
        })
        setcommand("")
    }
    return (
        <div className="h-60 bg-[#1e1e1e] border-t border-[#2A2B2C] flex flex-col flex-shrink-2 overflow-hidden">
    {/* Terminal Header */}
    <div className="bg-[#252526] px-3 py-1.5 flex items-center justify-between border-b border-[#2A2B2C] flex-shrink-0">
        <div className="flex items-center gap-2">
            <span className="text-[10px] text-[#ff5f56]">●</span>
            <span className="text-[10px] text-[#ffbd2e]">●</span>
            <span className="text-[10px] text-[#27c93f]">●</span>
            <span className="text-[10px] text-gray-500 ml-2 font-semibold tracking-wider">TERMINAL</span>
        </div>
        <button className="text-xs text-gray-500 hover:text-white transition">
            ✕
        </button>
    </div>

    {/* Terminal Content */}
    <div className="flex-1 overflow-y-auto p-2 font-mono text-xs" >
        {output.map((line, idx) => (
            <div key={idx} className="text-[#d4d4d4] whitespace-pre-wrap break-words">
                {line}
            </div>
        ))}
        
        <div ref={terminalRef} className="flex items-center gap-2 mt-0.5">
            <span className="text-[#27c93f] flex-shrink-0">$</span>
            <form 
                onSubmit={(e) => {
                    e.preventDefault();
                    handleCommand();
                }}
                className="flex-1 min-w-0"
            >
                <input
                    value={command}
                    onChange={(e) => setcommand(e.target.value)}
                    type="text"
                    className="w-full bg-transparent text-[#d4d4d4] outline-none border-none font-mono text-xs py-0.5"
                    placeholder="Type a command..."
                    autoFocus
                    spellCheck={false}
                />
            </form>
        </div>
    </div>
</div>
    )
}