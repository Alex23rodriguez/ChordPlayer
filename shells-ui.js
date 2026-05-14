const heldEl = document.getElementById('held');
const chordEl = document.getElementById('chord');

function render() {
  if (MIDI.heldNotes.size === 0) {
    heldEl.textContent = '';
    chordEl.textContent = '';
    return;
  }

  const sorted = Array.from(MIDI.heldNotes).sort((a, b) => a - b);
  heldEl.textContent = sorted.map(n => `${n} (${MIDI.noteName(n)})`).join('  ');

  const intervals = chordIntervals(MIDI.heldNotes);
  const shell = shells(intervals);
  if (shell) {
    const rootName = MIDI.NOTE_NAMES[intervals[0] % 12];
    chordEl.textContent = `${rootName}${shell}`;
  } else {
    chordEl.textContent = '';
  }
}

MIDI.setMessageHandler((cls, text) => {
  if (cls === 'other') return;
  render();
});

MIDI.initMidi(document.getElementById('portSelect'));
