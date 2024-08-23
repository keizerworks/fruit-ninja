// js/singleplayer.js
function startSingleplayer() {
  document.getElementById("singleplayerBtn").style.display = "none";
  document.getElementById("multiplayerBtn").style.display = "none";
  isPlay = true;
  start.play();
  loop();
}
