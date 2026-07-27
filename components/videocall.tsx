"use client"
import { useState,useRef,useEffect } from "react"

export default function VideoCall({stream}:{stream: MediaStream|null}){
    const localVideoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if(localVideoRef.current && stream){
            localVideoRef.current.srcObject = stream
        }
        
    }, [stream]);
    return(
        <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
        />
    )
}