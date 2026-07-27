'use client'

import { useRef, useState, useEffect } from "react"
import ReactDom from 'react-dom';
interface CursorOverlayProps {
    users: Array<{
        clientId: number;
        id: string;
        name: string;
        color: string;
        cursor?: { lineNumber: number; column: number };
        selection?: any;
    }>;
    currentUserId: string;
    editor: any;
}
export default function CursorOverlay({users, currentUserId,editor} : CursorOverlayProps){
    
    console.log("cursor overlay" , users,currentUserId)
    const ContainerRef = useRef<HTMLDivElement>(null);
    
    const [cursorPosition, setcursorPosition] = useState<any[]>([])
    useEffect(() => {
        console.log("😭😭😭")
      if(!editor)return;

      const renderCursor = ()=>{
       const position = users.filter(
        user=>user.id !== currentUserId && user.cursor).map(user=>{
            const cursorPosition = editor.getScrolledVisiblePosition({
                lineNumber : user.cursor!.lineNumber,
                column  : user.cursor!.column,
            })
            return{
            ...user,position : cursorPosition
        }
        }).filter(item => item.position !== null);
        setcursorPosition(position);
        console.log("position = ",cursorPosition)
      }
      renderCursor();

      const OnScroll = editor.onDidScrollChange(renderCursor);

       return () => OnScroll.dispose();
    }, [editor, users, currentUserId]);


     return (
        <div ref={ContainerRef} className="absolute inset-0 pointer-events-none z-10">
            {cursorPosition.map((user) => (
                <div
                    key={user.clientId}
                    className="absolute pointer-events-none"
                    style={{
                        left: `${user.position.left}px`,
                        top: `${user.position.top + 1}px`,
                    }}
                >
                    
                   <div
                        className="w-[2px] h-[18px] animate-blink"
                        style={{ backgroundColor: user.color }}
                    />
                    
                    {/* User label */}
                    <span
                        className="absolute text-[10px] px-1 py-0.5 rounded whitespace-nowrap"
                        style={{
                            left: '0px',
                            top: '-20px',
                            backgroundColor: user.color,
                            color: '#fff',
                        }}
                    >
                        {user.name}
                    </span>
                </div>
            ))}
        </div>
    );

      
    
}
