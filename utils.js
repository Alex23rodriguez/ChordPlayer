const log = document.getElementById('log');
const clear = document.getElementById('clear');
const heldEl = document.getElementById('held');

function renderHeld() {
  if (MIDI.heldNotes.size === 0) { heldEl.textContent = ''; return; }
  heldEl.textContent = Array.from(MIDI.heldNotes).sort((a, b) => a - b).map(n => `${n} (${MIDI.noteName(n)})`).join('  ');
}

clear.onclick = () => { log.innerHTML = ''; };

MIDI.setMessageHandler((cls, text) => {
  if (cls === 'other') return;
  renderHeld();
  const div = document.createElement('div');
  div.className = `msg ${cls}`;
  div.textContent = `${new Date().toLocaleTimeString()}  ${text}`;
  log.prepend(div);
  if (log.children.length > 100) log.lastChild.remove();
});

MIDI.initMidi(document.getElementById('portSelect'));
