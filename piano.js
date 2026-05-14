const svgNS = 'http://www.w3.org/2000/svg';

const KEYBOARD_START = 36;
const KEYBOARD_END = 96;

const WHITE_WIDTH = 40;
const BLACK_WIDTH = 28;
const WHITE_HEIGHT = 180;
const BLACK_HEIGHT = 110;

const WHITE_NOTES = [0, 2, 4, 5, 7, 9, 11];

function isWhite(note) {
  return WHITE_NOTES.includes(note % 12);
}

const whiteKeys = [];
const blackKeys = [];
for (let n = KEYBOARD_START; n <= KEYBOARD_END; n++) {
  (isWhite(n) ? whiteKeys : blackKeys).push(n);
}

const totalWidth = whiteKeys.length * WHITE_WIDTH;

const whiteX = {};
whiteKeys.forEach((n, i) => { whiteX[n] = i * WHITE_WIDTH; });

const blackX = {};
blackKeys.forEach(n => {
  blackX[n] = whiteX[n - 1] + WHITE_WIDTH - BLACK_WIDTH / 2;
});

const svg = document.createElementNS(svgNS, 'svg');
svg.setAttribute('width', totalWidth);
svg.setAttribute('height', WHITE_HEIGHT);
svg.setAttribute('viewBox', `0 0 ${totalWidth} ${WHITE_HEIGHT}`);

for (const n of whiteKeys) {
  const rect = document.createElementNS(svgNS, 'rect');
  rect.setAttribute('x', whiteX[n]);
  rect.setAttribute('y', 0);
  rect.setAttribute('width', WHITE_WIDTH - 1);
  rect.setAttribute('height', WHITE_HEIGHT);
  rect.setAttribute('rx', 3);
  rect.setAttribute('fill', '#fff');
  rect.setAttribute('stroke', '#999');
  rect.setAttribute('stroke-width', '0.5');
  rect.dataset.note = n;
  svg.appendChild(rect);
}

for (const n of blackKeys) {
  const rect = document.createElementNS(svgNS, 'rect');
  rect.setAttribute('x', blackX[n]);
  rect.setAttribute('y', 0);
  rect.setAttribute('width', BLACK_WIDTH);
  rect.setAttribute('height', BLACK_HEIGHT);
  rect.setAttribute('rx', 2);
  rect.setAttribute('fill', '#222');
  rect.setAttribute('stroke', '#555');
  rect.setAttribute('stroke-width', '0.5');
  rect.dataset.note = n;
  svg.appendChild(rect);
}

document.getElementById('piano').appendChild(svg);

function getKeyEl(note) {
  return svg.querySelector(`[data-note="${note}"]`);
}

MIDI.setMessageHandler((cls, text, data) => {
  if (cls === 'note-on') {
    const el = getKeyEl(data[1]);
    if (el) el.classList.add('pressed');
  }
  if (cls === 'note-off') {
    const el = getKeyEl(data[1]);
    if (el) el.classList.remove('pressed');
  }
});

MIDI.initMidi(document.getElementById('portSelect'));
