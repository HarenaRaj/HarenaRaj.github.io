import { Game } from './game.js';
import { UI } from './ui.js';
import { unlockAudio } from './audio.js';

const KEYMAP = {
  ArrowLeft: 'left',
  KeyA: 'left', // Q sur AZERTY
  ArrowRight: 'right',
  KeyD: 'right',
  ArrowUp: 'jump',
  KeyW: 'jump', // Z sur AZERTY
  Space: 'jump',
  KeyE: 'act',
  Enter: 'act',
};

async function boot() {
  try {
    await Promise.race([
      Promise.all([document.fonts.load('8px "Press Start 2P"'), document.fonts.load('20px "VT323"')]),
      new Promise((r) => setTimeout(r, 2500)),
    ]);
  } catch {
    /* on démarre quand même avec la police de secours */
  }

  const ui = new UI();
  const game = new Game(document.getElementById('game'), ui);
  ui.attach(game);
  game.start();
  window.__hq = game; // pratique pour déboguer depuis la console

  const startGame = () => {
    if (game.mode === 'play') return;
    unlockAudio();
    ui.hideTitle();
    game.play();
    ui.tutorial(game.isTouch);
    if (game.isTouch && game.portrait) ui.toast('Astuce : tourne ton téléphone en paysage 🔄', '#e8b04b');
  };

  document.getElementById('btn-play').addEventListener('click', startGame);
  document.getElementById('btn-cv-title').addEventListener('click', () => ui.openCV());

  // ---------- Clavier ----------
  window.addEventListener('keydown', (e) => {
    unlockAudio();
    if (ui.cvOpen) {
      if (e.key === 'Escape') ui.closeCV();
      return;
    }
    const onButton = e.target instanceof HTMLElement && e.target.closest('button, a');
    if (ui.titleOpen) {
      if ((e.key === 'Enter' || e.code === 'Space') && !onButton) {
        e.preventDefault();
        startGame();
      }
      return;
    }
    if (ui.endOpen) return;
    if (ui.modalOpen) {
      if (e.key === 'Escape' || (e.code === 'KeyE' && !e.repeat)) {
        e.preventDefault();
        ui.closeModal();
      }
      return;
    }
    if (ui.dialogOpen) {
      if (!e.repeat && ['Enter', 'NumpadEnter', 'Space', 'KeyE', 'Escape', 'ArrowUp'].includes(e.code)) {
        e.preventDefault();
        ui.advanceDialog();
      }
      return;
    }
    if (e.code === 'KeyI') return ui.openInventory();
    if (e.key === '?' || e.code === 'KeyH') return ui.openHelp();
    const action = KEYMAP[e.code];
    if (!action) return;
    if (onButton && (e.code === 'Enter' || e.code === 'Space')) return;
    e.preventDefault();
    if (e.repeat && (action === 'act' || action === 'jump')) return;
    game.press(action);
  });

  window.addEventListener('keyup', (e) => {
    const action = KEYMAP[e.code];
    if (action) game.release(action);
  });
  window.addEventListener('blur', () => game.releaseAll());
  document.addEventListener('visibilitychange', () => game.releaseAll());

  // ---------- Commandes tactiles ----------
  document.querySelectorAll('#touch [data-act]').forEach((btn) => {
    const act = btn.dataset.act;
    const down = (e) => {
      e.preventDefault();
      unlockAudio();
      btn.setPointerCapture?.(e.pointerId);
      btn.classList.add('on');
      if (ui.dialogOpen && (act === 'act' || act === 'jump')) return ui.advanceDialog();
      game.press(act);
    };
    const up = () => {
      btn.classList.remove('on');
      game.release(act);
    };
    btn.addEventListener('pointerdown', down);
    btn.addEventListener('pointerup', up);
    btn.addEventListener('pointercancel', up);
    btn.addEventListener('lostpointercapture', up);
    btn.addEventListener('contextmenu', (e) => e.preventDefault());
  });

  if (location.hash === '#cv') ui.openCV();
  window.addEventListener('hashchange', () => {
    if (location.hash === '#cv') ui.openCV();
    else if (ui.cvOpen) ui.closeCV();
  });
}

boot();
