// Moteur du jeu : boucle, physique, caméra et rendu pixel art.
import { sfx } from './audio.js';
import { PAL, buildSprites, rng } from './sprites.js';
import { buildWorld, totals } from './world.js';
import { EXPERIENCES, PROJECTS, SKILLS, BUG_JOKES, PROFILE } from './data.js';

const STEP = 1 / 120;
const GRAVITY = 950;
const JUMP_V = 335;
const SPEED = 105;
const ACCEL = 14;
const FONT = '8px "Press Start 2P"';

// Ciel : du coucher de soleil sur les baobabs (2020) jusqu'à la nuit (contact)
const SKY = [
  { t: 0, top: '#2a0b1a', mid: '#761c31', bot: '#cf5a40' },
  { t: 0.5, top: '#1f0915', mid: '#62162a', bot: '#ab3b39' },
  { t: 0.8, top: '#12050d', mid: '#3e0e1c', bot: '#6e1a2b' },
  { t: 1, top: '#060307', mid: '#16060e', bot: '#330b17' },
];

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const smooth = (a, b, v) => {
  const k = clamp((v - a) / (b - a), 0, 1);
  return k * k * (3 - 2 * k);
};
const overlap = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

function hexToRgb(h) {
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function mixHex(a, b, k) {
  const A = hexToRgb(a);
  const B = hexToRgb(b);
  return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * k)).join(',')})`;
}
function skyAt(t) {
  let i = 0;
  while (i < SKY.length - 2 && t > SKY[i + 1].t) i++;
  const a = SKY[i];
  const b = SKY[i + 1];
  const k = clamp((t - a.t) / (b.t - a.t), 0, 1);
  return { top: mixHex(a.top, b.top, k), mid: mixHex(a.mid, b.mid, k), bot: mixHex(a.bot, b.bot, k) };
}

export class Game {
  constructor(canvas, ui) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.ui = ui;
    this.isTouch = window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
    this.spr = buildSprites(EXPERIENCES, PROJECTS);
    this.photo = new Image();
    this.photo.src = PROFILE.photos.teloiray;
    this.mode = 'title';
    this.time = 0;
    this.acc = 0;
    this.last = 0;
    this.camX = 0;
    this.keys = { left: false, right: false, jump: false };
    this.jumpBuf = 0;
    this.actBuf = 0;
    const r = rng(42);
    this.stars = Array.from({ length: 110 }, () => ({ x: r(), y: r(), s: r() < 0.12 ? 2 : 1, p: r() * 6 }));
    this.cloudsBg = Array.from({ length: 8 }, (_, i) => ({ x: r() * 900, y: 30 + r() * 80, i: i % 3, a: 0.1 + r() * 0.12 }));
    this.reset();
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  reset() {
    this.world = buildWorld(this.spr);
    this.totals = totals(this.world);
    this.player = { x: this.world.spawnX, y: -19, w: 10, h: 19, vx: 0, vy: 0, face: 1, onGround: true, coyote: 0, stun: 0, inv: 0, prevBottom: 0 };
    this.items = [];
    this.particles = [];
    this.near = null;
    this.inPortal = false;
    this.lastHurtToast = -10;
    this.state = {
      xp: 0,
      level: 1,
      skills: new Set(),
      bugs: 0,
      visited: new Set(),
      chapters: new Set(),
      title: 'Aventurier',
      startedAt: 0,
      finished: false,
      souvenir: false,
    };
    this.camX = 0;
  }

  // ---------- Dimensions : pixels entiers, le jeu occupe tout l'écran ----------
  resize() {
    const dpr = window.devicePixelRatio || 1;
    const devW = window.innerWidth * dpr;
    const devH = window.innerHeight * dpr;
    const portrait = window.innerHeight > window.innerWidth;
    this.portrait = portrait;
    const scale = Math.max(1, Math.floor(Math.min(devH / 240, devW / (portrait ? 220 : 360))));
    this.scale = scale;
    this.viewW = Math.ceil(devW / scale);
    this.viewH = Math.ceil(devH / scale);
    this.canvas.width = this.viewW;
    this.canvas.height = this.viewH;
    this.canvas.style.width = `${(this.viewW * scale) / dpr}px`;
    this.canvas.style.height = `${(this.viewH * scale) / dpr}px`;
    this.ctx.imageSmoothingEnabled = false;
    const bottom = this.isTouch ? 64 : 44;
    this.groundY = portrait ? Math.round(this.viewH * 0.62) : this.viewH - bottom;
  }

  get paused() {
    return this.mode !== 'play' || this.ui.isBlocking();
  }

  start() {
    requestAnimationFrame((ts) => {
      this.last = ts;
      this.loop(ts);
    });
  }

  play() {
    this.mode = 'play';
    if (!this.state.startedAt) this.state.startedAt = performance.now();
    this.camX = clamp(this.player.x - this.viewW * 0.42, 0, Math.max(0, this.world.width - this.viewW));
  }

  restart() {
    this.reset();
    this.ui.updateHUD(this);
    this.play();
  }

  // ---------- Entrées ----------
  press(action) {
    if (action === 'left') this.keys.left = true;
    if (action === 'right') this.keys.right = true;
    if (action === 'jump') {
      if (!this.keys.jump) this.jumpBuf = 0.12;
      this.keys.jump = true;
    }
    if (action === 'act') this.actBuf = 0.12;
  }

  release(action) {
    if (action in this.keys) this.keys[action] = false;
  }

  releaseAll() {
    this.keys.left = this.keys.right = this.keys.jump = false;
  }

  teleport(chapterId) {
    const c = this.world.chapters.find((ch) => ch.id === chapterId);
    if (!c) return;
    const p = this.player;
    p.x = clamp(c.x + 24, 0, this.world.width - p.w);
    p.y = -p.h;
    p.vx = p.vy = 0;
    this.camX = clamp(p.x - this.viewW * 0.42, 0, Math.max(0, this.world.width - this.viewW));
    sfx.zone();
    this.burst(p.x + 5, p.y + 10, [PAL.wine, PAL.gold, PAL.cream], 16);
  }

  // ---------- Boucle ----------
  loop(ts) {
    const dt = Math.min(0.05, (ts - this.last) / 1000 || 0);
    this.last = ts;
    this.time += dt;
    if (!this.paused) {
      this.acc += dt;
      while (this.acc >= STEP) {
        this.update(STEP);
        this.acc -= STEP;
      }
    } else {
      this.acc = 0;
      if (this.mode === 'title') {
        const span = Math.max(1, this.world.width - this.viewW);
        this.camX = (span / 2) * (1 - Math.cos(this.time * 0.05));
      }
    }
    this.updateEffects(dt);
    this.render();
    requestAnimationFrame((t) => this.loop(t));
  }

  update(dt) {
    const p = this.player;
    const w = this.world;
    p.stun = Math.max(0, p.stun - dt);
    p.inv = Math.max(0, p.inv - dt);

    const dir = (this.keys.right ? 1 : 0) - (this.keys.left ? 1 : 0);
    if (p.stun <= 0) {
      p.vx += (dir * SPEED - p.vx) * Math.min(1, dt * ACCEL);
      if (dir) p.face = dir;
    }

    p.coyote = p.onGround ? 0.09 : p.coyote - dt;
    this.jumpBuf -= dt;
    if (this.jumpBuf > 0 && p.coyote > 0) {
      p.vy = -JUMP_V;
      p.onGround = false;
      p.coyote = 0;
      this.jumpBuf = 0;
      sfx.jump();
    }
    if (!this.keys.jump && p.vy < -120) p.vy = -120;
    p.vy = Math.min(p.vy + GRAVITY * dt, 520);

    // Axe X
    p.x = clamp(p.x + p.vx * dt, 0, w.width - p.w);
    for (const b of w.blocks) {
      if (!overlap(p, b)) continue;
      p.x = p.x + p.w / 2 < b.x + b.w / 2 ? b.x - p.w : b.x + b.w;
      p.vx = 0;
    }

    // Axe Y
    p.prevBottom = p.y + p.h;
    p.y += p.vy * dt;
    p.onGround = false;
    if (p.y + p.h >= 0) {
      p.y = -p.h;
      p.vy = 0;
      p.onGround = true;
    }
    let headHit = null;
    let best = 0;
    for (const b of w.blocks) {
      if (!overlap(p, b)) continue;
      if (p.vy > 0) {
        p.y = b.y - p.h;
        p.vy = 0;
        p.onGround = true;
      } else if (p.vy < 0) {
        const ov = Math.min(p.x + p.w, b.x + b.w) - Math.max(p.x, b.x);
        if (ov > best) {
          best = ov;
          headHit = b;
        }
      }
    }
    if (headHit) {
      p.y = headHit.y + headHit.h;
      p.vy = 0;
      this.hitBlock(headHit);
    }
    if (p.vy >= 0) {
      for (const pl of w.platforms) {
        if (p.prevBottom <= pl.y + 0.5 && p.y + p.h >= pl.y && p.x + p.w > pl.x && p.x < pl.x + pl.w) {
          p.y = pl.y - p.h;
          p.vy = 0;
          p.onGround = true;
        }
      }
    }

    // Bugs
    for (const bug of w.bugs) {
      if (!bug.alive) continue;
      if (bug.dead > 0) {
        bug.dead -= dt;
        if (bug.dead <= 0) bug.alive = false;
        continue;
      }
      bug.x += bug.vx * dt;
      if (bug.x < bug.min) {
        bug.x = bug.min;
        bug.vx = Math.abs(bug.vx);
      }
      if (bug.x + bug.w > bug.max) {
        bug.x = bug.max - bug.w;
        bug.vx = -Math.abs(bug.vx);
      }
      if (!overlap(p, bug)) continue;
      if (p.vy > 0 && p.prevBottom <= bug.y + 5) this.stomp(bug);
      else if (p.inv <= 0) this.hurt(bug);
    }

    // Interactions
    this.near = null;
    let bestD = Infinity;
    const pcx = p.x + p.w / 2;
    for (const t of w.things) {
      const cx = t.x + t.w / 2;
      const d = Math.abs(pcx - cx);
      const range = t.kind === 'building' ? 16 : t.w / 2 + 12;
      if (d < range && d < bestD && p.y + p.h > t.y - 30) {
        bestD = d;
        this.near = t;
      }
    }
    this.actBuf -= dt;
    if (this.actBuf > 0 && this.near) {
      this.actBuf = 0;
      this.releaseAll();
      this.ui.interact(this.near, this);
    }

    // Chapitres
    for (const c of w.chapters) {
      if (pcx >= c.x && !this.state.chapters.has(c.id)) {
        this.state.chapters.add(c.id);
        if (c.id !== 'start') {
          this.ui.banner(c.label, c.sub);
          sfx.zone();
        }
      }
    }

    // Portail
    const pt = w.portal;
    const inPortal = overlap(p, { x: pt.x + 8, y: pt.y, w: pt.w - 16, h: pt.h });
    if (inPortal && !this.inPortal) {
      this.inPortal = true;
      this.finish();
    } else if (!inPortal) this.inPortal = false;

    // Caméra
    const target = pcx - this.viewW * 0.42 + p.face * 16;
    this.camX += (target - this.camX) * Math.min(1, dt * 5);
    this.camX = clamp(this.camX, 0, Math.max(0, w.width - this.viewW));
    this.ui.updateProgress(this);
  }

  updateEffects(dt) {
    for (const b of this.world.blocks) b.bump = Math.max(0, b.bump - dt);
    this.items = this.items.filter((it) => {
      it.t += dt;
      it.y += it.vy * dt;
      it.vy += 260 * dt;
      return it.t < 0.9;
    });
    this.particles = this.particles.filter((pa) => {
      pa.life -= dt;
      pa.x += pa.vx * dt;
      pa.y += pa.vy * dt;
      pa.vy += 300 * dt;
      return pa.life > 0;
    });
  }

  // ---------- Événements de jeu ----------
  addXP(n) {
    const s = this.state;
    s.xp += n;
    const lvl = Math.floor(Math.sqrt(s.xp / 40)) + 1;
    if (lvl > s.level) {
      s.level = lvl;
      sfx.levelUp();
      this.ui.toast(`LEVEL UP ! Niveau ${lvl}`, PAL.gold, true);
      const p = this.player;
      this.burst(p.x + 5, p.y, [PAL.gold, PAL.goldLight, PAL.cream], 24);
    }
    this.ui.updateHUD(this);
  }

  hitBlock(b) {
    b.bump = 0.15;
    sfx.bump();
    if (b.used) return;
    b.used = true;
    const sk = SKILLS[b.skill];
    this.items.push({ skill: b.skill, x: b.x + 8, y: b.y - 10, vy: -150, t: 0 });
    this.state.skills.add(b.skill);
    setTimeout(() => sfx.coin(), 60);
    this.ui.toast(`+ ${sk.name}`, sk.color);
    this.burst(b.x + 8, b.y, [sk.color, PAL.gold], 10);
    this.addXP(20);
  }

  stomp(bug) {
    bug.dead = 0.5;
    this.player.vy = -230;
    this.state.bugs++;
    sfx.stomp();
    this.ui.toast(`🐛 ${BUG_JOKES[(this.state.bugs - 1) % BUG_JOKES.length]}`, '#8fd14f');
    this.burst(bug.x + 6, bug.y + 4, ['#8fd14f', '#5e9a2c', '#fff'], 12);
    this.addXP(30);
  }

  hurt(bug) {
    const p = this.player;
    p.vx = (p.x + p.w / 2 < bug.x + bug.w / 2 ? -1 : 1) * 150;
    p.vy = -170;
    p.stun = 0.3;
    p.inv = 1.2;
    sfx.hurt();
    if (this.time - this.lastHurtToast > 4) {
      this.lastHurtToast = this.time;
      this.ui.toast('Aïe, un bug en prod ! Saute dessus pour le corriger.', PAL.wine);
    }
  }

  visit(id, xp) {
    if (this.state.visited.has(id)) return false;
    this.state.visited.add(id);
    this.addXP(xp);
    return true;
  }

  finish() {
    this.releaseAll();
    this.state.finished = true;
    sfx.victory();
    this.ui.showEnd(this);
  }

  burst(x, y, colors, n) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const v = 40 + Math.random() * 90;
      this.particles.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 60, life: 0.5 + Math.random() * 0.4, color: colors[i % colors.length] });
    }
  }

  // ---------- Rendu ----------
  text(str, x, y, color = PAL.cream, align = 'left') {
    const c = this.ctx;
    c.font = FONT;
    c.textBaseline = 'top';
    c.textAlign = align;
    c.fillStyle = 'rgba(0,0,0,0.75)';
    c.fillText(str, Math.round(x) + 1, Math.round(y) + 1);
    c.fillStyle = color;
    c.fillText(str, Math.round(x), Math.round(y));
  }

  render() {
    const c = this.ctx;
    const W = this.viewW;
    const H = this.viewH;
    const gy = this.groundY;
    const cam = Math.round(this.camX);
    const focus = this.mode === 'title' ? cam + W / 2 : this.player.x;
    const t = clamp(focus / this.world.width, 0, 1);

    // Ciel
    const sky = skyAt(t);
    const grad = c.createLinearGradient(0, 0, 0, gy);
    grad.addColorStop(0, sky.top);
    grad.addColorStop(0.55, sky.mid);
    grad.addColorStop(1, sky.bot);
    c.fillStyle = grad;
    c.fillRect(0, 0, W, gy);

    this.drawStars(t, cam, gy);
    this.drawSunMoon(t, cam, gy);
    this.drawClouds(cam);
    this.drawMountains(cam, gy, t);
    this.drawFarBaobabs(cam, gy);

    c.save();
    c.translate(-cam, gy);
    this.drawDecor(cam);
    this.drawPosts();
    this.drawThings();
    this.drawPortal();
    this.drawPlatforms();
    this.drawBlocks();
    this.drawBugs();
    this.drawPlayer();
    this.drawItems();
    this.drawParticles();
    this.drawPrompt();
    c.restore();

    this.drawGround(cam, gy, H, W);
  }

  drawStars(t, cam, gy) {
    const c = this.ctx;
    const vis = 0.2 + 0.8 * smooth(0.35, 0.9, t);
    const W = this.viewW;
    for (const s of this.stars) {
      const x = (((s.x * W * 1.5 - cam * 0.03) % W) + W) % W;
      const y = s.y * gy * 0.75;
      const tw = 0.6 + 0.4 * Math.sin(this.time * 2 + s.p);
      c.fillStyle = `rgba(255,236,220,${(vis * tw * (y < gy * 0.5 ? 1 : 0.5)).toFixed(3)})`;
      c.fillRect(Math.round(x), Math.round(y), s.s, s.s);
    }
  }

  drawSunMoon(t, cam, gy) {
    const c = this.ctx;
    const W = this.viewW;
    const sx = Math.round(W * 0.7 - cam * 0.015);
    const sy = Math.round(gy - 64 + t * 100);
    const r = 20;
    if (sy - r < gy) {
      const glow = c.createRadialGradient(sx, sy, 4, sx, sy, 70);
      glow.addColorStop(0, 'rgba(255,150,90,0.35)');
      glow.addColorStop(1, 'rgba(255,120,80,0)');
      c.fillStyle = glow;
      c.fillRect(sx - 70, sy - 70, 140, 140);
      for (let y = -r; y <= r; y++) {
        if (y > 2 && (y + 40) % 5 < 1 + (y - 2) / 6) continue; // rayures « rétro »
        const ww = Math.round(Math.sqrt(r * r - y * y));
        const k = (y + r) / (2 * r);
        c.fillStyle = mixHex('#ffd27a', '#e8484f', k);
        c.fillRect(sx - ww, sy + y, ww * 2, 1);
      }
    }
    const ma = smooth(0.72, 0.95, t);
    if (ma > 0) {
      const mx = Math.round(W * 0.22);
      const my = 34;
      const mr = 9;
      c.globalAlpha = ma;
      c.fillStyle = '#f6ead8';
      for (let y = -mr; y <= mr; y++) {
        for (let x = -mr; x <= mr; x++) {
          const inA = x * x + y * y <= mr * mr;
          const inB = (x - 4) * (x - 4) + (y + 2) * (y + 2) <= mr * mr;
          if (inA && !inB) c.fillRect(mx + x, my + y, 1, 1);
        }
      }
      c.globalAlpha = 1;
    }
  }

  drawClouds(cam) {
    const c = this.ctx;
    const W = this.viewW;
    const span = W + 160;
    for (const cl of this.cloudsBg) {
      const x = ((((cl.x - cam * 0.12 + this.time * 3) % span) + span) % span) - 80;
      c.globalAlpha = cl.a;
      c.drawImage(this.spr.clouds[cl.i], Math.round(x), Math.round(cl.y));
    }
    c.globalAlpha = 1;
  }

  drawMountains(cam, gy, t) {
    const c = this.ctx;
    const W = this.viewW;
    const layers = [
      { p: 0.1, col: mixHex('#4a1224', '#1a0710', t), f: (x) => 46 + 18 * Math.sin(x * 0.011) + 11 * Math.sin(x * 0.029 + 1) + 5 * Math.sin(x * 0.071 + 2) },
      { p: 0.22, col: mixHex('#330c1a', '#0f050a', t), f: (x) => 24 + 12 * Math.sin(x * 0.019 + 3) + 7 * Math.sin(x * 0.047) + 3 * Math.sin(x * 0.13) },
    ];
    for (const L of layers) {
      c.fillStyle = L.col;
      for (let sx = 0; sx < W; sx += 2) {
        const h = Math.round(L.f(sx + cam * L.p));
        c.fillRect(sx, gy - h, 2, h);
      }
    }
  }

  drawFarBaobabs(cam, gy) {
    const c = this.ctx;
    const W = this.viewW;
    const p = 0.4;
    const gap = 150;
    const off = cam * p;
    const k0 = Math.floor((off - 100) / gap);
    const k1 = Math.ceil((off + W) / gap);
    for (let k = k0; k <= k1; k++) {
      const r = rng(1000 + k * 7919)();
      const s = this.spr.farBaobabs[((k % 3) + 3) % 3];
      const x = Math.round(k * gap + r * 60 - off);
      c.drawImage(s, x, gy - s.height + 2);
    }
    c.fillStyle = 'rgba(20,6,12,0.35)';
    c.fillRect(0, gy - 6, W, 6);
  }

  drawDecor(cam) {
    const c = this.ctx;
    for (const d of this.world.decor) {
      if (d.x < cam - 140 || d.x > cam + this.viewW + 20) continue;
      if (d.kind === 'baobab') {
        const s = this.spr.baobabs[d.i];
        c.drawImage(s, d.x, -s.height + 2);
      } else if (d.kind === 'ravinala') {
        const s = this.spr.ravinala;
        c.drawImage(s, d.x, -s.height + 1);
      } else if (d.kind === 'lamp') {
        const glow = c.createRadialGradient(d.x + 1, -30, 1, d.x + 1, -30, 22);
        const a = 0.28 + 0.06 * Math.sin(this.time * 3 + d.x);
        glow.addColorStop(0, `rgba(255,210,130,${a})`);
        glow.addColorStop(1, 'rgba(255,210,130,0)');
        c.fillStyle = glow;
        c.fillRect(d.x - 22, -52, 46, 46);
        c.fillStyle = '#0c0708';
        c.fillRect(d.x, -30, 2, 30);
        c.fillRect(d.x - 2, -33, 6, 3);
        c.fillStyle = '#ffd98a';
        c.fillRect(d.x - 1, -30, 4, 2);
      }
    }
  }

  drawPosts() {
    const c = this.ctx;
    for (const p of this.world.posts) {
      c.fillStyle = '#0c0708';
      c.fillRect(p.x, -70, 3, 70);
      c.fillStyle = PAL.gold;
      c.fillRect(p.x - 1, -73, 5, 3);
      const wave = Math.round(Math.sin(this.time * 4 + p.x) * 1);
      c.fillStyle = '#0c0708';
      c.fillRect(p.x + 3, -68 + wave, 40, 16);
      c.fillStyle = PAL.bordeaux;
      c.fillRect(p.x + 3, -67 + wave, 39, 14);
      c.fillStyle = p.color;
      c.fillRect(p.x + 3, -67 + wave, 39, 2);
      this.text(String(p.year), p.x + 7, -63 + wave, PAL.cream);
    }
  }

  drawThings() {
    const c = this.ctx;
    const p = this.player;
    const pcx = p.x + p.w / 2;
    for (const th of this.world.things) {
      const visited = this.state.visited.has(th.id);
      if (th.kind === 'building') {
        const s = this.spr.buildings[th.id];
        c.drawImage(s, th.x, th.y);
        // Enseigne sur le toit
        const label = th.exp.short;
        const bw = label.length * 8 + 8;
        const bx = Math.round(th.x + th.w / 2 - bw / 2);
        const by = th.y - 17;
        c.fillStyle = '#0c0708';
        c.fillRect(bx + 4, by + 12, 2, 5);
        c.fillRect(bx + bw - 6, by + 12, 2, 5);
        c.fillRect(bx - 1, by - 1, bw + 2, 14);
        c.fillStyle = PAL.bordeauxDark;
        c.fillRect(bx, by, bw, 12);
        c.fillStyle = th.exp.color;
        c.fillRect(bx, by, bw, 1);
        this.text(label, bx + 4, by + 2, PAL.cream);
        if (th.exp.current && Math.sin(this.time * 4) > -0.7) {
          this.text('ACTUEL', th.x + th.w / 2, by - 13, PAL.gold, 'center');
        }
        if (visited) {
          c.fillStyle = '#0c0708';
          c.fillRect(bx + bw + 3, by - 2, 2, 16);
          c.fillStyle = '#8fd14f';
          c.fillRect(bx + bw + 5, by - 2, 8, 5);
        }
      } else if (th.kind === 'sign') {
        c.fillStyle = '#2a160f';
        c.fillRect(th.x + 11, th.y + 10, 3, 12);
        c.fillStyle = '#0c0708';
        c.fillRect(th.x, th.y, 24, 13);
        c.fillStyle = '#6a3a24';
        c.fillRect(th.x + 1, th.y + 1, 22, 11);
        c.fillStyle = '#8a5234';
        c.fillRect(th.x + 1, th.y + 1, 22, 1);
        this.text(th.id === 'arcade' ? '>' : '!', th.x + 12, th.y + 3, PAL.goldLight, 'center');
      } else if (th.kind === 'photo') {
        c.fillStyle = '#2a160f';
        c.fillRect(th.x + 3, th.y + 14, 2, 12);
        c.fillRect(th.x + 13, th.y + 14, 2, 12);
        c.fillStyle = '#0c0708';
        c.fillRect(th.x, th.y, 18, 20);
        c.fillStyle = '#efe6da';
        c.fillRect(th.x + 1, th.y + 1, 16, 18);
        if (this.photo.complete && this.photo.naturalWidth) {
          c.drawImage(this.photo, 0, 0, this.photo.naturalWidth, this.photo.naturalWidth, th.x + 3, th.y + 3, 12, 12);
        } else {
          c.fillStyle = PAL.bordeaux;
          c.fillRect(th.x + 3, th.y + 3, 12, 12);
        }
        if (!this.state.souvenir && Math.sin(this.time * 6) > 0.6) {
          c.fillStyle = PAL.goldLight;
          c.fillRect(th.x + 15, th.y - 3, 1, 3);
          c.fillRect(th.x + 14, th.y - 2, 3, 1);
        }
      } else if (th.kind === 'lemur') {
        const frames = pcx < th.x + 8 ? this.spr.lemur.left : this.spr.lemur.right;
        const blink = this.time % 3.2 < 0.12 ? 1 : 0;
        const bob = Math.round(Math.sin(this.time * 3) * 0.6);
        c.drawImage(frames[blink], th.x, th.y + bob);
      } else if (th.kind === 'cabinet') {
        this.drawCabinet(th);
      } else if (th.kind === 'npc') {
        const set = this.spr.npcs[th.npc];
        const f = pcx < th.x + 6 ? set.left.idle : set.right.idle;
        c.drawImage(f, th.x, th.y);
        if (th.npc === 0) {
          c.fillStyle = '#d8b46a';
          c.fillRect(th.x - 1, th.y + 1, 14, 2);
          c.fillRect(th.x + 2, th.y - 2, 8, 3);
          c.fillStyle = PAL.bordeaux;
          c.fillRect(th.x + 2, th.y + 0, 8, 1);
        }
        if (Math.abs(pcx - (th.x + 6)) < 110) {
          const msg = th.lang.hello;
          const bw = msg.length * 8 + 8;
          const bx = Math.round(th.x + 6 - bw / 2);
          const by = th.y - 40 - (th.npc % 2) * 14 + Math.round(Math.sin(this.time * 3 + th.npc) * 1);
          c.fillStyle = '#0c0708';
          c.fillRect(bx - 1, by - 1, bw + 2, 14);
          c.fillStyle = PAL.cream;
          c.fillRect(bx, by, bw, 12);
          c.fillRect(th.x + 5, by + 12, 2, 3);
          c.fillRect(th.x + 6, by + 15, 1, 2);
          this.ctx.font = FONT;
          this.ctx.textBaseline = 'top';
          this.ctx.textAlign = 'left';
          c.fillStyle = PAL.bordeaux;
          c.fillText(msg, bx + 4, by + 2);
        }
      }
    }
  }

  drawCabinet(th) {
    const c = this.ctx;
    const pr = th.project;
    c.drawImage(this.spr.cabinets[th.id], th.x, th.y);
    const sx = th.x + 4;
    const sy = th.y + 9;
    c.save();
    c.beginPath();
    c.rect(sx, sy, 16, 13);
    c.clip();
    const tt = this.time;
    if (pr.screen === 'dmx') {
      const cols = ['#ff3355', '#ffcc33', '#33ddff', '#b44cff'];
      for (let i = 0; i < 4; i++) {
        c.fillStyle = cols[(i + Math.floor(tt * 3)) % 4];
        const bx = sx + 2 + i * 4 + Math.round(Math.sin(tt * 2 + i) * 1);
        c.globalAlpha = 0.5 + 0.5 * Math.sin(tt * 5 + i * 1.7);
        c.fillRect(bx, sy, 2, 13);
      }
      c.globalAlpha = 1;
    } else if (pr.screen === 'home') {
      c.fillStyle = '#1a2a44';
      c.fillRect(sx, sy, 16, 13);
      c.fillStyle = '#e8ddd0';
      c.fillRect(sx + 4, sy + 6, 8, 6);
      c.fillStyle = PAL.bordeauxLight;
      c.fillRect(sx + 3, sy + 5, 10, 1);
      c.fillRect(sx + 5, sy + 4, 6, 1);
      c.fillRect(sx + 7, sy + 3, 2, 1);
      c.fillStyle = Math.sin(tt * 8) > 0 ? '#ff2244' : '#551122';
      c.fillRect(sx + 13, sy + 1, 2, 2);
      c.fillStyle = '#ffd27a';
      c.fillRect(sx + 7, sy + 8, 2, 2);
    } else if (pr.screen === 'balance') {
      // barres « à recevoir / à payer » et pièce en Ariary
      c.fillStyle = '#04385c';
      c.fillRect(sx, sy, 16, 13);
      const up = 4 + Math.round((Math.sin(tt * 2) + 1) * 3);
      const down = 4 + Math.round((Math.cos(tt * 1.6) + 1) * 2.5);
      c.fillStyle = '#35d07f';
      c.fillRect(sx + 3, sy + 12 - up, 3, up);
      c.fillStyle = '#ff5a5f';
      c.fillRect(sx + 8, sy + 12 - down, 3, down);
      c.fillStyle = Math.sin(tt * 4) > 0 ? PAL.gold : PAL.goldLight;
      c.fillRect(sx + 12, sy + 2, 3, 3);
    } else if (pr.screen === 'gas') {
      // bouteille de gaz et ticket qui sort de l'imprimante
      c.fillStyle = '#10192e';
      c.fillRect(sx, sy, 16, 13);
      c.fillStyle = '#3b82f6';
      c.fillRect(sx + 2, sy + 4, 5, 8);
      c.fillRect(sx + 3, sy + 3, 3, 1);
      c.fillStyle = '#9fc4ff';
      c.fillRect(sx + 3, sy + 5, 1, 5);
      c.fillStyle = Math.sin(tt * 10) > 0 ? '#ffb347' : '#ff7a2f';
      c.fillRect(sx + 4, sy + 1, 1, 2);
      const len = Math.floor((tt * 5) % 11) + 1;
      c.fillStyle = PAL.cream;
      c.fillRect(sx + 10, sy + 1, 4, len);
      c.fillStyle = '#6b6b78';
      for (let y = 2; y < len; y += 2) c.fillRect(sx + 11, sy + 1 + y, 2, 1);
    } else if (pr.screen === 'music') {
      // portée et notes qui défilent
      c.fillStyle = '#1e0b14';
      c.fillRect(sx, sy, 16, 13);
      c.fillStyle = '#6a4652';
      for (let i = 0; i < 5; i++) c.fillRect(sx, sy + 2 + i * 2, 16, 1);
      c.fillStyle = PAL.cream;
      for (let i = 0; i < 3; i++) {
        const nx = sx + ((((i * 6 - tt * 6) % 18) + 18) % 18) - 1;
        const ny = sy + 3 + ((i * 3 + Math.floor(tt)) % 4) * 2;
        c.fillRect(nx, ny, 2, 2);
        c.fillRect(nx + 1, ny - 3, 1, 3);
      }
    } else if (pr.screen === 'delivery') {
      // camionnette qui livre des colis
      c.fillStyle = '#12213a';
      c.fillRect(sx, sy, 16, 13);
      c.fillStyle = '#3a3a48';
      c.fillRect(sx, sy + 10, 16, 3);
      c.fillStyle = '#e8ddd0';
      for (let i = 0; i < 3; i++) c.fillRect(sx + ((i * 6 - Math.floor(tt * 12)) % 18 + 18) % 18 - 1, sy + 11, 3, 1);
      const vx = sx + Math.floor((tt * 7) % 24) - 8;
      c.fillStyle = PAL.cream;
      c.fillRect(vx, sy + 5, 6, 5);
      c.fillStyle = pr.color;
      c.fillRect(vx + 6, sy + 7, 3, 3);
      c.fillStyle = '#9fd3ff';
      c.fillRect(vx + 7, sy + 7, 1, 1);
      c.fillStyle = '#0c0708';
      c.fillRect(vx + 1, sy + 10, 2, 1);
      c.fillRect(vx + 6, sy + 10, 2, 1);
      c.fillStyle = PAL.gold;
      c.fillRect(vx + 2, sy + 6, 2, 2);
    }
    c.restore();
    // marquee lumineux au-dessus
    const label = pr.short;
    const bw = label.length * 8 + 6;
    const bx = Math.round(th.x + 12 - bw / 2);
    const by = th.y - 16;
    c.fillStyle = '#0c0708';
    c.fillRect(bx - 1, by - 1, bw + 2, 13);
    c.fillStyle = pr.color;
    c.fillRect(bx, by, bw, 11);
    this.text(label, bx + 3, by + 2, PAL.cream);
    if (this.state.visited.has(th.id)) {
      c.fillStyle = '#8fd14f';
      c.fillRect(th.x + 20, th.y + 2, 3, 3);
    }
  }

  drawPortal() {
    const c = this.ctx;
    const pt = this.world.portal;
    const cx = pt.x + pt.w / 2;
    const cy = pt.y + pt.h / 2 + 2;
    const rx = 12;
    const ry = 22;
    const glow = c.createRadialGradient(cx, cy, 2, cx, cy, 60);
    glow.addColorStop(0, 'rgba(201,72,95,0.55)');
    glow.addColorStop(1, 'rgba(201,72,95,0)');
    c.fillStyle = glow;
    c.fillRect(cx - 60, cy - 60, 120, 120);
    c.fillStyle = '#1e0610';
    for (let y = -ry; y <= ry; y++) {
      const ww = Math.round(rx * Math.sqrt(1 - (y * y) / (ry * ry)));
      c.fillRect(Math.round(cx - ww), Math.round(cy + y), ww * 2, 1);
    }
    const cols = [PAL.wine, PAL.gold, PAL.cream, PAL.bordeauxLight];
    for (let i = 0; i < 46; i++) {
      const k = (i / 46 + this.time * 0.25) % 1;
      const a = this.time * 2.4 + i * 0.55;
      const x = cx + Math.cos(a) * rx * k;
      const y = cy + Math.sin(a) * ry * k;
      c.fillStyle = cols[i % 4];
      c.fillRect(Math.round(x), Math.round(y), 2, 2);
    }
    // arche
    c.fillStyle = '#0c0708';
    c.fillRect(pt.x - 4, pt.y - 4, 7, pt.h + 4);
    c.fillRect(pt.x + pt.w - 3, pt.y - 4, 7, pt.h + 4);
    c.fillRect(pt.x - 6, pt.y - 8, pt.w + 12, 6);
    c.fillStyle = PAL.bordeaux;
    c.fillRect(pt.x - 3, pt.y - 3, 5, pt.h + 3);
    c.fillRect(pt.x + pt.w - 2, pt.y - 3, 5, pt.h + 3);
    c.fillRect(pt.x - 5, pt.y - 7, pt.w + 10, 4);
    c.fillStyle = PAL.gold;
    c.fillRect(cx - 2, pt.y - 7, 4, 4);
    this.text('CONTACT', cx, pt.y - 22, PAL.goldLight, 'center');
  }

  drawPlatforms() {
    const c = this.ctx;
    for (const pl of this.world.platforms) {
      for (let x = 0; x < pl.w; x += 16) c.drawImage(this.spr.platform, pl.x + x, pl.y);
    }
  }

  drawBlocks() {
    const c = this.ctx;
    for (const b of this.world.blocks) {
      const off = b.bump > 0 ? Math.round(Math.sin((b.bump / 0.15) * Math.PI) * 4) : 0;
      const idle = !b.used ? Math.round(Math.sin(this.time * 3 + b.x * 0.1) * 0.5) : 0;
      c.drawImage(b.used ? this.spr.blockUsed : this.spr.block, b.x, b.y - off + idle);
    }
  }

  drawBugs() {
    const c = this.ctx;
    for (const bug of this.world.bugs) {
      if (!bug.alive) continue;
      if (bug.dead > 0) {
        c.globalAlpha = Math.min(1, bug.dead * 3);
        c.drawImage(this.spr.bugFlat, Math.round(bug.x), Math.round(bug.y));
        c.globalAlpha = 1;
        continue;
      }
      const f = this.spr.bug[Math.floor(this.time * 8) % 2];
      c.drawImage(f, Math.round(bug.x), Math.round(bug.y));
    }
  }

  drawPlayer() {
    const c = this.ctx;
    const p = this.player;
    if (p.inv > 0 && Math.floor(p.inv * 12) % 2 === 0) return;
    const set = p.face < 0 ? this.spr.hero.left : this.spr.hero.right;
    let f = set.idle;
    if (!p.onGround) f = set.jump;
    else if (Math.abs(p.vx) > 12) f = Math.floor(this.time * 9) % 2 ? set.walk1 : set.walk2;
    c.fillStyle = 'rgba(0,0,0,0.35)';
    c.fillRect(Math.round(p.x), -1, p.w, 1);
    c.drawImage(f, Math.round(p.x) - 1, Math.round(p.y) - 1);
  }

  drawItems() {
    const c = this.ctx;
    for (const it of this.items) {
      const sk = SKILLS[it.skill];
      const w = sk.abbr.length * 8 + 6;
      const x = Math.round(it.x - w / 2);
      const y = Math.round(it.y);
      c.globalAlpha = it.t > 0.6 ? 1 - (it.t - 0.6) / 0.3 : 1;
      c.fillStyle = '#0c0708';
      c.fillRect(x - 1, y - 1, w + 2, 13);
      c.fillStyle = sk.color;
      c.fillRect(x, y, w, 11);
      c.fillStyle = 'rgba(255,255,255,0.35)';
      c.fillRect(x, y, w, 1);
      this.ctx.font = FONT;
      this.ctx.textBaseline = 'top';
      this.ctx.textAlign = 'left';
      c.fillStyle = sk.dark ? '#111' : '#fff';
      c.fillText(sk.abbr, x + 3, y + 2);
      c.globalAlpha = 1;
    }
  }

  drawParticles() {
    const c = this.ctx;
    for (const pa of this.particles) {
      c.globalAlpha = Math.min(1, pa.life * 2);
      c.fillStyle = pa.color;
      c.fillRect(Math.round(pa.x), Math.round(pa.y), 2, 2);
    }
    c.globalAlpha = 1;
  }

  drawPrompt() {
    if (this.mode !== 'play' || !this.near || this.ui.isBlocking()) return;
    const c = this.ctx;
    const p = this.player;
    const x = Math.round(p.x + p.w / 2 - 7);
    const y = Math.round(p.y - 19 + Math.sin(this.time * 6) * 1.5);
    c.fillStyle = '#0c0708';
    c.fillRect(x - 1, y - 1, 16, 15);
    c.fillStyle = PAL.bordeauxLight;
    c.fillRect(x, y, 14, 13);
    c.fillRect(x + 5, y + 13, 4, 2);
    this.text(this.isTouch ? '!' : 'E', x + 7, y + 3, PAL.cream, 'center');
  }

  drawGround(cam, gy, H, W) {
    const c = this.ctx;
    const start = Math.floor(cam / 16) * 16;
    for (let x = start; x < cam + W + 16; x += 16) {
      const sx = x - cam;
      c.drawImage(this.spr.groundTop, sx, gy);
      for (let y = gy + 16; y < H; y += 16) c.drawImage(this.spr.ground, sx, y);
    }
    c.fillStyle = 'rgba(8,3,5,0.25)';
    c.fillRect(0, gy + 16, W, H - gy - 16);
  }
}
