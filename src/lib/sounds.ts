// Sound effect utilities

// Play a pop sound when revealing answers
export function playPopSound() {
  const audio = new Audio('/pop-sound.mp3');
  audio.volume = 0.5;
  try {
    audio.play();
  } catch (error) {
    console.error("Error playing sound:", error);
  }
}

// Play a celebration sound for correct answers
export function playCelebrationSound() {
  const audio = new Audio('/celebration-sound.mp3');
  audio.volume = 0.4;
  try {
    audio.play();
  } catch (error) {
    console.error("Error playing sound:", error);
  }
}

// Play wrong answer sound
export function playWrongSound() {
  const audio = new Audio('/wrong.mp3');
  audio.volume = 0.5;
  try {
    audio.play();
  } catch (error) {
    console.error("Error playing sound:", error);
  }
}
