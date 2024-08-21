// server.js

const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

app.use(express.static("./"));

const players = new Map();
let gameState = {
  fruits: [],
  scores: {},
  lives: {},
};

function gameLoop() {
  io.emit("updateGameState", gameState);
}

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("join", (playerName) => {
    players.set(socket.id, playerName);
    gameState.scores[socket.id] = 0;
    gameState.lives[socket.id] = 3;
    io.emit("playerConnected", Array.from(players.values()));

    if (players.size === 2) {
      // Start the game when two players are connected
      io.emit("startGame");

      // Start the game loop
      setInterval(gameLoop, 1000 / 60); // 60 FPS
    }

    // Emit the current game state to the newly joined player
    socket.emit("updateFruits", gameState.fruits);
  });

  socket.on("updateScore", (score) => {
    gameState.scores[socket.id] = score;
    io.emit("updateScores", gameState.scores);
  });

  socket.on("hitBomb", () => {
    io.emit("gameOver", players.get(socket.id));
  });

  socket.on("disconnect", () => {
    console.log("A player disconnected");
    io.emit("playerDisconnected", players.get(socket.id));
    players.delete(socket.id);
    delete gameState.scores[socket.id];
    delete gameState.lives[socket.id];
  });

  socket.on("playerDisconnected", (playerName) => {
    io.emit("playerDisconnected", playerName);
  });

  socket.on("gameOver", (losingPlayerName) => {
    io.emit("gameOver", losingPlayerName);
  });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
