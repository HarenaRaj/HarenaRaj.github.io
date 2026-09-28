// Construction du niveau à partir des données : un chapitre par expérience,
// puis l'arcade des projets, le village des langues et le portail de contact.
import { EXPERIENCES, PROJECTS, LANGUAGES, ZONE_SKILLS } from './data.js';

const BLOCK = 16;
const LOW = -52; // haut d'un bloc atteignable depuis le sol
const HIGH = -92; // haut d'un bloc atteignable depuis une plateforme

export function buildWorld(spr) {
  const w = {
    blocks: [],
    platforms: [],
    bugs: [],
    things: [], // éléments interactifs (PNJ, panneaux, bâtiments, bornes…)
    decor: [],
    posts: [],
    chapters: [],
    width: 0,
    spawnX: 56,
  };

  const addBlocks = (x, top, skills) => {
    skills.forEach((skill, i) => {
      w.blocks.push({ x: x + i * BLOCK, y: top, w: BLOCK, h: BLOCK, skill, used: false, bump: 0 });
    });
    return x + skills.length * BLOCK;
  };
  const addPlatform = (x, y, tiles) => {
    w.platforms.push({ x, y, w: tiles * 16, h: 8 });
    return x + tiles * 16;
  };
  const addBug = (x0, x1) => {
    w.bugs.push({ x: x0 + (x1 - x0) / 2, y: -9, w: 12, h: 9, vx: -18, min: x0, max: x1, dead: 0, alive: true });
  };
  const chapter = (id, x, label, sub, year) => w.chapters.push({ id, x, label, sub, year });

  // ---------- Départ ----------
  let x = 0;
  chapter('start', 0, 'Antananarivo', 'Le point de départ', null);
  w.decor.push({ kind: 'ravinala', x: 8 });
  w.things.push({ kind: 'lemur', id: 'maki-start', x: 96, y: -13, w: 16, h: 13 });
  w.things.push({ kind: 'sign', id: 'welcome', x: 140, y: -22, w: 24, h: 22 });
  w.things.push({ kind: 'photo', id: 'souvenir', x: 192, y: -26, w: 18, h: 26 });
  x = addBlocks(250, LOW, ZONE_SKILLS.start.slice(0, 2));
  x = addBlocks(318, LOW, ZONE_SKILLS.start.slice(2));
  addBug(380, 470);
  w.decor.push({ kind: 'baobab', x: 400, i: 0 });
  x = 520;

  // ---------- Chapitres = expériences ----------
  EXPERIENCES.forEach((exp, i) => {
    const b = spr.buildings[exp.id];
    w.posts.push({ x, year: exp.year, color: exp.color });
    chapter(exp.id, x - 10, `${exp.year} · ${exp.short}`, exp.role, exp.year);
    const bx = x + 50;
    w.things.push({ kind: 'building', id: exp.id, exp, x: bx, y: -b.height, w: b.width, h: b.height });
    w.decor.push({ kind: 'lamp', x: bx - 16 });
    x = bx + b.width + 30;
    const skills = [...exp.skills];
    const low = skills.splice(0, Math.min(3, skills.length));
    const ax = addBlocks(x, LOW, low);
    if (skills.length) {
      const px = ax + 40;
      addPlatform(px, -40, Math.max(3, skills.length + 1));
      addBlocks(px + 8, HIGH, skills);
      addBug(x - 10, px + 70 + skills.length * 16);
      x = px + 70 + skills.length * 16;
    } else {
      addBug(x - 10, ax + 90);
      x = ax + 90;
    }
    if (i % 2 === 0) w.decor.push({ kind: 'baobab', x: x - 30, i: (i + 1) % 3 });
    else w.decor.push({ kind: 'ravinala', x: x - 30 });
    x += 60;
  });

  // ---------- Arcade des projets ----------
  chapter('projects', x - 10, 'Arcade des projets', 'Applications mobiles, web et embarqué', null);
  w.things.push({ kind: 'sign', id: 'arcade', x, y: -22, w: 24, h: 22 });
  x += 56;
  PROJECTS.forEach((p) => {
    w.things.push({ kind: 'cabinet', id: p.id, project: p, x, y: -40, w: 24, h: 40 });
    x += 80;
  });
  // Compétences des projets : alternance de blocs au sol et de blocs au-dessus d'une plateforme
  const blocksStart = x;
  const pending = [...ZONE_SKILLS.projects];
  for (let k = 0; pending.length; k++) {
    const chunk = pending.splice(0, 3);
    if (k % 2 === 0) {
      addBlocks(x, LOW, chunk);
      x += chunk.length * 16 + 40;
    } else {
      const end = addPlatform(x, -40, chunk.length + 2);
      addBlocks(x + 16, HIGH, chunk);
      x = end + 40;
    }
  }
  addBug(blocksStart - 10, x - 20);
  addBug(blocksStart + (x - blocksStart) / 2, x);
  x += 30;

  // ---------- Village des langues ----------
  chapter('languages', x - 10, 'Village des langues', 'Malagasy · Français · Anglais', null);
  LANGUAGES.forEach((lang, i) => {
    w.things.push({ kind: 'npc', id: `lang-${i}`, lang, npc: i, x, y: -20, w: 12, h: 20 });
    x += 72;
  });
  w.decor.push({ kind: 'baobab', x: x - 10, i: 2 });
  x += 70;

  // ---------- Contact ----------
  chapter('contact', x - 10, 'Portail de contact', 'Fin de la quête', null);
  w.things.push({ kind: 'lemur', id: 'maki-end', x, y: -13, w: 16, h: 13 });
  x += 60;
  w.portal = { x, y: -56, w: 36, h: 56 };
  w.width = x + 110;
  return w;
}

export function totals(world) {
  return {
    skills: world.blocks.length,
    bugs: world.bugs.length,
    places: world.things.filter((t) => ['building', 'cabinet', 'npc'].includes(t.kind)).length,
  };
}
