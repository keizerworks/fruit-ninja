// js/singleplayer.js
function startSingleplayer() {
  document.getElementById("gameModePopup").style.display = "none";
  isPlay = true;
  start.play();
  loop();
}
