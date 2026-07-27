"use client"
import { socket } from "@/lib/socket"
import { peer } from "@/lib/webRTC";
import { useEffect } from "react";

export default function ReciverWebRTC() {
    useEffect(() => {

        const handleoffer = async ({ offer, callerId }: { offer: any, callerId: string }) => {
            console.log("offer recived");
            await peer.setRemoteDescription(offer);

            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true,
            });

            stream.getTracks().forEach(track => {
                peer.addTrack(track, stream);
            });
            peer.onicecandidate = (event) => {
                if (event.candidate) {
                    socket.emit("ice-candidate", { candidate: event.candidate, targetId: callerId })
                }
            }
            const answer =  await peer.createAnswer();
            await peer.setLocalDescription(answer);

            socket.emit("answer", {answer,callerId })

        }
        const handleIceCandidates = async({candidate}:{candidate:RTCIceCandidateInit })=>{
            await peer.addIceCandidate(candidate);
        }
        socket.on("offer", handleoffer);
        socket.on("ice-candidate", handleIceCandidates);
        return () => {
            socket.off("offer", handleoffer);
            socket.off("ice-candidate", handleIceCandidates);
        };
    }, []);
    return null;
}