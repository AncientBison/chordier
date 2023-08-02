window.onload = function () {
    MIDI.loadPlugin({
  		soundfontUrl: "./soundfont/",
  		instrument: "acoustic_grand_piano",
  		onprogress: function(state, progress) {
  			console.log(state, progress);
  		},
  		onsuccess: function() {
        console.log("loaded");
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        document.getElementById("start_sound").addEventListener("click", function () {
        // The user interaction occurs here, and we can resume the AudioContext
        if (audioContext.state === "suspended") {
          audioContext.resume().then(function() {
            console.log("AudioContext is now resumed.");
            // Play MIDI notes or do other audio-related tasks here
          });
        } else {
          // AudioContext might already be running
          console.log("AudioContext is already running.");
          // Play MIDI notes or do other audio-related tasks here
        }
      });
    }
  });
};

function handlePlayChordTest(aboveC4) {
  let delay = 0; // play one note every quarter second
  let startingNote = 60 + majorScale[aboveC4];
  let velocity = 127; // how hard the note hits
  // play the note
  MIDI.setVolume(0, 127);
  MIDI.noteOn(0, startingNote, velocity, delay);
  MIDI.noteOn(0, startingNote + chords[majorScaleChords[aboveC4]][1], velocity, delay);
  MIDI.noteOn(0, startingNote + chords[majorScaleChords[aboveC4]][2], velocity, delay);
  MIDI.noteOff(0, startingNote, delay + 0.75);
  MIDI.noteOff(0, startingNote + chords[majorScaleChords[aboveC4]][1], delay + 0.75);
  MIDI.noteOff(0, startingNote + chords[majorScaleChords[aboveC4]][2], delay + 0.75);
}

majorScale = [0, 2, 4, 5, 7, 9, 11, 12];

majorScaleChords = ["M", "m", "m", "M", "M", "m", "D", "M"];

chords = {
  "M": [0, 4, 7],
  "m": [0, 3, 7],
  "D": [0, 3, 6],
  "A": [0, 4, 8]
};



// document.getElementById("playtest").onclick = handlePlayChordTest;

addEventListener("keypress", (event) => {
  if (isNaN(parseInt(event.key))) {
    return;
  }
  
  handlePlayChordTest(parseInt(event.key));
});