// Sprites pixel art dessinés en code puis mis en cache dans des canvas hors écran.

export const PAL = {
  black: '#0c0809',
  ink: '#16100f',
  bordeaux: '#7b1e32',
  bordeauxDark: '#4e1020',
  bordeauxLight: '#a3263f',
  wine: '#c9485f',
  cream: '#f3e6d8',
  gold: '#e8b04b',
  goldLight: '#f7d27a',
  goldDark: '#9c5f14',
};

function mk(w, h) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
}

function fromRows(rows, pal) {
  const w = Math.max(...rows.map((r) => r.length));
  const c = mk(w, rows.length);
  const g = c.getContext('2d');
  rows.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      const col = pal[row[x]];
      if (!col) continue;
      g.fillStyle = col;
      g.fillRect(x, y, 1, 1);
    }
  });
  return c;
}

function flipped(src) {
  const c = mk(src.width, src.height);
  const g = c.getContext('2d');
  g.translate(src.width, 0);
  g.scale(-1, 1);
  g.drawImage(src, 0, 0);
  return c;
}

// Petit générateur pseudo-aléatoire déterministe (même monde à chaque visite)
export function rng(seed) {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return ((s >>> 0) % 100000) / 100000;
  };
}

// ---------- Héros (inspiré de la photo : cheveux bouclés, lunettes, chemise sombre, jean) ----------
const HERO_PAL = {
  k: '#141014', K: '#3a2e38', s: '#9a6440', S: '#74462b', g: '#050505', l: '#d8ecff', m: '#4a2418',
  t: '#34333d', T: '#24232b', j: '#3f6fb5', J: '#2c4f86', b: '#101010', w: '#e8e8e8',
};
const HEAD = [
  '...kKkKk....',
  '..kkkkkkKk..',
  '.kKkkkkkkkk.',
  '.kkkkssssk..',
  '.kksglgglg..',
  '.kksssssssS.',
  '..ksssssms..',
  '...Sssss....',
  '....sss.....',
];
const BODY = ['..tttttttt..', '.ttTtttttTt.', '.ttTttttttt.', '.s.Tttttt.s.', '...tttttt...'];
const BODY_JUMP = ['s.tttttttt.s', 'sttTtttttTts', '..tTtttttt..', '...Tttttt...', '...tttttt...'];
const LEGS = {
  idle: ['...JJJJJJ...', '...jjj.jjj..', '...jjj.jjj..', '...jJj.jJj..', '..bbbb.bbbb.', '..wwww.wwww.'],
  walk1: ['...JJJJJJ...', '..jjj..jjj..', '.jjj....jjj.', '.jJ......jJj', 'bbb......bbb', 'www......www'],
  walk2: ['...JJJJJJ...', '....jjjjj...', '....jjjj....', '....jJjj....', '...bbbbbb...', '...wwwwww...'],
  jump: ['...JJJJJJ...', '..jjj..jjj..', '..jjj...jjj.', '..bbb....bbb', '..www....www', '............'],
};

function heroFrames(palOverride = {}) {
  const pal = { ...HERO_PAL, ...palOverride };
  const frames = {
    idle: fromRows([...HEAD, ...BODY, ...LEGS.idle], pal),
    walk1: fromRows([...HEAD, ...BODY, ...LEGS.walk1], pal),
    walk2: fromRows([...HEAD, ...BODY, ...LEGS.walk2], pal),
    jump: fromRows([...HEAD, ...BODY_JUMP, ...LEGS.jump], pal),
  };
  const left = {};
  for (const k in frames) left[k] = flipped(frames[k]);
  return { right: frames, left };
}

// ---------- Maki, le lémurien guide ----------
const LEMUR_PAL = { g: '#8f8a8c', G: '#5f5a5c', w: '#efe9e4', k: '#151112', y: '#f5c542' };
const LEMUR = [
  '..w.............',
  '.kw........k..k.',
  '.wk.......gwwwwg',
  '.kw.......wkykyw',
  '.wk.......wwkkww',
  '.kw........wkkw.',
  '..wk....gggggg..',
  '..kw..gggggggg..',
  '...wkgggggggggg.',
  '....ggggggggggg.',
  '....gGggggggGgg.',
  '....gG..Gg..gG..',
  '....kk..kk..kk..',
];
const LEMUR_BLINK = LEMUR.map((r, i) => (i === 3 ? '.kw.......wkkkkw' : r));

// ---------- Bug (ennemi) ----------
const BUG_PAL = { r: '#8fd14f', R: '#5e9a2c', w: '#ffffff', k: '#111111' };
const BUG_TOP = [
  '..k......k..',
  '...k....k...',
  '...rrrrrr...',
  '..rrRrrRrr..',
  '.rwkrrrrwkr.',
  '.rrrrrrrrrr.',
  '..rrRrrRrr..',
];
const BUG_A = [...BUG_TOP, '..k.k..k.k..', '.k..k..k..k.'];
const BUG_B = [...BUG_TOP, '...k.kk.k...', '..k..kk..k..'];
const BUG_FLAT = ['............', '............', '............', '............', '............', '..k......k..', '.rrRrrrrRrr.', 'rwkrrrrrrwkr', 'k.k.k..k.k.k'];

// ---------- Bloc « ? » ----------
const QMARK = ['.xxxx.', 'xx..xx', '....xx', '...xx.', '..xx..', '..xx..', '......', '..xx..'];

function makeBlock(used) {
  const c = mk(16, 16);
  const g = c.getContext('2d');
  g.fillStyle = '#2a1208';
  g.fillRect(0, 0, 16, 16);
  g.fillStyle = used ? '#6b4a3a' : '#dc9d35';
  g.fillRect(1, 1, 14, 14);
  g.fillStyle = used ? '#8a6552' : PAL.goldLight;
  g.fillRect(1, 1, 14, 1);
  g.fillRect(1, 1, 1, 14);
  g.fillStyle = used ? '#4a3025' : PAL.goldDark;
  g.fillRect(1, 14, 14, 1);
  g.fillRect(14, 1, 1, 14);
  g.fillStyle = used ? '#3a241b' : '#7a4a10';
  [[2, 2], [13, 2], [2, 13], [13, 13]].forEach(([x, y]) => g.fillRect(x, y, 1, 1));
  if (!used) {
    g.fillStyle = PAL.bordeaux;
    QMARK.forEach((row, y) => {
      for (let x = 0; x < row.length; x++) if (row[x] === 'x') g.fillRect(5 + x, 4 + y, 1, 1);
    });
  }
  return c;
}

// ---------- Tuiles de sol (terre latérite rouge de Madagascar) ----------
function makeGroundTile(top) {
  const c = mk(16, 16);
  const g = c.getContext('2d');
  const r = rng(top ? 7 : 11);
  g.fillStyle = '#5a1e16';
  g.fillRect(0, 0, 16, 16);
  g.fillStyle = '#461510';
  g.fillRect(0, 7, 16, 1);
  g.fillRect(0, 15, 16, 1);
  g.fillRect(4, 0, 1, 7);
  g.fillRect(12, 8, 1, 7);
  g.fillStyle = '#6e2a1c';
  for (let i = 0; i < 6; i++) g.fillRect(Math.floor(r() * 15), Math.floor(r() * 15), 1, 1);
  if (top) {
    g.fillStyle = '#34401c';
    g.fillRect(0, 0, 16, 4);
    g.fillStyle = '#4e5f25';
    g.fillRect(0, 0, 16, 1);
    for (let x = 0; x < 16; x += 3) g.fillRect(x, 1, 1, 1);
    g.fillStyle = '#34401c';
    for (let x = 1; x < 16; x += 4) g.fillRect(x, 4, 1, 1 + (x % 2));
  }
  return c;
}

function makePlatformTile() {
  const c = mk(16, 8);
  const g = c.getContext('2d');
  g.fillStyle = '#1c0c10';
  g.fillRect(0, 0, 16, 8);
  g.fillStyle = PAL.bordeaux;
  g.fillRect(0, 0, 16, 6);
  g.fillStyle = PAL.bordeauxLight;
  g.fillRect(0, 0, 16, 1);
  g.fillStyle = PAL.bordeauxDark;
  g.fillRect(7, 1, 1, 5);
  g.fillRect(15, 1, 1, 5);
  g.fillRect(0, 5, 16, 1);
  return c;
}

// ---------- Bâtiments (plus la carrière avance, plus ils sont grands) ----------
function makeBuilding(w, h, accent, seed) {
  const c = mk(w, h);
  const g = c.getContext('2d');
  const r = rng(seed);
  const roofH = 10;
  // toit
  g.fillStyle = '#0c0708';
  g.fillRect(0, 0, w, roofH);
  g.fillStyle = PAL.bordeaux;
  g.fillRect(1, 1, w - 2, roofH - 2);
  g.fillStyle = PAL.bordeauxLight;
  g.fillRect(1, 1, w - 2, 1);
  g.fillStyle = PAL.bordeauxDark;
  for (let x = 3; x < w - 2; x += 6) g.fillRect(x, 3, 3, 1);
  // façade
  g.fillStyle = '#0c0708';
  g.fillRect(2, roofH, w - 4, h - roofH);
  g.fillStyle = '#261a20';
  g.fillRect(3, roofH, w - 6, h - roofH);
  g.fillStyle = '#2f2027';
  for (let y = roofH + 2; y < h; y += 4) {
    for (let x = 3 + ((y / 4) % 2) * 3; x < w - 4; x += 7) g.fillRect(x, y, 5, 1);
  }
  // bande couleur entreprise
  g.fillStyle = accent;
  g.fillRect(3, roofH, w - 6, 2);
  // fenêtres
  const doorW = 14;
  const winRows = Math.floor((h - roofH - 36) / 16);
  const cols = Math.floor((w - 12) / 14);
  const offX = Math.floor((w - cols * 14) / 2) + 2;
  for (let row = 0; row < winRows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = offX + col * 14;
      const y = roofH + 6 + row * 16;
      const lit = r() > 0.35;
      g.fillStyle = '#0c0708';
      g.fillRect(x - 1, y - 1, 10, 11);
      g.fillStyle = lit ? '#f3c677' : '#1a1320';
      g.fillRect(x, y, 8, 9);
      if (lit) {
        g.fillStyle = '#ffe4a8';
        g.fillRect(x, y, 8, 1);
      }
      g.fillStyle = '#0c0708';
      g.fillRect(x + 4, y, 1, 9);
      g.fillRect(x, y + 4, 8, 1);
    }
  }
  // enseigne + porte
  const dx = Math.floor(w / 2 - doorW / 2);
  g.fillStyle = '#0c0708';
  g.fillRect(dx - 2, h - 24, doorW + 4, 24);
  g.fillStyle = '#4a2a1a';
  g.fillRect(dx, h - 22, doorW, 22);
  g.fillStyle = '#5e3824';
  g.fillRect(dx + 1, h - 21, doorW / 2 - 2, 20);
  g.fillRect(dx + doorW / 2 + 1, h - 21, doorW / 2 - 2, 20);
  g.fillStyle = PAL.gold;
  g.fillRect(dx + doorW / 2 + 2, h - 11, 1, 2);
  // marches
  g.fillStyle = '#3a2a2a';
  g.fillRect(dx - 3, h - 2, doorW + 6, 2);
  return c;
}

// ---------- Borne d'arcade (projets GitHub) ----------
function makeCabinet(color) {
  const c = mk(24, 40);
  const g = c.getContext('2d');
  g.fillStyle = '#0a0607';
  g.fillRect(2, 0, 20, 40);
  g.fillStyle = color;
  g.fillRect(3, 1, 18, 38);
  g.fillStyle = 'rgba(0,0,0,0.35)';
  g.fillRect(3, 1, 3, 38);
  g.fillRect(18, 1, 3, 38);
  // marquee
  g.fillStyle = '#0a0607';
  g.fillRect(4, 2, 16, 5);
  g.fillStyle = PAL.goldLight;
  g.fillRect(5, 3, 14, 3);
  // écran
  g.fillStyle = '#0a0607';
  g.fillRect(4, 9, 16, 13);
  // panneau de contrôle
  g.fillStyle = '#1a1014';
  g.fillRect(2, 24, 20, 5);
  g.fillStyle = '#e8e0d8';
  g.fillRect(6, 23, 1, 2);
  g.fillStyle = '#ff3355';
  g.fillRect(6, 22, 1, 1);
  g.fillRect(13, 25, 2, 1);
  g.fillStyle = '#44ddff';
  g.fillRect(16, 25, 2, 1);
  // bas
  g.fillStyle = 'rgba(0,0,0,0.3)';
  g.fillRect(6, 31, 12, 6);
  g.fillStyle = PAL.gold;
  g.fillRect(11, 33, 2, 2);
  return c;
}

// ---------- Baobab (silhouette) ----------
function makeBaobab(h, color, seed) {
  const r = rng(seed);
  const w = Math.round(h * 0.9);
  const c = mk(w, h);
  const g = c.getContext('2d');
  g.fillStyle = color;
  const cx = w / 2;
  const trunkTop = Math.round(h * 0.38);
  const tw = h * 0.2;
  for (let y = trunkTop; y < h; y++) {
    const k = (y - trunkTop) / (h - trunkTop);
    const ww = Math.round(tw * (0.85 + 0.35 * k * k));
    g.fillRect(Math.round(cx - ww / 2), y, ww, 1);
  }
  const branches = 5 + Math.floor(r() * 3);
  for (let i = 0; i < branches; i++) {
    const a = -Math.PI / 2 + (i / (branches - 1) - 0.5) * 2.2 + (r() - 0.5) * 0.3;
    const len = h * (0.22 + r() * 0.14);
    let x = cx + (i / (branches - 1) - 0.5) * tw * 0.6;
    let y = trunkTop + 2;
    const steps = Math.round(len);
    for (let s = 0; s < steps; s++) {
      x += Math.cos(a);
      y += Math.sin(a) * 0.8 - 0.15;
      const th = Math.max(1, Math.round(3 * (1 - s / steps)) + 1);
      g.fillRect(Math.round(x), Math.round(y), th, th);
    }
    // touffe de feuilles
    const lw = Math.round(h * (0.1 + r() * 0.06));
    for (let yy = -3; yy <= 1; yy++) {
      const ww = lw - Math.abs(yy) * 2;
      g.fillRect(Math.round(x - ww / 2), Math.round(y + yy), ww, 1);
    }
  }
  return c;
}

// ---------- Ravinala, l'arbre du voyageur ----------
function makeRavinala(h, color) {
  const w = Math.round(h * 0.8);
  const c = mk(w, h);
  const g = c.getContext('2d');
  g.fillStyle = color;
  const cx = Math.round(w / 2);
  const fanY = Math.round(h * 0.45);
  g.fillRect(cx - 2, fanY, 4, h - fanY);
  const leaves = 11;
  for (let i = 0; i < leaves; i++) {
    const a = Math.PI + (i / (leaves - 1)) * Math.PI;
    const len = h * 0.42;
    for (let s = 4; s < len; s++) {
      const x = cx + Math.cos(a) * s;
      const y = fanY + Math.sin(a) * s;
      const th = s > len * 0.35 ? 2 : 1;
      g.fillRect(Math.round(x), Math.round(y), th, th);
    }
  }
  return c;
}

// Nuages en traînées horizontales, comme un coucher de soleil pixel art
function makeCloud(w, seed) {
  const r = rng(seed);
  const rows = 3 + Math.floor(r() * 2);
  const c = mk(w, rows * 3);
  const g = c.getContext('2d');
  const lens = Array.from({ length: rows }, () => Math.round(w * (0.35 + r() * 0.65))).sort((a, b) => a - b);
  let center = w / 2;
  lens.forEach((len, i) => {
    center += (r() - 0.5) * 10;
    const x = Math.round(Math.max(0, Math.min(w - len, center - len / 2)));
    g.fillStyle = i === rows - 1 ? '#ffd9c2' : '#ffb8a0';
    g.fillRect(x, i * 3, len, 3);
  });
  return c;
}

export function buildSprites(experiences, projects) {
  const spr = {
    hero: heroFrames(),
    npcs: [
      heroFrames({ t: '#7b1e32', T: '#5a1424', j: '#2a2a2e', J: '#1c1c20', g: '#9a6440', l: '#9a6440' }),
      heroFrames({ t: '#d9a441', T: '#a87a26', k: '#241612', K: '#3b2a22', j: '#4a2c20', J: '#34201a', g: '#9a6440', l: '#9a6440' }),
      heroFrames({ t: '#e8ddd0', T: '#bfb3a6', k: '#2a1a14', K: '#5a3a2a', s: '#b07a52', S: '#8a5a3a', j: '#262a38', J: '#1a1d28', g: '#b07a52', l: '#b07a52' }),
    ],
    lemur: { right: [fromRows(LEMUR, LEMUR_PAL), fromRows(LEMUR_BLINK, LEMUR_PAL)] },
    bug: [fromRows(BUG_A, BUG_PAL), fromRows(BUG_B, BUG_PAL)],
    bugFlat: fromRows(BUG_FLAT, BUG_PAL),
    block: makeBlock(false),
    blockUsed: makeBlock(true),
    groundTop: makeGroundTile(true),
    ground: makeGroundTile(false),
    platform: makePlatformTile(),
    buildings: {},
    cabinets: {},
    baobabs: [makeBaobab(90, '#12080b', 3), makeBaobab(70, '#12080b', 9), makeBaobab(110, '#12080b', 21)],
    farBaobabs: [makeBaobab(60, '#2a0c16', 5), makeBaobab(46, '#2a0c16', 13), makeBaobab(74, '#2a0c16', 17)],
    ravinala: makeRavinala(64, '#12080b'),
    clouds: [makeCloud(70, 2), makeCloud(96, 4), makeCloud(54, 8)],
  };
  spr.lemur.left = spr.lemur.right.map(flipped);
  const sizes = [
    [72, 70],
    [84, 88],
    [100, 108],
    [112, 132],
  ];
  experiences.forEach((e, i) => {
    const [w, h] = sizes[Math.min(i, sizes.length - 1)];
    spr.buildings[e.id] = makeBuilding(w, h, e.color, 31 + i * 17);
  });
  projects.forEach((p) => {
    spr.cabinets[p.id] = makeCabinet(p.color);
  });
  return spr;
}
