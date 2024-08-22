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
  swordX: {},
  swordY: {},
};

function gameLoop() {
  // Emit the opponent's state to the other player
  // players.forEach((playerName, socketId) => {
  //   const opponentId = Array.from(players.keys()).find((id) => id !== socketId);
  //   if (opponentId) {
  //     io.to(opponentId).emit("updateOpponentState", {
  //       swordX: gameState.swordX[socketId],
  //       swordY: gameState.swordY[socketId],
  //       fruits: gameState.fruits[socketId],
  //       score: gameState.scores[socketId],
  //       lives: gameState.lives[socketId],
  //     });
  //   }
  // });
}

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("join", (playerName) => {
    players.set(socket.id, playerName);
    gameState.scores[socket.id] = 0;
    gameState.lives[socket.id] = 3;
    gameState.swordX[socket.id] = 0;
    gameState.swordY[socket.id] = 0;
    gameState.fruits[socket.id] = [];
    io.emit("playerConnected", Array.from(players.values()));

    if (players.size === 2) {
      // Start the game when two players are connected
      io.emit("startGame");

      // Start the game loop
      setInterval(gameLoop, 1000 / 60); // 60 FPS
    }
  });

  socket.on("updateOpponentData", (data) => {
    const opponentId = Array.from(players.keys()).find(
      (id) => id !== socket.id
    );
    if (opponentId) {
      io.to(opponentId).emit("updateOpponentState", data);
    }
  });

  socket.on("disconnect", () => {
    console.log("A player disconnected");
    io.emit("playerDisconnected", players.get(socket.id));
    players.delete(socket.id);
    delete gameState.scores[socket.id];
    delete gameState.lives[socket.id];
    delete gameState.swordX[socket.id];
    delete gameState.swordY[socket.id];
    delete gameState.fruits[socket.id];

    // Check if the other player is still connected
    if (players.size === 1) {
      const winningPlayerName = Array.from(players.values())[0];
      io.emit("gameOver", winningPlayerName);
    }
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
