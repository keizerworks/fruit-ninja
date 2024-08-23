let bot;
var botscore = 0;
var botlives = 3;
var botpoints = 0;

function startBotGame(suggestion) {
  isPlay = true;
  isPlayWithBot = true;
  start.play();
  loop();

  // Show the game canvas
  let cnv = select("#defaultCanvas0");
  if (cnv) {
    cnv.style("display", "block");
  }

  if (!suggestion || suggestion === false) {
    document.getElementById("gameModePopup").style.display = "none";
  }
}

function showPlayWithBothSuggestion() {
  let loadingMsg = select("#loadingMsg");
  if (loadingMsg) loadingMsg.remove();

  let suggestionMsg = createP(
    "No player found. Would you like to start a game with Bot?"
  );
  suggestionMsg.style("text-align", "center");
  suggestionMsg.style("font-size", "24px");
  suggestionMsg.style("margin-top", "50px");

  let yesBtn = createButton("Yes");
  yesBtn.mousePressed(() => {
    suggestionMsg.remove();
    yesBtn.remove();
    noBtn.remove();
    startBotGame(true);
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

const showMainMenu = () => {
  cnv.style("display", "block");
  showGameModePopup();
};
