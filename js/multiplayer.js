let playerName;
let gameEnded = false;
let opponentScore = 0;
let currentRoom = null;


function setupMultiplayerListeners(socket, playerName) {
  socket.on("joinedRoom", (roomData) => {
    console.log(`Joined room: ${roomData.roomId}`);
    const queryParams = new URLSearchParams({
       matchId: roomData.roomId ,

    });
  
    // Generate new URL with query parameters
    const newUrl = `${window.location.href}?${queryParams.toString()}`;
    history.pushState(null, null, newUrl);
    currentRoom = roomData.roomId;
  });

  socket.on("playerConnected", (players) => {
    console.log("Players:", players);
    if (players.length === 2) {
      startCapture();
      

      function delay(ms) {
        return new Promise(resolve => {
            setTimeout(resolve, ms);
        });
    }
    
    async function startSreenshare() {
        console.log("Before delay");
        await delay(10000); // Wait for 10 seconds
        console.log("After delay");
        let loadingMsg = select("#loadingMsg");
        if (loadingMsg) loadingMsg.remove();
        cnv.style("display", "block");
        isMultiplayer = true;
        drawMultiplayer();
        isPlay = true;
        score = 0;
        opponentScore = 0;
        lives = 3;
        gameEnded = false;
        loop();
        let delayedbox= document.getElementById("delayed-box");
        delayedbox.style.position = "absolute";
        delayedbox.style.top = "50%";
        delayedbox.style.right = "0";
        delayedbox.style.transform = "translateY(-50%)";
        delayedbox.style.width = "200px";
        delayedbox.style.height = "200px";
        delayedbox.style.backgroundColor = "#f0f0f0";
        delayedbox.style.border = "1px solid #ccc";
        delayedbox.style.padding = "20px";
    }
    
    startSreenshare();

     
    }
  });

  socket.on("updateOpponentState", (data) => {
    updateOpponentState(data);
  });

  socket.on("updateScores", (scores) => {
    console.log("Scores:", scores);
    if (scores[playerName] !== undefined) {
      score = scores[playerName];
    }
    for (let player in scores) {
      if (player !== playerName) {
        opponentScore = scores[player];
        break;
      }
    }
  });

  socket.on("gameOver", (data) => {
    if (!gameEnded && data.roomId === currentRoom) {
      gameEnded = true;
      
      console.error("data is" ,JSON.stringify(data));
      if (score > opponentScore) {
        showGameOverAlert('You won!', 'Congratulations!', 'success');
      } else {
        showGameOverAlert('You lost!', 'Game Over', 'error');
      }
    }
  });

  socket.on("disconnect", () => {
    socket.emit("playerDisconnected", {playerName, roomId: currentRoom});
  });

  socket.on("playerDisconnected", (data) => {
    if (!gameEnded && data.roomId === currentRoom) {
      gameEnded = true;
      gameOver();
      if (data.disconnectedPlayerName !== playerName) {
        showGameOverAlert('You won!', 'The other player has disconnected.', 'success');
      }
    }
  });

  socket.on("roomClosed", () => {
    showGameOverAlert('Room Closed', 'The game room has been closed.', 'info');
  });
}

function showGameOverAlert(title, text, icon) {
  Swal.fire({
    title: title,
    html: `
      ${text}<br><br>
      Your score: ${score}<br>
      Opponent's score: ${opponentScore}

    `,
    icon: icon,
    confirmButtonText: 'Play Again'
  }).then((result) => {
    if (result.isConfirmed) {
      startMultiplayer();    }
  });
}

function startMultiplayer() {
  document.getElementById("multiplayerBtn").style.display = "none";
  document.getElementById("singleplayerBtn").style.display = "none";


  const queryParams = new URLSearchParams({
    token: 'secret',
    returnURL: 'mybackend.com/api/results',
    player1Id: 'zyx',
  });

  // Generate new URL with query parameters
  const newUrl = `${window.location.href}?${queryParams.toString()}`;
  history.pushState(null, null, newUrl);


  document.getElementById("multiplayerBtn").style.display = "none";
  document.getElementById("singleplayerBtn").style.display = "none";

  Swal.fire({
    title: 'Enter your name',
    input: 'text',
    inputPlaceholder: 'Your name',
    showCancelButton: true,
    inputValidator: (value) => {
      if (!value) {
        return 'You need to enter a name!'
      }
    }
  }).then((result) => {
    if (result.isConfirmed) {
      playerName = result.value;
      socket = io();
      socket.emit("joinRoom", playerName);
      showSearchingState();
      // setupMultiplayerListeners(socket, playerName);
      // loop();
    } else {
      // If the user cancels, show the buttons again
      document.getElementById("multiplayerBtn").style.display = "block";
      document.getElementById("singleplayerBtn").style.display = "block";
    }
  });
}
