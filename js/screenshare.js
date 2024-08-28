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
  console.log("WebSocket connection established");
};

signalingSocket.onmessage = async (event) => {
  let messageData;

  try {
    messageData =
      event.data instanceof Blob ? await event.data.text() : event.data;
    const data = JSON.parse(messageData);
    console.log("Received message:", data);

    switch (data.type) {
      case "offer":
        console.log("Handling offer");
        await handleOffer(data.offer);
        break;
      case "answer":
        console.log("Handling answer");
        await handleAnswer(data.answer);
        break;
      case "ice-candidate":
        console.log("Handling ICE candidate");
        await handleIceCandidate(data.candidate);
        break;
      case "ready":
        console.log("Peer is ready");
        isInitiator = true;
        break;
      default:
        console.warn("Unknown message type:", data.type);
    }
  } catch (err) {
    console.error("Error processing message:", err);
    console.log("Problematic message:", messageData);
  }
};

// startElem.addEventListener("click", startCapture, false);
// stopElem.addEventListener("click", stopCapture, false);

console.log = (msg) => {
//   logElem.textContent += `${msg}\n`;
  console.info(msg);
};
console.error = (msg) => {
//   logElem.textContent += `Error: ${msg}\n`;
//   console.error(msg);
};

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
        console.log("WebSocket connection established");
        setupWebRTC();
      };
    }

    dumpOptionsInfo();
  } catch (err) {
    console.error(err);
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
//   if (!localVideo.srcObject) return;
//   const videoTrack = localVideo.srcObject.getVideoTracks()[0];
//   console.log(
//     "Track settings:",
//     JSON.stringify(videoTrack.getSettings(), null, 2)
//   );
//   console.log(
//     "Track constraints:",
//     JSON.stringify(videoTrack.getConstraints(), null, 2)
//   );
}

function setupWebRTC() {
  console.log("Setting up WebRTC connection");
  peerConnection = new RTCPeerConnection(config);

  localStream.getTracks().forEach((track) => {
    peerConnection.addTrack(track, localStream);
  });

  peerConnection.onicecandidate = (event) => {
    console.log("New ICE candidate:", event.candidate);
    if (event.candidate) {
      signalingSocket.send(
        JSON.stringify({
          type: "ice-candidate",
          candidate: event.candidate,
        })
      );
    } else {
      console.log("ICE gathering completed");
    }
  };

  peerConnection.oniceconnectionstatechange = () => {
    console.log("ICE connection state:", peerConnection.iceConnectionState);
  };

  peerConnection.onsignalingstatechange = () => {
    console.log("Signaling state:", peerConnection.signalingState);
  };

  peerConnection.ontrack = (event) => {
    if (event.streams && event.streams[0]) {
      console.log("Received remote stream");
      if (remoteVideo) {
        remoteVideo.srcObject = event.streams[0];
      } else {
        console.error("Remote video element not found");
      }
    } else {
      console.error("No streams found in the event");
    }
  };

  if (isInitiator) {
    console.log("Creating offer as initiator");
    createAndSendOffer();
  } else {
    console.log("Waiting for offer as non-initiator");
    signalingSocket.send(JSON.stringify({ type: "ready" }));
  }
}

async function createAndSendOffer() {
  try {
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    console.log("Sending offer");
    signalingSocket.send(
      JSON.stringify({
        type: "offer",
        offer: peerConnection.localDescription,
      })
    );
  } catch (error) {
    console.error("Error in offer creation and sending:", error);
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
    console.error("Failed to handle offer:", error);
  }
}

async function handleAnswer(answer) {
  if (!peerConnection) {
    console.error("PeerConnection not established.");
    return;
  }

  try {
    await peerConnection.setRemoteDescription(
      new RTCSessionDescription(answer)
    );
  } catch (error) {
    console.error("Failed to set remote description:", error);
  }
}

async function handleIceCandidate(candidateData) {
  if (!peerConnection) {
    console.error("PeerConnection not established.");
    return;
  }

  try {
    const candidate = new RTCIceCandidate(candidateData);
    await peerConnection.addIceCandidate(candidate);
    console.log("ICE candidate added successfully");
  } catch (error) {
    console.error("Error adding ICE candidate:", error);
    console.log("Problematic candidate data:", candidateData);
  }
}
