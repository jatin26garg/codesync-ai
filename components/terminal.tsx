"use client"
import { socket } from "@/lib/socket"
import React, { useRef } from "react"
import { useState } from "react"
import { useEffect } from "react"
import { ProjectResponse } from "@/app/api/projects/route"
import { Terminal } from "@xterm/xterm"
import "@xterm/xterm/css/xterm.css";

export default function TerminalComponent({ projectId, projectName }: { projectId: string, projectName: string }) {

    const [command, setcommand] = useState("")

    const TerminalRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!TerminalRef) return;
        const terminal = new Terminal({
            cursorBlink: true,
            fontSize: 12,
            theme: {
                background: "#1e1e1e",
                foreground: "#d4d4d4",
                cursor: "#d4d4d4",
            },
            
            rows: 20,
            cols: 80,
          
            scrollback: 1000,
        });
       
            terminal.open(TerminalRef.current);

        terminal.writeln(
            "Welcome to CodeSync\r\n"
        )
        terminal.writeln(`\x1b[1;34mProject: ${projectName}\x1b[0m`);

        const handleTerminaOutput = (output: string) => {
            console.log("😐😐😐😐", output)
            terminal.write(output)
        }
        socket.on("terminal-output", handleTerminaOutput);
        return () => {
            socket.off("terminal-output", handleTerminaOutput);
            terminal.dispose();
        }
    }, [projectName])


    const handleCommand = () => {

        if (!command.trim()) return;
        console.log("input = ", command)
        socket.emit("terminal-input", {
            projectId,
            command :  command  + "\r",
        })
        setcommand("")
    }
    return (
    <div className="h-82 bg-[#1e1e1e] border-t border-[#2A2B2C] flex flex-col overflow-hidden">

        {/* XTERM OUTPUT */}
        <div
            ref={TerminalRef}
            className="flex-1 h-10 p-2 "
        />

        {/* INPUT */}
        <div className="flex items-center gap-2 px-2 pb-2  ">
            <span className="text-[#27c93f]">
                $
            </span>

            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    handleCommand();
                }}
                className="flex-1"
            >
                <input
                    value={command}
                    onChange={(e) =>
                        setcommand(e.target.value)
                    }
                    type="text"
                    className=" h-full w-full bg-transparent text-[#d4d4d4] outline-none border-none font-mono text-xs"
                    placeholder="Type a command..."
                    autoFocus
                    spellCheck={false}
                />
            </form>
        </div>

    </div>
);
}