const MIDI = {};

MIDI.access = null;
MIDI.connectedPort = null;
MIDI.heldNotes = new Set();
MIDI.NOTE_NAMES = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];

MIDI.noteName = function(n) {
  return MIDI.NOTE_NAMES[n % 12] + (Math.floor(n / 12) - 1);
};

MIDI.midiMsgToString = function(data) {
  const status = data[0];
  const msgType = status & 0xf0;
  const channel = (status & 0x0f) + 1;
  const b1 = data[1];
  const b2 = data[2];

  if (msgType === 0x90 && b2 > 0) return [`note-on`, `ch ${channel} note ${b1} vel ${b2}`];
  if (msgType === 0x80 || (msgType === 0x90 && b2 === 0)) return [`note-off`, `ch ${channel} note ${b1} vel ${b2}`];
  if (msgType === 0xb0) return [`cc`, `ch ${channel} cc ${b1} val ${b2}`];
  return [`other`, `[${data.join(', ')}]`];
};

MIDI._handler = null;

MIDI.setMessageHandler = function(fn) {
  MIDI._handler = fn;
};

MIDI._onMidiMessage = function(e) {
  const [cls, text] = MIDI.midiMsgToString(e.data);
  if (cls === 'note-on') MIDI.heldNotes.add(e.data[1]);
  if (cls === 'note-off') MIDI.heldNotes.delete(e.data[1]);
  if (MIDI._handler) MIDI._handler(cls, text, e.data);
};

MIDI._connectPort = async function(port) {
  if (MIDI.connectedPort) MIDI.connectedPort.onmidimessage = null;
  MIDI.connectedPort = port;
  if (port) port.onmidimessage = MIDI._onMidiMessage;
};

MIDI._refreshPorts = async function(portSelect) {
  if (!MIDI.access) return;
  const inputs = Array.from(MIDI.access.inputs.values());
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
  MIDI._connectPort(selected);
};

MIDI.initMidi = async function(portSelect) {
  if (!portSelect) return;

  portSelect.onchange = () => {
    const input = MIDI.access?.inputs.get(portSelect.value);
    MIDI._connectPort(input || null);
  };

  try {
    const a = await navigator.requestMIDIAccess();
    MIDI.access = a;
    MIDI._refreshPorts(portSelect);
    a.onstatechange = () => {
      MIDI._refreshPorts(portSelect);
      if (portSelect.value && MIDI.access.inputs.get(portSelect.value)) return;
      const first = Array.from(MIDI.access.inputs.values())[0];
      if (first) { portSelect.value = first.id; MIDI._connectPort(first); }
    };
  } catch {
    if (MIDI._handler) MIDI._handler('error', 'MIDI not supported in this browser.', null);
  }
};
