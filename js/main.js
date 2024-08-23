var cnv;
var isPlayWithBot = false;
let isSpectating = false;
var isMultiplayer = false;
var opponentCanvas;
var opponentSword;
var score,
  points = 0;
var lives,
  x = 0;
var isPlay = false;
var gravity = 0.1;
var sword;
var fruit = [];
var fruitsList = [
  "apple",
  "banana",
  "peach",
  "strawberry",
  "watermelon",
  "boom",
];

var opponentFruitList = [
  "apple",
  "banana",
  "peach",
  "strawberry",
  "watermelon",
  "boom",
];

var fruitsImgs = [],
  slicedFruitsImgs = [],
  splashImgs = [];
var livesImgs = [],
  livesImgs2 = [];
var boom, spliced, missed, over, start;
let opponentState = {
  swordX: 0,
  swordY: 0,
  fruits: [],
  score: 0,
  lives: 6,
};
let socket;

function preload() {
  boom = loadSound("sounds/boom.mp3");
  spliced = loadSound("sounds/splatter.mp3");
  missed = loadSound("sounds/missed.mp3");
  start = loadSound("sounds/start.mp3");
  over = loadSound("sounds/over.mp3");

  for (var i = 0; i < fruitsList.length - 1; i++) {
    slicedFruitsImgs[2 * i] = loadImage("images/" + fruitsList[i] + "-1.png");
    slicedFruitsImgs[2 * i + 1] = loadImage(
      "images/" + fruitsList[i] + "-2.png"
    );
  }
  for (var i = 0; i < fruitsList.length; i++) {
    fruitsImgs[i] = loadImage("images/" + fruitsList[i] + ".png");
    if (fruitsList[i] != "boom") {
      splashImgs[i] = loadImage("images/" + fruitsList[i] + "-splash.png");
    }
  }
  for (var i = 0; i < 3; i++) {
    livesImgs[i] = loadImage("images/x" + (i + 1) + ".png");
  }
  for (var i = 0; i < 3; i++) {
    livesImgs2[i] = loadImage("images/xx" + (i + 1) + ".png");
  }
  bg = loadImage("images/fbg2.png");
  foregroundImg = loadImage("images/home-mask.png");
  fruitLogo = loadImage("images/fruit.png");
  ninjaLogo = loadImage("images/ninja.png");
  scoreImg = loadImage("images/score.png");
  newGameImg = loadImage("images/new-game.png");
  fruitImg = loadImage("images/fruitMode.png");
  gameOverImg = loadImage("images/game-over.png");
}

function setup() {
  cnv = createCanvas(800, 835);
  sword = new Sword(color("#FFFFFF"));
  frameRate(60);
  score = 0;
  lives = 3;
  showGameModePopup(); // Show the popup when the game starts
}

function draw() {
  clear();
  // background(bg);

  if (isPlay) {
    background(bg);
    game();
  } else {
    // image(this.newGameImg, 310, 360, 200, 200);
    // image(this.fruitImg, 365, 415, 90, 90);
  }

  cnv.mouseClicked(check);
}

function updateOpponentState(data) {
  opponentState.swordX = data.swordX;
  opponentState.swordY = data.swordY;
  opponentState.fruits = data.fruits;
  opponentState.score = data.score;
  opponentState.lives = data.lives;
}

function drawMultiplayer() {
  // document.getElementById("defaultCanvas0").style.width = "50%";
  // document.getElementById("defaultCanvas0").style.height = "50%";
  // new p5(sketch2);
}

function showGameModePopup() {
  document.getElementById("gameModePopup").style.display = "block";

  document
    .getElementById("singleplayerBtn")
    .addEventListener("click", startSingleplayer);
  document
    .getElementById("multiplayerBtn")
    .addEventListener("click", startMultiplayer);
}

function showSearchingState() {
  // Hide the game canvas
  cnv.style("display", "none");

  // Create a loading message
  let loadingMsg = createP("Searching for a player...");
  loadingMsg.id("loadingMsg");
  loadingMsg.style("text-align", "center");
  loadingMsg.style("font-size", "24px");
  loadingMsg.style("margin-top", "50px");

  // Create a timer
  let timer = 5;
  let timerInterval = setInterval(() => {
    timer--;
    if (timer <= 0) {
      clearInterval(timerInterval);
      showPlayWithBothSuggestion();
    }
  }, 1000);
}

function check() {
  if (!isPlay && mouseX > 300 && mouseX < 520 && mouseY > 350 && mouseY < 550) {
    showGameModePopup();
  }
}

function game() {
  clear();
  background(bg);
  sword.swipe(mouseX, mouseY);
  sword.update();
  sword.draw();

  if (frameCount % 5 === 0) {
    if (noise(frameCount) > 0.69) {
      fruit.push(randomFruit());
    }
  }
  points = 0;

  for (var i = fruit.length - 1; i >= 0; i--) {
    fruit[i].update();
    fruit[i].draw();
    if (!fruit[i].visible) {
      if (!fruit[i].sliced && fruit[i].name != "boom") {
        image(this.livesImgs2[0], fruit[i].x, fruit[i].y - 120, 50, 50);
        missed.play();
        lives--;
        x++;
      }
      if (lives < 1) {
        console.log(playerName, "Player lost the game");
        if (isMultiplayer) socket.emit("gameOver", playerName);
        if (isPlayWithBot) gameOver("bot");
        gameOver();
      }
      fruit.splice(i, 1);
    } else {
      if (fruit[i].sliced && fruit[i].name == "boom") {
        boom.play();
        if (isMultiplayer) socket.emit("gameOver", playerName);
        if (isPlayWithBot) gameOver("bot");
        gameOver();
      }
      if (sword.checkSlice(fruit[i]) && fruit[i].name != "boom") {
        spliced.play();
        showSplash(fruit[i].name, fruit[i].x, fruit[i].y);
        points++;
        fruit[i].update();
        fruit[i].draw();
      }
    }
  }
  if (frameCount % 2 === 0) {
    sword.update();
  }
  sword.draw();
  score += points;
  drawScore(score);
  drawLives(lives);
  if (isMultiplayer) {
    cnv.textSize(32);
    cnv.textStyle(BOLD);
    cnv.fill(0, 0, 255);
    cnv.textAlign(CENTER);
    cnv.text("Oponent Score: " + opponentState.score, 800 / 2, 30);
    cnv.text("Oponent Lives: " + opponentState.lives, 800 / 2, 60);
  }

  if (isMultiplayer) {
    socket.emit("updateOpponentData", {
      score: score,
      lives: lives,
      swordX: mouseX,
      swordY: mouseY,
      fruits: fruit.map((f) => ({
        name: f.name,
        x: f.x,
        y: f.y,
        visible: f.visible,
        sliced: f.sliced,
      })),
    });
  }
  if (isPlayWithBot) {
    let spectateBtn = document.getElementById("spectateBtn");
    if (!spectateBtn) {
      spectateBtn = document.createElement("button");
      spectateBtn.id = "spectateBtn";
      spectateBtn.innerText = "Spectate";
      spectateBtn.style.position = "absolute";
      spectateBtn.style.top = "10px";
      spectateBtn.style.right = "10px";
      document.body.appendChild(spectateBtn);

      spectateBtn.addEventListener("click", () => {
        isSpectating = !isSpectating;
        if (isSpectating) {
          spectateBtn.innerText = "Return";
          document.getElementById("defaultCanvas0").style.border =
            "5px solid red";
        } else {
          spectateBtn.innerText = "Spectate";
          document.getElementById("defaultCanvas0").style.border = "none";
        }
      });

      if (!isSpectating) {
        botscore = 0;
        botlives = 3;
        botpoints = 0;

        // Randomly decrease lives, increase points, and scores
        if (Math.random() < 0.6) {
          // 60% chance to decrease a life
          botlives--;
          console.log("Bot lost a life. Lives left:", botlives);
        }

        if (Math.random() < 0.05) {
          // 5% chance to increase points
          botpoints += Math.floor(Math.random() * 10) + 1; // Increase by 1 to 10 points
          console.log("Bot gained points. Points:", botpoints);
        }

        if (Math.random() < 0.05) {
          // 5% chance to increase score
          botscore += Math.floor(Math.random() * 8) + 1; // Increase by 1 to 10 score
          console.log("Bot gained score. Score:", botscore);
        }

        // Check if lives are zero and trigger gameOver
        if (botlives <= 0) {
          console.log("Bot lost all lives. Game over.");
          gameOver("player");
        }
      }
    }
  }

  if (isSpectating && isPlayWithBot) {
    // Show bot's POV
    drawBotPOV();
  }
}

let botX, botY;
let lastUpdateTime = 0;
const updateInterval = 250; // Update bot position every 100ms
const movementSpeed = 0.3;

function drawBotPOV() {
  clear();
  background(bg);
  cnv.style("border", "5px solid red");

  if (isSpectating) {
    cnv.mousePressed(() => false);
    cnv.mouseReleased(() => false);
    cnv.mouseMoved(() => false);
  }

  let gameCanvas = document.getElementById("defaultCanvas0");
  gameCanvas.style.pointerEvents = isSpectating ? "none" : "auto";

  // Update bot's target position at regular intervals
  if (millis() - lastUpdateTime > updateInterval) {
    if (fruit.length > 0) {
      let targetFruit = fruit[Math.floor(Math.random() * fruit.length)];
      targetX = targetFruit.x;
      targetY = targetFruit.y;
    } else {
      targetX = random(width);
      targetY = random(height);
    }
    lastUpdateTime = millis();
  }

  // Gradually move towards the target position
  if (!botX) botX = width / 2;
  if (!botY) botY = height / 3;
  botX = lerp(botX, targetX, movementSpeed);
  botY = lerp(botY, targetY, movementSpeed);

  sword.swipe(botX, botY);
  sword.update();
  sword.draw();

  if (frameCount % 5 === 0) {
    if (noise(frameCount) > 0.69) {
      fruit.push(randomFruit());
    }
  }

  for (var i = fruit.length - 1; i >= 0; i--) {
    fruit[i].update();
    fruit[i].draw();
    if (!fruit[i].visible) {
      if (!fruit[i].sliced && fruit[i].name != "boom") {
        image(this.livesImgs2[0], fruit[i].x, fruit[i].y - 120, 50, 50);
        missed.play();
        botlives--;
        x++;
      }
      if (botlives < 1) {
        if (isPlayWithBot) gameOver("player");
        gameOver();
      }
      fruit.splice(i, 1);
    } else {
      if (fruit[i].sliced && fruit[i].name == "boom") {
        boom.play();
        if (isPlayWithBot) gameOver("player");
        if (isMultiplayer) socket.emit("gameOver", playerName);
        gameOver();
      }
      if (sword.checkSlice(fruit[i]) && fruit[i].name != "boom") {
        spliced.play();
        showSplash(fruit[i].name, fruit[i].x, fruit[i].y);
        botpoints++;
        fruit[i].update();
        fruit[i].draw();
      }
    }
  }

  if (frameCount % 2 === 0) {
    sword.update();
  }
  sword.draw();
  botscore += botpoints;
  drawScore(botpoints);
  drawLives(botlives);
}

let splashTimer = 6000; // Adjust this value to change the display duration

function showSplash(fruitName, x, y) {
  let splashImg = splashImgs[fruitsList.indexOf(fruitName)];
  if (splashImg && splashTimer > 0) {
    image(splashImg, x, y, 250, 250);
    splashTimer--; // Decrease the timer on each frame
  }
}

function drawLives(lives) {
  image(
    this.livesImgs[0],
    width - 110,
    20,
    livesImgs[0].width,
    livesImgs[0].height
  );
  image(
    this.livesImgs[1],
    width - 88,
    20,
    livesImgs[1].width,
    livesImgs[1].height
  );
  image(
    this.livesImgs[2],
    width - 60,
    20,
    livesImgs[2].width,
    livesImgs[2].height
  );
  if (lives <= 2) {
    image(
      this.livesImgs2[0],
      width - 110,
      20,
      livesImgs2[0].width,
      livesImgs2[0].height
    );
  }
  if (lives <= 1) {
    image(
      this.livesImgs2[1],
      width - 88,
      20,
      livesImgs2[1].width,
      livesImgs2[1].height
    );
  }
  if (lives === 0) {
    image(
      this.livesImgs2[2],
      width - 60,
      20,
      livesImgs2[2].width,
      livesImgs2[2].height
    );
  }
}

function drawScore(score) {
  image(this.scoreImg, 10, 10, 40, 40);
  textAlign(LEFT);
  noStroke();
  fill(255, 147, 21);
  textSize(50);
  text(score, 50, 50);
}

function gameOver(winner) {
  isPlay = false;
  noLoop();
  over.play();
  clear();
  background(bg);
  image(this.gameOverImg, 155, 260, 490, 85);

  if (isPlayWithBot) {
    if (winner === "bot") {
      alert("Bot Won the game");
    }

    if (winner === "player") {
      alert("You Won the game");
    }

    isPlayWithBot = false;
  }

  lives = 0;
  if (isMultiplayer) socket.emit("gameOver", playerName);
}

function sketch2(p) {
  let prevX = null;
  let prevY = null;

  p.setup = function () {
    opponentCanvas = p.createCanvas(400, 300);
    opponentCanvas.id("opponentCanvas");
    opponentSword = new Sword(color("#FFFFFF"));
  };

  p.draw = function () {
    p.clear();
    p.background(bg);

    if (isPlay && isMultiplayer) {
      multiplayerGame(p);
    } else {
      p.image(this.foregroundImg, 0, 0, 800, 350);
      p.image(this.fruitLogo, 40, 20, 358, 195);
      p.image(this.ninjaLogo, 420, 50, 318, 165);
      p.image(this.newGameImg, 310, 360, 200, 200);
      p.image(this.fruitImg, 365, 415, 90, 90);
    }
  };
}

function multiplayerGame(p) {
  console.log("Multiplayer game");
  p.clear();
  p.background(bg);

  opponentSword.swipe(opponentState.swordX, opponentState.swordY);
  opponentSword.update();
  opponentSword.draw();

  // Draw score and lives
  p.textSize(32);
  p.fill(255);
  p.text("Score: " + opponentState.score, 10, 30);
  p.text("Lives: " + opponentState.lives, 10, 60);
}
