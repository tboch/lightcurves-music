Tone.Transport.bpm.value = 100;
var note = Tone.Frequency(70.6, "midi").toNote();
console.log(note)

var notes = ['C4', 'E4', 'G4', 'B4'];
var current_note = 0;

// http://tonejs.org/docs/#DuoSynth
var synth = new Tone.DuoSynth();
var gain  = new Tone.Gain(0.5);
synth.connect(gain);
gain.toMaster();

synth.voice0.oscillator.type = 'triangle';
synth.voice1.oscillator.type = 'triangle';

Tone.Transport.scheduleRepeat(function(time) {
  var note = notes[current_note % notes.length];
  synth.triggerAttackRelease(note, '16n', time);
  current_note++;
}, '16n');

// start the repeat
Tone.Transport.start();
// Tone.Transport.pause();
