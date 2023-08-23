import MidiWriter from "../js/midiwriter.js";

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

const diminishedScale = [0, 2, 3, 5, 6, 8, 9, 11, 12];
const diminishedScaleChords = ["D", "M", "m", "D", "M", "m", "m", "M"];

const augmentedScale = [0, 3, 4, 7, 8, 11, 12];
const augmentedScaleChords = ["A", "A", "A", "A", "A", "A", "A"];

const octatonicScale = [0, 1, 3, 4, 6, 7, 9, 10, 12];
const octatonicScaleChords = ["D", "M", "m", "D", "M", "m", "D", "M"];

const prometheusScale = [0, 2, 4, 5, 7, 9, 10, 12];
const prometheusScaleChords = ["M", "M", "m", "M", "m", "M", "D", "M"];


// function replayNotes() {
//   console.log("Replaying");
//   MIDI.chordOn(0, notesPlaying, 127, 0);
//   setTimeout(replayNotes, 500);
// }

const numberScaleSelector = document.getElementById("numberScaleSelector");
const firstRowScaleSelector = document.getElementById("firstRowScaleSelector");
const secondRowScaleSelector = document.getElementById("secondRowScaleSelector");
const thirdRowScaleSelector = document.getElementById("thirdRowScaleSelector");

const scaleSelectors = [numberScaleSelector, firstRowScaleSelector, secondRowScaleSelector, thirdRowScaleSelector];

function populateSelectors() {
  // const scales = Object.values(Scale);
  // console.log(scales);
  for (const scaleType in Scale) {
    for (const scaleSelector of scaleSelectors) {
      const scaleOption = document.createElement('option');
      scaleOption.innerText = scaleType.charAt(0).toUpperCase() + scaleType.slice(1).toLowerCase();
      scaleOption.value = scaleType;
      
      scaleSelector.appendChild(scaleOption);
    }
    
  }
  // <option value="1">Option 1</option>
}

const intrusment = "pad_7_halo";

window.onload = function() {
  MIDI.loadPlugin({
    soundfontUrl: "https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/",
    instrument: intrusment,
    onprogress: function(state, progress) {
      console.log(state, progress);
    },
    onsuccess: function() {
      console.log("loaded");
      MIDI.programChange(0, MIDI.GM.byName[intrusment].number);
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
  });
};

const delay = 0;

class Scale {
  static MAJOR = new Scale(majorScale, majorScaleChords);
  static MINOR = new Scale(minorScale, minorScaleChords);
  static DIMINISHED = new Scale(diminishedScale, diminishedScaleChords);
  static AUGMENTED = new Scale(augmentedScale, augmentedScaleChords);
  static PROMETHEUS = new Scale(prometheusScale, prometheusScaleChords);

  constructor(scale, scaleChords) {
    this.scale = scale;
    this.scaleChords = scaleChords;
  }
}

populateSelectors();

const startingTime = Date.now() / 1000;

function chordOn(transposingScaleAtDown, aboveC4, scale) {
  let startingNote = (12 * transposingScaleAtDown) + scale.scale[aboveC4];
  let velocity = 127; // how hard the note hits
  // play the note
  MIDI.setVolume(0, velocity);
  let notesInChord = [
    startingNote,
    startingNote + chords[scale.scaleChords[aboveC4]][1],
    startingNote + chords[scale.scaleChords[aboveC4]][2]
  ];

  const unfilteredNotesInChord = notesInChord;

  notesInChord = notesInChord.filter((element) => !notesPlaying.includes(element));

  notesPlaying = notesPlaying.concat(unfilteredNotesInChord);

  // for (let note in notesInChord) {
  //   MIDI.noteOn(0, note, velocity, delay);
  // }
  
  MIDI.chordOn(0, notesInChord, velocity, delay);

  for (let note of notesInChord) {
    recordMidiEvent({
      now: (Date.now() / 1000) - startingTime,
      channel: 0,
      message: 144,
      note: note,
      velocity: velocity
    });
  }
}

function chordOff(transposingScaleAtDown, aboveC4, scale) {
  let startingNote = (12 * transposingScaleAtDown) + scale.scale[aboveC4];
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
  
  // for (let note in notesInChord) {
  //   MIDI.noteOff(0, note, delay);
  // }
  
  MIDI.chordOff(0, notesInChord, delay);

  for (let note of notesInChord) {
    recordMidiEvent({
      now: (Date.now() / 1000) - startingTime,
      channel: 0,
      message: 128,
      note: note,
      velocity: velocity
    });
  }
}

// document.getElementById("playtest").onclick = handlePlayChordTest;

const rowOneletterToNumber = {
  "q": 1,
  "w": 2,
  "e": 3,
  "r": 4,
  "t": 5,
  "y": 6,
  "u": 7,
  "i": 8
};

const rowTwoletterToNumber = {
  "a": 1,
  "s": 2,
  "d": 3,
  "f": 4,
  "g": 5,
  "h": 6,
  "j": 7,
  "k": 8
};

const rowThreeLetterToNumber = {
  "z": 1,
  "x": 2,
  "c": 3,
  "v": 4,
  "b": 5,
  "n": 6,
  "m": 7,
  ",": 8
};

function createObject(keys, values) {
  const obj = Object.fromEntries(
    keys.map((key, index) => [key, values[index]]),
  );
 
  return obj;
}

function getScaleForScaleSelector(scaleSelector) {
  const scales = createObject(Object.keys(Scale), Object.values(Scale))
  
  return scales[scaleSelector.value]
}

addEventListener("keydown", (event) => {
  if (!event.repeat) {

    if (event.key == "Enter") {
      downloadMidiFile();
    }
    
    let key = event.key;
    const originalKey = event.key;
    const transposingScaleAtDown = transposingScale;

    let firstRow = false;
    let secondRow = false;
    let thirdRow = false;

    if (Object.keys(rowOneletterToNumber).includes(key)) {
      key = rowOneletterToNumber[key];
      firstRow = true;
    } else if (Object.keys(rowTwoletterToNumber).includes(key)) {
      key = rowTwoletterToNumber[key];
      secondRow = true;
    } else if (Object.keys(rowThreeLetterToNumber).includes(key)) {
      key = rowThreeLetterToNumber[key];
      thirdRow = true;
    }

    if (key === "ArrowUp") {
      transposingScale += 1;
      document.getElementById("scaleNumber").innerText = transposingScale;
    } else if (key === "ArrowDown") {
      transposingScale -= 1;
      document.getElementById("scaleNumber").innerText = transposingScale;
    }

    if (isNaN(parseInt(key))) {
      return;
    }
    
    chordOn(transposingScaleAtDown, parseInt(key - 1), thirdRow ? getScaleForScaleSelector(thirdRowScaleSelector) : (firstRow ? getScaleForScaleSelector(firstRowScaleSelector) : (secondRow ? getScaleForScaleSelector(secondRowScaleSelector) : getScaleForScaleSelector(numberScaleSelector))));

    function onKeyUp(eventUp) {
      console.log("I GOT A KEYUP!!!")
      if (eventUp.key == originalKey) {
        console.log("hohgga")
        chordOff(transposingScaleAtDown, parseInt(key - 1), thirdRow ? getScaleForScaleSelector(thirdRowScaleSelector) : (firstRow ? getScaleForScaleSelector(firstRowScaleSelector) : (secondRow ? getScaleForScaleSelector(secondRowScaleSelector) : getScaleForScaleSelector(numberScaleSelector))));
        removeEventListener("keyup", onKeyUp);
      }
    }
    
    addEventListener("keyup", onKeyUp);
  }
});

//RECORDING
// Initialize an array to store the MIDI events
let recordedEvents = [];

// MIDI event listener function

function recordMidiEvent(event) {
  // Add the MIDI event to the recorded events array
  recordedEvents.push(event);
}

function downloadMidiFile() {
  // Create a new MIDI track using the recorded events
  const track = new MidiWriter.Track();

  track.addEvent(new MidiWriter.ProgramChangeEvent({instrument: 1}));

  console.log(MidiWriter)

  recordedEvents.forEach((event) => {
    // Convert the recorded MIDI event data to a MidiWriter event
    const midiEvent = new MidiWriter.NoteEvent({
      ...event,
      deltaTime: 0, // Use 0 for now, you can adjust it based on timing if needed
    });

    track.addEvent(midiEvent);
  });

  // Create a new MIDI file with the track
  const writer = new MidiWriter.Writer([track]);

  // Get the MIDI file as a Blob
  const midiFileBlob = new Blob([writer.buildFile()]);

  // Create a temporary URL for the Blob
  const url = URL.createObjectURL(midiFileBlob);

  // Create a link element and trigger a click event to download the file
  const downloadLink = document.createElement('a');
  downloadLink.href = url;
  downloadLink.download = 'recorded_music.mid'; // Specify the desired file name
  document.body.appendChild(downloadLink);
  downloadLink.click();

  // Cleanup: remove the link and revoke the temporary URL
  document.body.removeChild(downloadLink);
  URL.revokeObjectURL(url);
}