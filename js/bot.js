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

  Swal.fire({
    title: 'No player found',
    text: 'Would you like to start a game with Bot?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, start with Bot',
    cancelButtonText: 'No, cancel'
  }).then((result) => {
    if (result.isConfirmed) {
      startBotGame(true);
    } else {
      // Handle cancellation (e.g., return to main menu)
      // You might want to add some code here to reset the game state or show the main menu
    }
  });
}

const showMainMenu = () => {
  cnv.style("display", "block");
  showGameModePopup();
};
