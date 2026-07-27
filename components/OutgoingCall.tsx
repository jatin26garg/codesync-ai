    "use client"
    import { socket } from "@/lib/socket"
    import { peer } from "@/lib/webRTC";
    import { useEffect, useState } from "react"
    import VideoCall from "./videocall";

    export default function OutgoingCall() {

        useEffect(() => {
            const HandleAccept = async({reciverSocketId }: {reciverSocketId:string})=>{
                console.log("call accepted on outgoingCall.tsx");
                const stream = await navigator.mediaDevices.getUserMedia({
                    video : true,
                    audio :true,
                });
                stream.getTracks().forEach(track =>{
                    peer.addTrack(track,stream);
                })
                peer.onicecandidate = (event)=>{
                    if(event)
                    socket.emit("ice-candidate",{candidate : event.candidate ,targetId :reciverSocketId })
                }
                const offer = await peer.createOffer();
                await peer.setLocalDescription(offer);
                socket.emit("offer",{offer,reciverSocketId})

            }
            socket.on("call-accepted", HandleAccept);

        return () => {
            socket.off("call-accepted", HandleAccept);
        }
        }, [])

        return null;

        
    }