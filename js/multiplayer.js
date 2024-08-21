// js/multiplayer.js
function setupMultiplayerListeners(socket, playerName) {
  socket.on("playerConnected", (players) => {
    console.log("Players:", players);
    if (players.length === 2) {
      let loadingMsg = select("#loadingMsg");
      if (loadingMsg) loadingMsg.remove();
      cnv.style("display", "block");
      isPlay = true;
      score = 0;
      lives = 3;
      loop();
    }
  });

  socket.on("updateScores", (scores) => {
    console.log("Scores:", scores);
  });

  socket.on("gameOver", (losingPlayerName) => {
    if (losingPlayerName !== playerName) {
      gameWon();
    }
  });

  socket.on("disconnect", () => {
    console.log("A player disconnected");
    socket.emit("playerDisconnected", playerName);
  });

  socket.on("playerDisconnected", (disconnectedPlayerName) => {
    if (disconnectedPlayerName !== playerName) {
      gameWon();
    }
  });
}

function startMultiplayer() {
  let playerName;
  document.getElementById("gameModePopup").style.display = "none";
  playerName = prompt("Enter your name:");
  socket = io();
  socket.emit("join", playerName);
  showSearchingState();
  setupMultiplayerListeners(socket, playerName);
  setInterval(generateRandomFruit, 500);
}

function generateRandomFruit() {
  if (gameState.fruits.length < 5) {
    const newFruit = randomFruit();
    gameState.fruits.push(newFruit);
  }
}

function clearCanvas() {
  clear(); // Clear the canvas using p5.js clear function
}
