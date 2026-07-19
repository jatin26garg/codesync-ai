import * as pty from "node-pty"
import {EventEmitter} from "events";


const terminals = new Map<string,pty.IPty>();

export function getOrCreateTerminal(projectId:string){
    
    let terminal = terminals.get(projectId);
    if(terminal){
        return terminal;
    }
    const output = new EventEmitter();
    const shell = process.platform === "win32"?"powershell.exe":"bash";
    terminal = pty.spawn(shell,[],{
        name:"xterm-color",
        cols : 80,
        rows :30,
        cwd: process.cwd(),
        env: process.env as {[key : string]:string};
    })
    terminals.set(projectId,terminal);
    return terminal;
}
