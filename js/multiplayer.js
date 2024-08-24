let playerName;
let gameEnded = false;
let opponentScore = 0;

function setupMultiplayerListeners(socket, playerName) {
  socket.on("playerConnected", (players) => {
    console.log("Players:", players);
    if (players.length === 2) {
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

  socket.on("gameOver", (losingPlayerName) => {
    if (!gameEnded) {
      gameEnded = true;
      if (losingPlayerName !== playerName) {
        showGameOverAlert('You won!', 'Congratulations!', 'success');
      } else {
        showGameOverAlert('You lost!', 'Game Over', 'error');
      }
    }
  });

  socket.on("disconnect", () => {
    socket.emit("playerDisconnected", playerName);
  });

  socket.on("playerDisconnected", (disconnectedPlayerName) => {
    if (!gameEnded) {
      gameEnded = true;
      gameOver();
      if (disconnectedPlayerName !== playerName) {
        showGameOverAlert('You won!', 'The other player has disconnected.', 'success');
      }
    }
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
      window.location.reload();
    }
  });
}

function startMultiplayer() {
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
      socket.emit("join", playerName);
      showSearchingState();
      setupMultiplayerListeners(socket, playerName);
      loop();
    } else {
      // If the user cancels, show the buttons again
      document.getElementById("multiplayerBtn").style.display = "block";
      document.getElementById("singleplayerBtn").style.display = "block";
    }
  });
}