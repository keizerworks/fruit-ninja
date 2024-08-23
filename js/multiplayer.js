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
      alert("You won!");
      window.location.reload();
    } else {
      alert("You lost! Better luck next");
      window.location.reload();
    }
  });

  socket.on("disconnect", () => {
    socket.emit("playerDisconnected", playerName);
  });

  socket.on("playerDisconnected", (disconnectedPlayerName) => {
    gameOver();
    if (disconnectedPlayerName !== playerName) {
      alert("The other player has disconnected. You won!");
      window.location.reload();
    }
  });
}

function startMultiplayer() {
  document.getElementById("multiplayerBtn").style.display = "none";
  document.getElementById("singleplayerBtn").style.display = "none";
  playerName = prompt("Enter your name:");

  socket = io();
  socket.emit("join", playerName);
  showSearchingState();
  setupMultiplayerListeners(socket, playerName);
  loop();
}
