// Effets sonores 8-bit générés à la volée (WebAudio), aucun fichier à charger.

let ctx = null;
let master = null;
let muted = false;

try {
  muted = localStorage.getItem('hq-muted') === '1';
} catch {
  /* stockage indisponible : on garde le son activé */
}

export function unlockAudio() {
  if (ctx) {
    if (ctx.state === 'suspended') ctx.resume();
    return;
  }
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  ctx = new AC();
  master = ctx.createGain();
  master.gain.value = muted ? 0 : 0.18;
  master.connect(ctx.destination);
}

export function isMuted() {
  return muted;
}

export function toggleMute() {
  muted = !muted;
  try {
    localStorage.setItem('hq-muted', muted ? '1' : '0');
  } catch {
    /* ignoré */
  }
  if (master) master.gain.value = muted ? 0 : 0.18;
  return muted;
}

function tone({ freq, to = freq, dur = 0.12, type = 'square', vol = 1, delay = 0 }) {
  if (!ctx || muted) return;
  const t0 = ctx.currentTime + delay;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (to !== freq) osc.frequency.exponentialRampToValueAtTime(to, t0 + dur);
  g.gain.setValueAtTime(vol, t0);
  g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
  osc.connect(g).connect(master);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

function noise(dur = 0.15, vol = 0.6) {
  if (!ctx || muted) return;
  const len = Math.floor(ctx.sampleRate * dur);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = ctx.createBufferSource();
  const g = ctx.createGain();
  g.gain.value = vol;
  src.buffer = buf;
  src.connect(g).connect(master);
  src.start();
}

export const sfx = {
  jump: () => tone({ freq: 220, to: 520, dur: 0.14, vol: 0.5 }),
  bump: () => tone({ freq: 140, to: 90, dur: 0.08, type: 'triangle', vol: 0.9 }),
  coin: () => {
    tone({ freq: 988, dur: 0.07, vol: 0.45 });
    tone({ freq: 1319, dur: 0.22, vol: 0.45, delay: 0.07 });
  },
  stomp: () => {
    tone({ freq: 400, to: 120, dur: 0.12, vol: 0.6 });
    noise(0.08, 0.3);
  },
  hurt: () => tone({ freq: 300, to: 80, dur: 0.25, type: 'sawtooth', vol: 0.35 }),
  open: () => {
    tone({ freq: 523, dur: 0.06, vol: 0.4 });
    tone({ freq: 784, dur: 0.1, vol: 0.4, delay: 0.06 });
  },
  close: () => tone({ freq: 660, to: 330, dur: 0.08, vol: 0.3 }),
  blip: () => tone({ freq: 880, dur: 0.03, vol: 0.12 }),
  levelUp: () => {
    [523, 659, 784, 1047].forEach((f, i) => tone({ freq: f, dur: 0.12, vol: 0.45, delay: i * 0.09 }));
    tone({ freq: 1319, dur: 0.35, vol: 0.4, delay: 0.36 });
  },
  zone: () => {
    tone({ freq: 392, dur: 0.1, type: 'triangle', vol: 0.7 });
    tone({ freq: 587, dur: 0.18, type: 'triangle', vol: 0.7, delay: 0.1 });
  },
  victory: () => {
    const notes = [523, 523, 523, 659, 784, 659, 784, 1047];
    notes.forEach((f, i) => tone({ freq: f, dur: 0.16, vol: 0.4, delay: i * 0.13 }));
  },
};
