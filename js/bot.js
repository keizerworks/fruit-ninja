let bot;
var botscore = 0;
var botlives = 3;
var botpoints = 0;

function startBotGame() {
  document.getElementById("gameModePopup").style.display = "none";
  isPlay = true;
  isPlayWithBot = true;
  start.play();
  loop();
}
