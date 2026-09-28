# Harena Quest · Portfolio jouable

Portfolio de **Harena RAJAONA**, Développeur Senior .NET (Antananarivo), sous forme de jeu de plateforme pixel art :
chaque expérience est un chapitre, les compétences se débloquent dans des blocs « ? », les bugs s'écrasent en sautant dessus,
et le parcours se termine au portail de contact. Un **mode CV classique** (bouton `CV`, ou l'URL `/#cv`) affiche tout le contenu
de façon lisible pour les recruteurs pressés.

HTML, CSS et JavaScript natifs (modules ES), sans framework ni étape de build.

## Structure

| Fichier | Rôle |
| --- | --- |
| `js/data.js` | **Tout le contenu** : profil, liens, expériences, projets, compétences, langues. Le jeu et le mode CV sont générés à partir de ce fichier. |
| `js/world.js` | Construction du niveau (un chapitre par expérience, arcade des projets, village des langues, portail). |
| `js/game.js` | Moteur : boucle, physique, caméra, rendu canvas. |
| `js/sprites.js` | Pixel art dessiné en code (héros, Maki le lémurien, baobabs, bâtiments, bornes d'arcade…). |
| `js/ui.js` | HUD, dialogues, fiches, inventaire, écran de fin, mode CV. |
| `js/audio.js` | Effets sonores 8-bit (WebAudio). |
| `assets/img/` | Photos optimisées pour le web, portrait pixel, favicon, image de partage. |

Pour ajouter une expérience : ajouter un objet dans `EXPERIENCES` (`js/data.js`). Le bâtiment, les blocs de compétences et le chapitre de la frise sont créés automatiquement.

## Lancer en local

Les modules ES doivent être servis en HTTP :

```bash
python -m http.server 8000
# puis ouvrir http://localhost:8000
```

## Déploiement sur Vercel

1. Importer le dépôt sur [vercel.com/new](https://vercel.com/new).
2. Framework preset : **Other**. Pas de commande de build, dossier de sortie : racine.
3. Déployer.

`vercel.json` configure le cache des ressources, et `.vercelignore` exclut les photos originales (plusieurs Mo) du déploiement.
