// const localVideo = document.getElementById("localVideo");
const remoteVideo = document.getElementById("remoteVideo");
// const logElem = document.getElementById("log");
// const startElem = document.getElementById("start");
// const stopElem = document.getElementById("stop");

let localStream;
let peerConnection;
let isInitiator = false;


const config = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
    {
      urls: "turn:numb.viagenie.ca",
      credential: "muazkh",
      username: "webrtc@live.com",
    },
  ],
  iceCandidatePoolSize: 10,
};

const displayMediaOptions = {
  video: {
    displaySurface: "window",
  },
  audio: false,
};

const signalingServerUrl = "ws://localhost:8080";
const signalingSocket = new WebSocket(signalingServerUrl);

signalingSocket.onopen = () => {
  
};

signalingSocket.onmessage = async (event) => {
  let messageData;

  try {
    messageData =
      event.data instanceof Blob ? await event.data.text() : event.data;
    const data = JSON.parse(messageData);


    switch (data.type) {
      case "offer":
      
        await handleOffer(data.offer);
        break;
      case "answer":
    
        await handleAnswer(data.answer);
        break;
      case "ice-candidate":
 
        await handleIceCandidate(data.candidate);
        break;
      case "ready":
 
        isInitiator = true;
        break;
      default:
    }
  } catch (err) {
   
  }
};

// startElem.addEventListener("click", startCapture, false);
// stopElem.addEventListener("click", stopCapture, false);



async function startCapture() {
//   logElem.textContent = "";

  try {
    localStream = await navigator.mediaDevices.getDisplayMedia(
      displayMediaOptions
    );
    // localVideo.srcObject = localStream;

    if (signalingSocket.readyState === WebSocket.OPEN) {
      setupWebRTC();
    } else {
      signalingSocket.onopen = () => {
       
        setupWebRTC();
      };
    }

    dumpOptionsInfo();
  } catch (err) {
  }
}

function stopCapture() {
//   if (localVideo.srcObject) {
//     localVideo.srcObject.getTracks().forEach((track) => track.stop());
//     localVideo.srcObject = null;
//   }
  if (remoteVideo.srcObject) {
    remoteVideo.srcObject.getTracks().forEach((track) => track.stop());
    remoteVideo.srcObject = null;
  }
  if (peerConnection) {
    peerConnection.close();
    peerConnection = null;
  }
  isInitiator = false;
}

function dumpOptionsInfo() {

}

function setupWebRTC() {

  peerConnection = new RTCPeerConnection(config);

  localStream.getTracks().forEach((track) => {
    peerConnection.addTrack(track, localStream);
  });

  peerConnection.onicecandidate = (event) => {

    if (event.candidate) {
      signalingSocket.send(
        JSON.stringify({
          type: "ice-candidate",
          candidate: event.candidate,
        })
      );
    } else {

    }
  };

  peerConnection.oniceconnectionstatechange = () => {
    
  };

  peerConnection.onsignalingstatechange = () => {

  };

  peerConnection.ontrack = (event) => {
    if (event.streams && event.streams[0]) {

      if (remoteVideo) {
        remoteVideo.srcObject = event.streams[0];
      } else {
             }
    } else {
     
    }
  };

  if (isInitiator) {
  
    createAndSendOffer();
  } else {
   
    signalingSocket.send(JSON.stringify({ type: "ready" }));
  }
}

async function createAndSendOffer() {
  try {
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
        signalingSocket.send(
      JSON.stringify({
        type: "offer",
        offer: peerConnection.localDescription,
      })
    );
  } catch (error) {
    
  }
}

async function handleOffer(offer) {
  if (!peerConnection) {
    setupWebRTC();
  }

  try {
    await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    signalingSocket.send(
      JSON.stringify({
        type: "answer",
        answer: peerConnection.localDescription,
      })
    );
  } catch (error) {
   
  }
}

async function handleAnswer(answer) {
  if (!peerConnection) {
    return;
  }

  try {
    await peerConnection.setRemoteDescription(
      new RTCSessionDescription(answer)
    );
  } catch (error) {
  }
}

async function handleIceCandidate(candidateData) {
  if (!peerConnection) {
    return;
  }

  try {
    const candidate = new RTCIceCandidate(candidateData);
    await peerConnection.addIceCandidate(candidate);
  } catch (error) {
  }
}
