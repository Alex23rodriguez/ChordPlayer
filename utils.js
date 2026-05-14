const portSelect = document.getElementById('portSelect');
const log = document.getElementById('log');
const clear = document.getElementById('clear');

let access = null;
let connectedPort = null;
const heldNotes = new Set();
const heldEl = document.getElementById('held');

const NOTE_NAMES = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];

function noteName(n) {
  return NOTE_NAMES[n % 12] + (Math.floor(n / 12) - 1);
}

function renderHeld() {
  if (heldNotes.size === 0) { heldEl.textContent = ''; return; }
  heldEl.textContent = Array.from(heldNotes).sort((a, b) => a - b).map(n => `${n} (${noteName(n)})`).join('  ');
}

clear.onclick = () => { log.innerHTML = ''; };

function midiMsgToString(data) {
  const status = data[0];
  const msgType = status & 0xf0;
  const channel = (status & 0x0f) + 1;
  const b1 = data[1];
  const b2 = data[2];

  if (msgType === 0x90 && b2 > 0) return [`note-on`, `ch ${channel} note ${b1} vel ${b2}`];
  if (msgType === 0x80 || (msgType === 0x90 && b2 === 0)) return [`note-off`, `ch ${channel} note ${b1} vel ${b2}`];
  if (msgType === 0xb0) return [`cc`, `ch ${channel} cc ${b1} val ${b2}`];
  return [`other`, `[${data.join(', ')}]`];
}

function onMidiMessage(e) {
  const [cls, text] = midiMsgToString(Array.from(e.data));
  if (cls === 'other') return;
  if (cls === 'note-on') heldNotes.add(e.data[1]);
  if (cls === 'note-off') heldNotes.delete(e.data[1]);
  renderHeld();
  const div = document.createElement('div');
  div.className = `msg ${cls}`;
  const t = new Date().toLocaleTimeString();
  div.textContent = `${t}  ${text}`;
  log.prepend(div);
  if (log.children.length > 100) log.lastChild.remove();
}

async function connectPort(port) {
  if (connectedPort) connectedPort.onmidimessage = null;
  connectedPort = port;
  if (port) port.onmidimessage = onMidiMessage;
}

async function refreshPorts() {
  if (!access) return;
  const inputs = Array.from(access.inputs.values());
  portSelect.innerHTML = '';
  if (inputs.length === 0) {
    portSelect.innerHTML = '<option>— no devices —</option>';
    return;
  }
  for (const input of inputs) {
    const opt = document.createElement('option');
    opt.value = input.id;
    opt.textContent = input.name || input.id;
    portSelect.appendChild(opt);
  }
  const selected = inputs.find(i => i.id === portSelect.value) || inputs[0];
  portSelect.value = selected.id;
  connectPort(selected);
}

portSelect.onchange = () => {
  const input = access?.inputs.get(portSelect.value);
  connectPort(input || null);
};

navigator.requestMIDIAccess().then(a => {
  access = a;
  refreshPorts();
  a.onstatechange = () => {
    refreshPorts();
    if (portSelect.value && access.inputs.get(portSelect.value)) return;
    const first = Array.from(access.inputs.values())[0];
    if (first) { portSelect.value = first.id; connectPort(first); }
  };
}).catch(() => {
  log.textContent = 'MIDI not supported in this browser.';
});
