export const peer = new RTCPeerConnection({
    iceServers:[
        {
            urls: "stun:stun.l.google.com:19302",
        }
    ]
})
peer.onicecandidate =(event)=>{
    console.log("ice candidate",event.candidate);
    
}