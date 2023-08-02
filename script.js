let notesPlaying = [];

const majorScale = [0, 2, 4, 5, 7, 9, 11, 12];

const majorScaleChords = ["M", "m", "m", "M", "M", "m", "D", "M"];

let transposingScale = 4;

const chords = {
  "M": [0, 4, 7],
  "m": [0, 3, 7],
  "D": [0, 3, 6],
  "A": [0, 4, 8]
};

const minorScale = [0, 2, 3, 5, 7, 8, 10, 12];

const minorScaleChords = ["m", "D", "M", "m", "m", "M", "M", "m"];

window.onload = function () {
	MIDI.loadPlugin({
		soundfontUrl: "https://gleitz.github.io/midi-js-soundfonts/MusyngKite/",
		instrument: "church_organ",
		onprogress: function(state, progress) {
			console.log(state, progress);
		},
    onsuccess: function() {
      console.log("loaded");
      MIDI.programChange(0, MIDI.GM.byName["church_organ"].number);
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

const delay = 0;

class Scale {
  static MAJOR = new Scale(majorScale, majorScaleChords);
  static MINOR = new Scale(minorScale, minorScaleChords);

  constructor(scale, scaleChords) {
    this.scale = scale;
    this.scaleChords = scaleChords;
  }
}

function chordOn(aboveC4, scale) {
  console.log(scale);
  let startingNote = (12 * transposingScale) + scale.scale[aboveC4];
  let velocity = 127; // how hard the note hits
  // play the note
  MIDI.setVolume(0, 127);
  let notesInChord = [
    startingNote,
    startingNote + chords[scale.scaleChords[aboveC4]][1],
    startingNote + chords[scale.scaleChords[aboveC4]][2]
  ];

  notesInChord = notesInChord.filter((element) => !notesPlaying.includes(element));

  notesPlaying = notesPlaying.concat(notesInChord);

  MIDI.chordOn(0, notesInChord, velocity, delay);
}

function chordOff(aboveC4, scale) {
  let startingNote = (12 * transposingScale) + scale.scale[aboveC4];
  let velocity = 127; // how hard the note hits
  // play the note
  MIDI.setVolume(0, 127);
  let notesInChord = [
    startingNote,
    startingNote + chords[scale.scaleChords[aboveC4]][1],
    startingNote + chords[scale.scaleChords[aboveC4]][2]
  ];

  for (let note of notesInChord) {
    notesPlaying.splice(notesPlaying.indexOf(note), 1);
  }
  notesInChord = notesInChord.filter((element) => !notesPlaying.includes(element));
  MIDI.chordOff(0, notesInChord, delay);
}

// document.getElementById("playtest").onclick = handlePlayChordTest;

addEventListener("keydown", (event) => {
  if (!event.repeat) {
    if (event.key === "ArrowUp") {
      transposingScale += 1;
      document.getElementById("scaleNumber").innerText = transposingScale;
    } else if (event.key === "ArrowDown") {
      transposingScale -= 1;
      document.getElementById("scaleNumber").innerText = transposingScale;
    }
  
    
    if (isNaN(parseInt(event.key))) {
      return;
    }

    chordOn(parseInt(event.key - 1), Scale.MAJOR);
  }
});

addEventListener("keyup", (event) => {
  if (isNaN(parseInt(event.key))) {
    return;
  }
  
  chordOff(parseInt(event.key) - 1, Scale.MAJOR);
});