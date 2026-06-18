const ROOTS = [];
for (let n = 57; n <= 84; n++) {
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

const SVG_NS = 'http://www.w3.org/2000/svg';
const staffContainer = document.getElementById('staffContainer');

function renderStaff(note) {
  staffContainer.innerHTML = '';
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '280');
  svg.setAttribute('viewBox', '0 0 600 280');
  staffContainer.appendChild(svg);

  const LS = 24;
  const staffH = LS * 4;
  const topY = (280 - staffH) / 2;
  const bottomY = topY + staffH;
  const cx = 300;
  const ml = 80;
  const mr = 40;

  const pc2li = [0,0,1,1,2,3,3,4,4,5,5,6];
  const letterIdx = pc2li[note % 12];
  const octave = Math.floor(note / 12) - 1;
  const noteIdx = octave * 7 + letterIdx;
  const bottomNoteIdx = 30;
  const staffPos = noteIdx - bottomNoteIdx;
  const noteY = bottomY - staffPos * (LS / 2);

  for (let i = 0; i < 5; i++) {
    const y = topY + i * LS;
    const line = document.createElementNS(SVG_NS, 'line');
    line.setAttribute('x1', ml);
    line.setAttribute('y1', y);
    line.setAttribute('x2', 600 - mr);
    line.setAttribute('y2', y);
    line.setAttribute('stroke', '#555');
    line.setAttribute('stroke-width', '2');
    svg.appendChild(line);
  }

  if (staffPos < -1) {
    for (let p = -2; p >= staffPos; p -= 2) {
      const y = bottomY - p * (LS / 2);
      const l = document.createElementNS(SVG_NS, 'line');
      l.setAttribute('x1', cx - 40);
      l.setAttribute('y1', y);
      l.setAttribute('x2', cx + 40);
      l.setAttribute('y2', y);
      l.setAttribute('stroke', '#555');
      l.setAttribute('stroke-width', '2');
      svg.appendChild(l);
    }
  }
  if (staffPos > 8) {
    for (let p = 10; p <= staffPos; p += 2) {
      const y = bottomY - p * (LS / 2);
      const l = document.createElementNS(SVG_NS, 'line');
      l.setAttribute('x1', cx - 40);
      l.setAttribute('y1', y);
      l.setAttribute('x2', cx + 40);
      l.setAttribute('y2', y);
      l.setAttribute('stroke', '#555');
      l.setAttribute('stroke-width', '2');
      svg.appendChild(l);
    }
  }

  const g = document.createElementNS(SVG_NS, 'g');
  g.setAttribute('transform', `rotate(-15, ${cx}, ${noteY})`);
  const e = document.createElementNS(SVG_NS, 'ellipse');
  e.setAttribute('cx', cx);
  e.setAttribute('cy', noteY);
  e.setAttribute('rx', '18');
  e.setAttribute('ry', '13');
  e.setAttribute('fill', '#fff');
  g.appendChild(e);
  svg.appendChild(g);

  const clef = document.createElementNS(SVG_NS, 'text');
  clef.setAttribute('x', '16');
  clef.setAttribute('y', bottomY + 10);
  clef.setAttribute('font-size', '56');
  clef.setAttribute('fill', '#666');
  clef.setAttribute('font-family', 'serif');
  clef.textContent = '\uD834\uDD1E';
  svg.appendChild(clef);
}

function newQuestion() {
  targetRoot = pick(ROOTS);
  targetType = pick(TYPES);
  promptEl.textContent = `${MIDI.NOTE_NAMES[targetRoot % 12]}${targetType}`;
  resultEl.textContent = '';
  renderStaff(targetRoot);
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
