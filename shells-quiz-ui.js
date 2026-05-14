const ROOTS = [];
for (let n = 36; n <= 72; n++) {
  if ([0, 2, 4, 5, 7, 9, 11].includes(n % 12)) ROOTS.push(n);
}
const TYPES = ['7', 'M7', 'm7'];

let targetRoot = null;
let targetType = null;
let locked = false;
let score = 0;
let total = 0;

const promptEl = document.getElementById('prompt');
const heldEl = document.getElementById('held');
const resultEl = document.getElementById('result');
const scoreEl = document.getElementById('score');

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function newQuestion() {
  targetRoot = pick(ROOTS);
  targetType = pick(TYPES);
  promptEl.textContent = `${MIDI.NOTE_NAMES[targetRoot % 12]}${targetType}`;
  resultEl.textContent = '';
}

function render() {
  if (locked) return;

  if (MIDI.heldNotes.size === 0) {
    heldEl.textContent = '';
    return;
  }

  const sorted = Array.from(MIDI.heldNotes).sort((a, b) => a - b);
  heldEl.textContent = sorted.map(n => `${n} (${MIDI.noteName(n)})`).join('  ');

  const intervals = chordIntervals(MIDI.heldNotes);
  const result = shells(intervals);

  if (result === targetType && intervals[0] % 12 === targetRoot % 12) {
    locked = true;
    score++;
    total++;
    scoreEl.textContent = `${score}/${total}`;
    resultEl.textContent = '✓';
    newQuestion();
    setTimeout(() => {
      resultEl.textContent = '';
      locked = false;
    }, 800);
  }
}

MIDI.setMessageHandler((cls, text) => {
  if (cls === 'other') return;
  render();
});

MIDI.initMidi(document.getElementById('portSelect'));
newQuestion();
