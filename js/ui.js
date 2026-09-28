// Interface HTML au-dessus du canvas : HUD, dialogues, fiches, inventaire, écran de fin, mode CV.
import { sfx, isMuted, toggleMute } from './audio.js';
import { PROFILE, LINKS, SKILLS, EXPERIENCES, PROJECTS, LANGUAGES, yearsOfExperience } from './data.js';

const $ = (sel) => document.querySelector(sel);
const esc = (s) =>
  String(s).replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]);

const ICONS = {
  linkedin:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9.75h4v11H3v-11Zm6.5 0h3.8v1.5h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.78 2.65 4.78 6.1v5.45h-4v-4.83c0-1.15-.02-2.63-1.6-2.63-1.6 0-1.85 1.25-1.85 2.55v4.91h-4v-11Z"/></svg>',
  github:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.56-.29-5.25-1.28-5.25-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.43-2.7 5.4-5.27 5.69.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z"/></svg>',
  facebook:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M13.5 22v-8.2h2.77l.41-3.2H13.5V8.56c0-.93.26-1.56 1.59-1.56h1.7V4.14A22.7 22.7 0 0 0 14.3 4c-2.46 0-4.14 1.5-4.14 4.25v2.35H7.4v3.2h2.77V22h3.33Z"/></svg>',
  email:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M3 5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm9 7.2L4.4 7H4v.9l8 5.5 8-5.5V7h-.4L12 12.2Z"/></svg>',
  phone:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M6.6 10.8a15.5 15.5 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 0 1 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1l-2.3 2.2Z"/></svg>',
  cv: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M6 2h8l6 6v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1Zm7 1.5V9h5.5L13 3.5ZM12 11v5.6l-2.3-2.3-1.4 1.4L12 19.4l3.7-3.7-1.4-1.4-2.3 2.3V11h-2Z"/></svg>',
};

function linkButtons(extraClass = '') {
  const links = LINKS.map(
    (l) =>
      `<a class="link-btn ${extraClass}" style="--c:${l.color}" href="${esc(l.url)}" ${l.url.startsWith('http') ? 'target="_blank" rel="noopener"' : ''}>${ICONS[l.id] || ''}<span>${esc(l.label)}</span></a>`,
  ).join('');
  return `${links}<a class="link-btn ${extraClass}" style="--c:#e8b04b" href="${PROFILE.cv}" download="CV-Harena-RAJAONA.pdf">${ICONS.cv}<span>Télécharger le CV</span></a>`;
}

const SOUND_ON =
  '<svg viewBox="0 0 16 16" aria-hidden="true" shape-rendering="crispEdges"><path fill="currentColor" d="M2 6h3l4-3v10l-4-3H2z"/><path fill="currentColor" d="M11 5h1v6h-1zM13 3h1v10h-1z"/></svg>';
const SOUND_OFF =
  '<svg viewBox="0 0 16 16" aria-hidden="true" shape-rendering="crispEdges"><path fill="currentColor" d="M2 6h3l4-3v10l-4-3H2z"/><path fill="currentColor" d="M11 6h1v1h1V6h1v1h-1v2h1v1h-1V9h-1v1h-1V9h1V7h-1z"/></svg>';

const chips = (list) => list.map((s) => `<span class="chip">${esc(s)}</span>`).join('');

export class UI {
  constructor() {
    this.el = {
      app: $('#app'),
      hud: $('#hud'),
      level: $('#hud-level'),
      cls: $('#hud-class'),
      xp: $('#hud-xp'),
      skills: $('#hud-skills'),
      sound: $('#btn-sound'),
      timeline: $('#timeline'),
      banner: $('#banner'),
      toasts: $('#toasts'),
      dialog: $('#dialog'),
      modal: $('#modal'),
      modalContent: $('#modal .modal-content'),
      title: $('#title-screen'),
      end: $('#end-screen'),
      cv: $('#cv'),
      touch: $('#touch'),
    };
    this.dialogState = null;
    this.lastPct = -1;
    this.bannerTimer = 0;
    this.years = yearsOfExperience();
    this.renderCV();
    this.el.sound.innerHTML = isMuted() ? SOUND_OFF : SOUND_ON;
  }

  attach(game) {
    this.game = game;
    this.buildTimeline();
    this.updateHUD(game);
    this.el.modal.addEventListener('click', (e) => {
      if (e.target === this.el.modal || e.target.closest('.modal-close')) this.closeModal();
    });
    this.el.dialog.addEventListener('click', () => this.advanceDialog());
    $('#btn-inventory').addEventListener('click', () => this.openInventory());
    $('#btn-help').addEventListener('click', () => this.openHelp());
    $('#btn-cv').addEventListener('click', () => this.openCV());
    this.el.sound.addEventListener('click', () => {
      this.el.sound.innerHTML = toggleMute() ? SOUND_OFF : SOUND_ON;
    });
  }

  isBlocking() {
    return !this.el.dialog.hidden || !this.el.modal.hidden || !this.el.end.hidden || !this.el.cv.hidden;
  }
  get dialogOpen() {
    return !this.el.dialog.hidden;
  }
  get modalOpen() {
    return !this.el.modal.hidden;
  }
  get titleOpen() {
    return !this.el.title.hidden;
  }
  get endOpen() {
    return !this.el.end.hidden;
  }
  get cvOpen() {
    return !this.el.cv.hidden;
  }

  // ---------- Titre ----------
  hideTitle() {
    this.el.title.hidden = true;
    this.el.hud.hidden = false;
    this.el.touch.hidden = !this.game.isTouch;
  }

  // ---------- HUD ----------
  buildTimeline() {
    const w = this.game.world;
    const labels = { start: 'Départ', projects: 'Projets', languages: 'Langues', contact: 'Contact' };
    const nodes = w.chapters
      .map((c, i) => {
        const pct = (c.x / w.width) * 100;
        const label = c.year ?? labels[c.id];
        return `<button class="tl-node${i % 2 ? ' up' : ''}" data-id="${c.id}" style="left:${pct}%" title="Aller à : ${esc(c.label)}" aria-label="Aller à : ${esc(c.label)}"><span>${esc(label)}</span></button>`;
      })
      .join('');
    this.el.timeline.innerHTML = `<div class="tl-track"><div class="tl-fill"></div>${nodes}<div class="tl-dot"></div></div>`;
    this.el.timeline.querySelectorAll('.tl-node').forEach((b) =>
      b.addEventListener('click', () => {
        if (this.game.mode === 'play' && !this.isBlocking()) this.game.teleport(b.dataset.id);
        b.blur();
      }),
    );
  }

  updateHUD(game) {
    const s = game.state;
    const cur = 40 * (s.level - 1) ** 2;
    const next = 40 * s.level ** 2;
    this.el.level.textContent = `LVL ${s.level}`;
    this.el.cls.textContent = s.title;
    this.el.xp.style.width = `${Math.min(100, ((s.xp - cur) / (next - cur)) * 100)}%`;
    this.el.skills.textContent = `${s.skills.size}/${game.totals.skills}`;
    this.el.timeline.querySelectorAll('.tl-node').forEach((n) => n.classList.toggle('reached', s.chapters.has(n.dataset.id)));
  }

  updateProgress(game) {
    const pct = Math.round((game.player.x / game.world.width) * 1000) / 10;
    if (pct === this.lastPct) return;
    this.lastPct = pct;
    const dot = this.el.timeline.querySelector('.tl-dot');
    const fill = this.el.timeline.querySelector('.tl-fill');
    if (dot) dot.style.left = `${pct}%`;
    if (fill) fill.style.width = `${pct}%`;
    this.el.timeline.querySelectorAll('.tl-node').forEach((n) => n.classList.toggle('reached', game.state.chapters.has(n.dataset.id)));
  }

  banner(title, sub) {
    const b = this.el.banner;
    b.innerHTML = `<strong>${esc(title)}</strong><span>${esc(sub)}</span>`;
    b.classList.remove('show');
    void b.offsetWidth;
    b.classList.add('show');
    clearTimeout(this.bannerTimer);
    this.bannerTimer = setTimeout(() => b.classList.remove('show'), 2800);
  }

  toast(text, color = '#a3263f', big = false) {
    const t = document.createElement('div');
    t.className = `toast${big ? ' toast-big' : ''}`;
    t.style.setProperty('--c', color);
    t.textContent = text;
    this.el.toasts.appendChild(t);
    while (this.el.toasts.children.length > 4) this.el.toasts.firstChild.remove();
    setTimeout(() => t.classList.add('out'), 2600);
    setTimeout(() => t.remove(), 3000);
  }

  // ---------- Dialogues (style RPG, texte tapé lettre par lettre) ----------
  showDialog(lines, speaker = 'Maki', portrait = 'lemur') {
    return new Promise((resolve) => {
      // Espaces insécables à la française pour éviter un « ! » seul en début de ligne
      lines = lines.map((l) => l.replace(/ ([!?:;»])/g, ' $1').replace(/« /g, '« '));
      this.dialogState = { lines, i: 0, typing: false, resolve, timer: 0 };
      const d = this.el.dialog;
      d.querySelector('.dialog-name').textContent = speaker;
      const pic = d.querySelector('.dialog-portrait');
      if (portrait === 'lemur') {
        this.lemurUrl ||= this.game.spr.lemur.right[0].toDataURL();
        pic.style.backgroundImage = `url(${this.lemurUrl})`;
      } else {
        pic.style.backgroundImage = `url(${PROFILE.photos.pixel})`;
      }
      d.hidden = false;
      this.game.releaseAll();
      this.typeLine();
    });
  }

  typeLine() {
    const st = this.dialogState;
    const p = this.el.dialog.querySelector('.dialog-text');
    const text = st.lines[st.i];
    let n = 0;
    st.typing = true;
    p.textContent = '';
    clearInterval(st.timer);
    st.timer = setInterval(() => {
      n += 2;
      p.textContent = text.slice(0, n);
      if (n % 6 === 0) sfx.blip();
      if (n >= text.length) {
        clearInterval(st.timer);
        st.typing = false;
      }
    }, 22);
  }

  advanceDialog() {
    const st = this.dialogState;
    if (!st) return;
    if (st.typing) {
      clearInterval(st.timer);
      st.typing = false;
      this.el.dialog.querySelector('.dialog-text').textContent = st.lines[st.i];
      return;
    }
    st.i++;
    if (st.i < st.lines.length) {
      this.typeLine();
    } else {
      this.el.dialog.hidden = true;
      this.dialogState = null;
      st.resolve();
    }
  }

  // ---------- Fenêtres modales ----------
  openModal(html, cls = '') {
    this.el.modalContent.innerHTML = html;
    this.el.modal.className = `modal ${cls}`;
    this.el.modal.hidden = false;
    this.game?.releaseAll();
    sfx.open();
    this.el.modal.querySelector('.modal-close').focus({ preventScroll: true });
  }

  closeModal() {
    if (this.el.modal.hidden) return;
    this.el.modal.hidden = true;
    sfx.close();
  }

  // ---------- Interactions avec le monde ----------
  interact(th, game) {
    const touch = game.isTouch;
    switch (th.kind) {
      case 'lemur':
        if (th.id === 'maki-start') this.tutorial(touch);
        else
          this.showDialog([
            'Tu as traversé tout le parcours de Harena, bravo !',
            'Derrière moi se trouve le portail de contact. Entre dedans pour retrouver toutes les façons de le joindre.',
          ]);
        break;
      case 'sign':
        if (th.id === 'welcome')
          this.showDialog(
            [
              `${PROFILE.fullName} — ${PROFILE.title}, basé à ${PROFILE.location}.`,
              `${this.years} ans d'expérience sur .NET, du mobile aux microservices temps réel.`,
              PROFILE.bio,
            ],
            'Panneau',
            'sign',
          );
        else
          this.showDialog(
            [
              "Bienvenue à l'arcade GitHub !",
              'Chaque borne contient un projet de Harena : son application de suivi des dettes, la livraison de gaz sur terminal Sunmi, les partitions d’une chorale, une console d’éclairage DMX… Approche-toi et interagis pour lancer la partie.',
            ],
            'Panneau',
            'sign',
          );
        break;
      case 'photo':
        this.openSouvenir(game);
        break;
      case 'building':
        this.openExperience(th.exp, game);
        break;
      case 'cabinet':
        this.openProject(th.project, game);
        break;
      case 'npc':
        this.openLanguages(game, th.id);
        break;
    }
  }

  tutorial(touch) {
    const move = touch ? 'les flèches ◀ ▶ en bas à gauche' : '← → (ou Q / D)';
    const jump = touch ? 'le bouton ▲' : '↑, Espace (ou Z / W)';
    const act = touch ? 'le bouton E' : 'E ou Entrée';
    return this.showDialog([
      `Salama ! Moi c'est Maki, ton guide. Bienvenue dans l'aventure de ${PROFILE.firstName} ${PROFILE.lastName}, ${PROFILE.title}.`,
      `Avance vers la droite avec ${move} : chaque bâtiment est une étape de son parcours, de 2020 à aujourd'hui.`,
      `Saute avec ${jump} sous les blocs « ? » pour débloquer ses compétences… et saute sur les bugs pour les corriger !`,
      `Approche-toi d'un bâtiment, d'une borne ou d'un personnage et appuie sur ${act}. La frise en haut permet aussi de voyager rapidement. Bonne quête !`,
    ]);
  }

  openSouvenir(game) {
    const first = !game.state.souvenir;
    game.state.souvenir = true;
    if (first) game.addXP(50);
    this.openModal(
      `<div class="souvenir">
        <figure class="polaroid"><img src="${PROFILE.photos.teloiray}" alt="Harena en sweat rouge, photo TeloIray Media"><figcaption>Les débuts · TeloIray</figcaption></figure>
        <div>
          <p class="kicker">Objet trouvé</p>
          <h2>Photo souvenir</h2>
          <p>Une photo prise par TeloIray Media, du temps où tout a commencé. En 2020, Harena rejoint TeloIray COMPANY pour son premier poste de développeur .NET.</p>
          ${first ? '<p class="reward">📸 Souvenir débloqué · +50 XP</p>' : ''}
        </div>
      </div>`,
      'modal-wide',
    );
  }

  openExperience(exp, game) {
    const idx = EXPERIENCES.indexOf(exp) + 1;
    const first = game.visit(exp.id, 100);
    if (first) {
      game.state.title = exp.role;
      this.updateHUD(game);
    }
    this.openModal(
      `<article class="quest" style="--accent:${exp.color}">
        <header class="quest-head">
          <p class="kicker">Chapitre ${idx} · ${exp.year}</p>
          <h2>${esc(exp.company)}</h2>
          <p class="quest-role">${esc(exp.role)} ${exp.current ? '<span class="badge-now">Poste actuel</span>' : ''}</p>
          <p class="quest-meta">${esc(exp.period)} · ${esc(exp.duration)}</p>
        </header>
        <p class="quest-summary"><strong>Mission principale :</strong> ${esc(exp.summary)}</p>
        <h3>Quêtes accomplies</h3>
        <ul class="quest-list">${exp.missions.map((m) => `<li>${esc(m)}</li>`).join('')}</ul>
        <h3>Équipement (stack)</h3>
        <div class="chips">${chips(exp.stack)}</div>
        ${exp.repo ? `<p class="modal-actions"><a class="btn btn-primary" href="${esc(exp.repo.url)}" target="_blank" rel="noopener">${ICONS.github} ${esc(exp.repo.label)}</a></p>` : ''}
        ${first ? `<p class="reward">+100 XP · Nouvelle classe : ${esc(exp.role)}</p>` : ''}
      </article>`,
    );
  }

  openProject(p, game) {
    const first = game.visit(p.id, 60);
    this.openModal(
      `<article class="quest arcade" style="--accent:${p.color}">
        <header class="quest-head">
          <p class="kicker">Borne d'arcade · ${esc(p.kind)}</p>
          <h2>${esc(p.name)}</h2>
          ${p.context ? `<p class="quest-meta">${esc(p.context)}</p>` : ''}
        </header>
        <p class="quest-summary">${esc(p.description)}</p>
        <h3>Technologies</h3>
        <div class="chips">${chips(p.stack)}</div>
        ${
          p.repo
            ? `<p class="modal-actions"><a class="btn btn-primary" href="${esc(p.repo)}" target="_blank" rel="noopener">${ICONS.github} Voir le code sur GitHub</a></p>`
            : '<p class="private-note">🔒 Code source privé</p>'
        }
        ${first ? '<p class="reward">+60 XP · Projet découvert</p>' : ''}
      </article>`,
    );
  }

  openLanguages(game, id) {
    const first = game.visit(id, 30);
    this.openModal(
      `<article class="quest" style="--accent:#e8b04b">
        <header class="quest-head">
          <p class="kicker">Village des langues</p>
          <h2>Langues parlées</h2>
        </header>
        <div class="lang-list">
          ${LANGUAGES.map(
            (l) => `<div class="lang">
              <div class="lang-top"><strong>${esc(l.name)}</strong><span>${esc(l.label)}</span></div>
              <div class="bar"><span style="width:${l.level}%"></span></div>
            </div>`,
          ).join('')}
        </div>
        ${first ? '<p class="reward">+30 XP · Nouveau dialogue débloqué</p>' : ''}
      </article>`,
    );
  }

  openInventory() {
    const game = this.game;
    if (this.game.mode !== 'play' || this.isBlocking()) return;
    const got = game.state.skills;
    const cats = {};
    for (const [id, sk] of Object.entries(SKILLS)) (cats[sk.cat] ||= []).push([id, sk]);
    const html = Object.entries(cats)
      .map(
        ([cat, list]) => `<h3>${esc(cat)}</h3><div class="inv-grid">${list
          .map(([id, sk]) =>
            got.has(id)
              ? `<div class="inv-item" style="--c:${sk.color}"><b>${esc(sk.abbr)}</b><span>${esc(sk.name)}</span></div>`
              : '<div class="inv-item locked"><b>?</b><span>???</span></div>',
          )
          .join('')}</div>`,
      )
      .join('');
    this.openModal(
      `<article class="quest inventory" style="--accent:#e8b04b">
        <header class="quest-head">
          <p class="kicker">Inventaire</p>
          <h2>Compétences : ${got.size} / ${game.totals.skills}</h2>
          <p class="quest-meta">Saute sous les blocs « ? » pour les débloquer. Pressé ? Le <button class="linklike" data-open-cv>mode CV classique</button> les liste toutes.</p>
        </header>
        ${html}
      </article>`,
      'modal-wide',
    );
    this.el.modalContent.querySelector('[data-open-cv]').addEventListener('click', () => {
      this.closeModal();
      this.openCV();
    });
  }

  openHelp() {
    if (this.game.mode !== 'play' || this.isBlocking()) return;
    const chapters = this.game.world.chapters
      .map((c) => `<button class="btn btn-small" data-go="${c.id}">${esc(c.label)}</button>`)
      .join('');
    this.openModal(
      `<article class="quest" style="--accent:#c9485f">
        <header class="quest-head"><p class="kicker">Aide</p><h2>Comment jouer</h2></header>
        <ul class="keys">
          <li><kbd>←</kbd><kbd>→</kbd> ou <kbd>Q</kbd><kbd>D</kbd> Se déplacer</li>
          <li><kbd>↑</kbd> <kbd>Espace</kbd> ou <kbd>Z</kbd> Sauter</li>
          <li><kbd>E</kbd> ou <kbd>Entrée</kbd> Interagir / lire</li>
          <li><kbd>I</kbd> Inventaire · <kbd>Échap</kbd> Fermer</li>
        </ul>
        <p>Objectif : parcourir la carrière de Harena, débloquer ses compétences dans les blocs « ? », corriger les bugs et atteindre le portail de contact.</p>
        <h3>Voyage rapide</h3>
        <div class="go-grid">${chapters}</div>
      </article>`,
    );
    this.el.modalContent.querySelectorAll('[data-go]').forEach((b) =>
      b.addEventListener('click', () => {
        this.closeModal();
        this.game.teleport(b.dataset.go);
      }),
    );
  }

  // ---------- Fin de la quête ----------
  showEnd(game) {
    const s = game.state;
    const t = game.totals;
    const secs = Math.round((performance.now() - s.startedAt) / 1000);
    const time = `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`;
    const score = (s.skills.size + s.visited.size + s.bugs) / (t.skills + t.places + t.bugs);
    const rank = score >= 0.9 ? 'S' : score >= 0.7 ? 'A' : score >= 0.4 ? 'B' : 'C';
    this.el.end.innerHTML = `
      <div class="end-card px">
        <figure class="end-photo"><img src="${PROFILE.photos.night}" alt="Harena RAJAONA de nuit, en chemise sombre"></figure>
        <div class="end-body">
          <p class="kicker">Fin de la quête</p>
          <h2 class="end-title">QUÊTE ACCOMPLIE !</h2>
          <p>Merci d'avoir joué ! Tu connais maintenant le parcours de <strong>Harena</strong>. Un projet, une mission, une question ? Il sera ravi d'en discuter.</p>
          <div class="stats">
            <div><b>${s.skills.size}/${t.skills}</b><span>Compétences</span></div>
            <div><b>${s.bugs}</b><span>Bugs corrigés</span></div>
            <div><b>${s.visited.size}/${t.places}</b><span>Lieux visités</span></div>
            <div><b>${time}</b><span>Temps</span></div>
            <div class="rank"><b>${rank}</b><span>Rang</span></div>
          </div>
          <div class="links">${linkButtons()}</div>
          <div class="end-actions">
            <button class="btn" data-end="continue">Continuer l'exploration</button>
            <button class="btn" data-end="replay">↺ Rejouer</button>
            <button class="btn" data-end="cv">Voir le CV classique</button>
          </div>
        </div>
      </div>`;
    this.el.end.hidden = false;
    this.el.end.querySelector('[data-end="continue"]').focus({ preventScroll: true });
    this.el.end.querySelectorAll('[data-end]').forEach((b) =>
      b.addEventListener('click', () => {
        const a = b.dataset.end;
        this.el.end.hidden = true;
        if (a === 'replay') {
          game.restart();
          this.tutorial(game.isTouch);
        } else if (a === 'cv') this.openCV();
      }),
    );
  }

  // ---------- Mode CV classique (pour les recruteurs pressés) ----------
  renderCV() {
    const skillsByCat = {};
    for (const sk of Object.values(SKILLS)) (skillsByCat[sk.cat] ||= []).push(sk.name);
    const exps = [...EXPERIENCES].reverse();
    this.el.cv.innerHTML = `
      <div class="cv-bar">
        <span class="cv-logo">HARENA<em>QUEST</em></span>
        <button class="btn btn-small btn-primary" data-back>🎮 Retour au jeu</button>
      </div>
      <header class="cv-hero">
        <img class="cv-photo" src="${PROFILE.photos.proSquare}" alt="Portrait de Harena RAJAONA" width="480" height="480">
        <div>
          <p class="kicker">${esc(PROFILE.location)}</p>
          <h1>${esc(PROFILE.fullName)}</h1>
          <p class="cv-title">${esc(PROFILE.title)} · ${this.years} ans d'expérience</p>
          <p class="cv-bio">${esc(PROFILE.bio)}</p>
          <div class="links">${linkButtons()}</div>
        </div>
      </header>

      <section class="cv-section">
        <h2>Expériences</h2>
        <ol class="cv-timeline">
          ${exps
            .map(
              (e) => `<li style="--accent:${e.color}">
              <div class="cv-exp-head">
                <div><h3>${esc(e.role)} · ${esc(e.company)}</h3><p class="cv-meta">${esc(e.period)} · ${esc(e.duration)}</p></div>
                ${e.current ? '<span class="badge-now">Poste actuel</span>' : ''}
              </div>
              <p>${esc(e.summary)}</p>
              <ul>${e.missions.map((m) => `<li>${esc(m)}</li>`).join('')}</ul>
              <div class="chips">${chips(e.stack)}</div>
              ${e.repo ? `<a class="cv-repo" href="${esc(e.repo.url)}" target="_blank" rel="noopener">${ICONS.github} ${esc(e.repo.label)}</a>` : ''}
            </li>`,
            )
            .join('')}
        </ol>
      </section>

      <section class="cv-section">
        <h2>Compétences</h2>
        <div class="cv-skills">
          ${Object.entries(skillsByCat)
            .map(([cat, list]) => `<div class="cv-skill-cat"><h3>${esc(cat)}</h3><div class="chips">${chips(list)}</div></div>`)
            .join('')}
        </div>
      </section>

      <section class="cv-section">
        <h2>Projets</h2>
        <div class="cv-projects">
          ${PROJECTS.map(
            (p) => `<article class="cv-project" style="--accent:${p.color}">
              <p class="kicker">${esc(p.kind)}</p>
              <h3>${esc(p.name)}</h3>
              ${p.context ? `<p class="cv-meta">${esc(p.context)}</p>` : ''}
              <p>${esc(p.description)}</p>
              <div class="chips">${chips(p.stack)}</div>
              ${p.repo ? `<a href="${esc(p.repo)}" target="_blank" rel="noopener">${ICONS.github} Voir le dépôt</a>` : '<span class="private-note">🔒 Code source privé</span>'}
            </article>`,
          ).join('')}
        </div>
      </section>

      <section class="cv-section cv-two">
        <div>
          <h2>Langues</h2>
          <div class="lang-list">
            ${LANGUAGES.map(
              (l) => `<div class="lang"><div class="lang-top"><strong>${esc(l.name)}</strong><span>${esc(l.label)}</span></div><div class="bar"><span style="width:${l.level}%"></span></div></div>`,
            ).join('')}
          </div>
        </div>
        <div>
          <h2>Contact</h2>
          <ul class="cv-contact">
            <li><a href="mailto:${PROFILE.email}">${ICONS.email} ${esc(PROFILE.email)}</a></li>
            <li><a href="tel:${PROFILE.phone.replace(/\s/g, '')}">${ICONS.phone} ${esc(PROFILE.phone)}</a></li>
            <li>📍 ${esc(PROFILE.location)}</li>
          </ul>
        </div>
      </section>

      <section class="cv-section">
        <h2>Galerie</h2>
        <div class="cv-gallery">
          <img src="${PROFILE.photos.pro}" alt="Harena en blazer bleu" loading="lazy">
          <img src="${PROFILE.photos.night}" alt="Harena de nuit dans un jardin" loading="lazy">
          <img src="${PROFILE.photos.dark}" alt="Portrait de Harena sur fond noir" loading="lazy">
          <img src="${PROFILE.photos.teloiray}" alt="Harena en sweat rouge, photo TeloIray Media" loading="lazy">
        </div>
      </section>

      <footer class="cv-footer">
        <p>© ${new Date().getFullYear()} ${esc(PROFILE.firstName)} ${esc(PROFILE.lastName)} · Portfolio jouable fait main, sans framework.</p>
        <button class="btn btn-primary" data-back>🎮 Lancer le jeu</button>
      </footer>`;
    this.el.cv.querySelectorAll('[data-back]').forEach((b) => b.addEventListener('click', () => this.closeCV()));
  }

  openCV() {
    this.el.modal.hidden = true;
    this.el.cv.hidden = false;
    this.el.app.hidden = true;
    document.body.classList.add('cv-mode');
    this.game?.releaseAll();
    window.scrollTo(0, 0);
    if (location.hash !== '#cv') history.replaceState(null, '', '#cv');
  }

  closeCV() {
    this.el.cv.hidden = true;
    this.el.app.hidden = false;
    document.body.classList.remove('cv-mode');
    if (location.hash === '#cv') history.replaceState(null, '', location.pathname + location.search);
    this.game?.resize();
  }
}
