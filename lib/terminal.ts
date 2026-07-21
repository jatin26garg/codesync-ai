import * as pty from "node-pty"
import {EventEmitter} from "events";

interface TerminalSession {
    process : pty.IPty,
    output : EventEmitter,
}

const terminals = new Map<string,TerminalSession>();

export function CreateTerminal(projectId:string){
    

    let terminal = terminals.get(projectId);
    if(terminal){
        return terminal;
    }
    const output = new EventEmitter();
    const shell = process.platform === "win32"?"powershell.exe":"bash";
    let PtyProcess = pty.spawn(shell,[],{
        name:"xterm-color",
        cols : 80,
        rows :30,
        cwd: process.cwd(),
        env: process.env as {[key : string]:string},
    })
    PtyProcess.onData((data: string)=>{
        console.log("👍👍👍👍",data);
        output.emit("data",data);
    })
    PtyProcess.onExit(({exitCode})=>{
        output.emit("exit",exitCode);
        terminals.delete(projectId);
    })
    terminal = {process : PtyProcess, output };
    terminals.set(projectId,terminal);
    return terminal;
}
export function writeTerminal(projectId: string, data :string){
     console.log("🫡🫡🫡🫡",projectId, data)
    const terminal = terminals.get(projectId);
    if(terminal){
        terminal.process.write(data);
    }
}
export function getTerminal(projectId : string){
    
    return terminals.get(projectId);
}
export function removeTerminal(projectId : string){
    const terminal = terminals.get(projectId);
    if(terminal){
        terminal.process.kill();
        terminals.delete(projectId);
    }
}
