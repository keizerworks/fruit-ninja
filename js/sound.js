let isMuted = false; // To track the mute state

// Function to toggle sound
function toggleSound() {
  const soundIcon = document.getElementById("sound-icon");

  isMuted = !isMuted;

  if (isMuted) {
    // Mute all sounds
    boom.setVolume(0);
    spliced.setVolume(0);
    missed.setVolume(0);
    start.setVolume(0);
    over.setVolume(0);

    // Change the button icon to mute
    soundIcon.src = "images/mute.png";
    soundIcon.alt = "Sound Off";
  } else {
    // Unmute all sounds
    boom.setVolume(1);
    spliced.setVolume(1);
    missed.setVolume(1);
    start.setVolume(1);
    over.setVolume(1);

    // Change the button icon to sound
    soundIcon.src = "images/sound.png";
    soundIcon.alt = "Sound On";
  }
}

// Add event listener to the button
document.getElementById("sound-control").addEventListener("click", toggleSound);
