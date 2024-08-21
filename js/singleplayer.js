// js/singleplayer.js

function showSinglePlayerSuggestion() {
  let loadingMsg = select("#loadingMsg");
  if (loadingMsg) loadingMsg.remove();

  let suggestionMsg = createP(
    "No player found. Would you like to start a single player game?"
  );
  suggestionMsg.style("text-align", "center");
  suggestionMsg.style("font-size", "24px");
  suggestionMsg.style("margin-top", "50px");

  let yesBtn = createButton("Yes");
  yesBtn.mousePressed(() => {
    suggestionMsg.remove();
    yesBtn.remove();
    noBtn.remove();
    startSingleplayer();
  });

  let noBtn = createButton("No");
  noBtn.mousePressed(() => {
    suggestionMsg.remove();
    yesBtn.remove();
    noBtn.remove();
    showMainMenu();
  });

  let buttonDiv = createDiv();
  buttonDiv.style("text-align", "center");
  buttonDiv.style("margin-top", "20px");
  yesBtn.parent(buttonDiv);
  noBtn.parent(buttonDiv);
}

function startSingleplayer() {
  document.getElementById("gameModePopup").style.display = "none";
  isPlay = true;
  start.play();
  loop();
}
