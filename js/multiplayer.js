let playerName;
let gameEnded = false;
let opponentScore = 0;
let currentRoom = null;


function setupMultiplayerListeners(socket, playerName) {
  socket.on("joinedRoom", (roomData) => {
    console.log(`Joined room: ${roomData.roomId}`);
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
    
    async function myFunction() {
        console.log("Before delay");
        await delay(5000); // Wait for 5 seconds
        console.log("After delay");
    }
    
    myFunction();
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
      if (data.loser !== playerName) {
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
    player1Id: 'zz99zyx',
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