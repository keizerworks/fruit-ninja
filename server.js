const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

app.use(express.static("./"));

const players = new Map();
let gameState = {
  fruits: [],
  scores: {},
};

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("join", (playerName) => {
    players.set(socket.id, playerName);
    gameState.scores[socket.id] = 0;
    io.emit("playerConnected", Array.from(players.values()));

    if (players.size === 2) {
      // Start the game when two players are connected
      io.emit("startGame");

      // Start generating fruits
    }
  });

  const FRUIT_SPAWN_INTERVAL = 1000; // 1 second
  const MAX_FRUITS = 5;

  function spawnFruit() {
    if (gameState.fruits.length < MAX_FRUITS) {
      const newFruit = generateFruit();
      gameState.fruits.push(newFruit);
      io.emit("updateFruits", gameState.fruits);
    }
  }

  setInterval(spawnFruit, FRUIT_SPAWN_INTERVAL);

  socket.on("updateScore", (score) => {
    gameState.scores[socket.id] = score;
    io.emit("updateScores", gameState.scores);
  });

  socket.on("addFruit", (fruit) => {
    gameState.fruits.push(fruit);
    io.emit("updateFruits", gameState.fruits);
  });

  socket.on("sliceFruit", (fruitIndex) => {
    gameState.fruits.splice(fruitIndex, 1);
    io.emit("updateFruits", gameState.fruits);
  });

  socket.on("disconnect", () => {
    players.delete(socket.id);
    delete gameState.scores[socket.id];
    io.emit("updatePlayers", Array.from(players.values()));
    io.emit("updateScores", gameState.scores);
  });

  socket.on("gameOver", (losingPlayerName) => {
    io.emit("gameOver", losingPlayerName);
  });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

function generateFruit() {
  const fruitTypes = [
    "apple",
    "banana",
    "peach",
    "strawberry",
    "watermelon",
    "boom",
  ];
  return {
    x: Math.random() * 800,
    y: 635,
    speed: Math.random() * 2 + 3,
    color: `rgb(${Math.random() * 255},${Math.random() * 255},${
      Math.random() * 255
    })`,
    size: Math.random() * 20 + 40,
    name: fruitTypes[Math.floor(Math.random() * fruitTypes.length)],
  };
}
