let playerName;
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
      lives = 3;
      loop();
    }
  });

  socket.on("updateOpponentState", (data) => {
    updateOpponentState(data);
  });

  socket.on("updateScores", (scores) => {
    console.log("Scores:", scores);
  });

  socket.on("gameOver", (losingPlayerName) => {
    if (losingPlayerName !== playerName) {
      Swal.fire({
        title: 'Congratulations!',
        text: 'You won!',
        icon: 'success',
        confirmButtonText: 'Play Again'
      }).then((result) => {
        if (result.isConfirmed) {
          window.location.reload();
        }
      });
    } else {
      Swal.fire({
        title: 'Game Over',
        text: 'You lost! Better luck next time',
        icon: 'error',
        confirmButtonText: 'Try Again'
      }).then((result) => {
        if (result.isConfirmed) {
          window.location.reload();
        }
      });
    }
  });

  socket.on("disconnect", () => {
    socket.emit("playerDisconnected", playerName);
  });

  socket.on("playerDisconnected", (disconnectedPlayerName) => {
    gameOver();
    if (disconnectedPlayerName !== playerName) {
      Swal.fire({
        title: "You Won!",
        text: "The other player has disconnected.",
        icon: "success",
        confirmButtonText: "OK"
      }).then((result) => {
        if (result.isConfirmed) {
          window.location.reload();
        }
      });
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
