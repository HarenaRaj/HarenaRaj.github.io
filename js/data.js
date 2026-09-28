// ============================================================
//  Toutes les données du portfolio : modifier ici suffit,
//  le jeu ET le mode « CV classique » sont générés à partir de ce fichier.
// ============================================================

export const PROFILE = {
  firstName: 'Harena',
  lastName: 'RAJAONA',
  fullName: 'RAJAONA Harimisa Harenasoa',
  title: 'Développeur Senior .NET',
  careerStart: '2020-01-01',
  bio:
    "Développeur .NET depuis 2020, je conçois et maintiens des applications web, mobiles et microservices. " +
    "J'ai une bonne capacité d'analyse et d'adaptation, et je mets mes compétences au service de l'optimisation de chaque projet.",
  location: 'Antananarivo, Madagascar',
  email: 'harenasoarajaona@gmail.com',
  phone: '+261 32 70 061 80',
  cv: 'CV%20Harena.pdf',
  photos: {
    pro: 'assets/img/harena-pro.jpg',
    proSquare: 'assets/img/harena-pro-square.jpg',
    night: 'assets/img/harena-night.jpg',
    dark: 'assets/img/harena-dark.jpg',
    teloiray: 'assets/img/harena-teloiray.jpg',
    pixel: 'assets/img/harena-pixel.png',
  },
};

export const LINKS = [
  { id: 'linkedin', label: 'LinkedIn', url: 'https://linkedin.com/in/harena-rajaona-4210a4201', color: '#0A66C2' },
  { id: 'github', label: 'GitHub', url: 'https://github.com/HarenaRaj', color: '#6e7681' },
  { id: 'facebook', label: 'Facebook', url: 'https://facebook.com/harimisaharenasoa.rajaona', color: '#1877F2' },
  { id: 'email', label: 'E-mail', url: 'mailto:harenasoarajaona@gmail.com', color: '#a3263f' },
  { id: 'phone', label: 'Téléphone', url: 'tel:+261327006180', color: '#2fb574' },
];

// abbr : 3 caractères max (affiché dans le jeu en police pixel)
export const SKILLS = {
  csharp:      { name: 'C#',            abbr: 'C#',  color: '#9b4f96', cat: 'Langages' },
  dotnet:      { name: '.NET',          abbr: '.NT', color: '#512bd4', cat: 'Back-end' },
  git:         { name: 'Git',           abbr: 'GIT', color: '#f05032', cat: 'Outils' },
  sql:         { name: 'SQL',           abbr: 'SQL', color: '#cc2927', cat: 'Bases de données' },
  aspnet:      { name: 'ASP.NET Core',  abbr: 'ASP', color: '#6a3fc1', cat: 'Back-end' },
  mysql:       { name: 'MySQL',         abbr: 'MY',  color: '#00758f', cat: 'Bases de données' },
  firebase:    { name: 'Firebase',      abbr: 'FB',  color: '#f6a609', cat: 'Cloud', dark: true },
  reactnative: { name: 'React Native',  abbr: 'RN',  color: '#3fb6d8', cat: 'Mobile', dark: true },
  rest:        { name: 'API REST',      abbr: 'API', color: '#4f9d2d', cat: 'Back-end' },
  angular:     { name: 'Angular',       abbr: 'NG',  color: '#dd0031', cat: 'Front-end' },
  docker:      { name: 'Docker',        abbr: 'DKR', color: '#2496ed', cat: 'DevOps' },
  kubernetes:  { name: 'Kubernetes',    abbr: 'K8S', color: '#326ce5', cat: 'DevOps' },
  vue:         { name: 'Vue.js',        abbr: 'VUE', color: '#42b883', cat: 'Front-end' },
  kafka:       { name: 'Kafka',         abbr: 'KFK', color: '#3a3a3a', cat: 'Back-end' },
  postgres:    { name: 'PostgreSQL',    abbr: 'PG',  color: '#336791', cat: 'Bases de données' },
  elastic:     { name: 'Elasticsearch', abbr: 'ES',  color: '#00a39a', cat: 'Bases de données' },
  kibana:      { name: 'Kibana',        abbr: 'KB',  color: '#e8478b', cat: 'Outils' },
  signalr:     { name: 'SignalR',       abbr: 'SR',  color: '#0078d4', cat: 'Back-end' },
  sqlserver:   { name: 'SQL Server',    abbr: 'MSS', color: '#a91d22', cat: 'Bases de données' },
  oracle:      { name: 'Oracle',        abbr: 'ORA', color: '#e01b1b', cat: 'Bases de données' },
  azuredevops: { name: 'Azure DevOps',  abbr: 'AZ',  color: '#0a6fc2', cat: 'DevOps' },
  cpp:         { name: 'C++',           abbr: 'C++', color: '#00599c', cat: 'Langages' },
  react:       { name: 'React',         abbr: 'RE',  color: '#20a4c9', cat: 'Front-end', dark: true },
  javascript:  { name: 'JavaScript',    abbr: 'JS',  color: '#e8cf1c', cat: 'Langages', dark: true },
  php:         { name: 'PHP',           abbr: 'PHP', color: '#777bb4', cat: 'Langages' },
  symfony:     { name: 'Symfony',       abbr: 'SF',  color: '#1a1a1a', cat: 'Back-end' },
  arduino:     { name: 'Arduino',       abbr: 'INO', color: '#00979d', cat: 'Embarqué' },
  typescript:  { name: 'TypeScript',    abbr: 'TS',  color: '#3178c6', cat: 'Langages' },
  kotlin:      { name: 'Kotlin',        abbr: 'KT',  color: '#7f52ff', cat: 'Langages' },
  expo:        { name: 'Expo',          abbr: 'EXP', color: '#4a4a8a', cat: 'Mobile' },
  sqlite:      { name: 'SQLite',        abbr: 'SQ3', color: '#0f80cc', cat: 'Bases de données' },
  cloudflare:  { name: 'Cloudflare Workers', abbr: 'CF', color: '#f38020', cat: 'Cloud' },
};

// Ordre chronologique : c'est l'ordre des chapitres dans le jeu
export const EXPERIENCES = [
  {
    id: 'teloiray',
    company: 'TeloIray COMPANY',
    short: 'TeloIray',
    role: 'Développeur .NET',
    period: 'Janv. 2020 – Avr. 2021',
    duration: '1 an et 3 mois',
    year: 2020,
    color: '#c9485f',
    stack: ['ASP.NET Core', 'MySQL', 'Firebase', 'React Native', 'REST'],
    skills: ['aspnet', 'mysql', 'firebase', 'reactnative', 'rest'],
    summary:
      "Création d'une application mobile qui facilite les procédures lors d'une livraison de produit et automatise la comptabilité mensuelle des gains et des pertes.",
    missions: [
      'Conception de l’architecture du projet',
      'Création du module de chat et ajout d’un « Real-Time Notification » avec Firebase',
      'Développement de l’interface de gestion des utilisateurs',
      'Développement de l’application mobile avec React Native',
      'Déploiement et maintenance du serveur de données chez LWS',
      'Développement d’API consommées par l’application mobile',
    ],
  },
  {
    id: 'manao',
    company: 'MANAO Logiciel & IDEA Expertise',
    short: 'MANAO',
    role: 'Développeur .NET',
    period: 'Mai 2021 – Janv. 2022',
    duration: '8 mois',
    year: 2021,
    color: '#d98a3a',
    stack: ['ASP.NET Core', 'Angular', 'Docker', 'Kubernetes', 'MySQL', 'REST'],
    skills: ['angular', 'docker', 'kubernetes'],
    summary:
      "Création d'une application web qui facilite l'interaction entre les différents agents lors de la réparation d'une automobile.",
    missions: [
      'Ajout d’un chat de discussion entre agents pour faciliter la communication',
      'Génération du conteneur Docker et déploiement de chaque version de l’application avec Kubernetes',
      'Galerie de pièces jointes pour l’expertise à distance',
      'Nouvelle IHM pour la partie Assuré et Assurance et leurs interactions (demande de rendez-vous, demande de réparateur…) avec les autres agents',
    ],
  },
  {
    id: 'hairun',
    company: 'HaiRun Technology Madagascar',
    short: 'HaiRun',
    role: 'Développeur .NET',
    period: 'Févr. 2022 – Juin 2024',
    duration: 'Plus de 2 ans',
    year: 2022,
    color: '#3f9e74',
    stack: ['ASP.NET Core', 'Kafka', 'Vue.js', 'PostgreSQL', 'Elasticsearch', 'Kibana', 'REST', 'SignalR'],
    skills: ['vue', 'kafka', 'postgres', 'elastic', 'kibana', 'signalr'],
    summary:
      'Maintenance d’une application web basée sur une architecture microservices, assurant la communication en temps réel avec des robots de recyclage de bouteilles déployés dans des espaces publics.',
    missions: [
      'Ajout de l’envoi par mail des rapports de recyclage',
      'Modification de la base de données pour gérer plusieurs catégories d’intervention',
      'Suivi en temps réel de l’état de chaque machine, avec une statistique globale',
      'Ajout d’une configuration du prix par bouteille recyclée',
    ],
  },
  {
    id: 'astek',
    company: 'Astek Madagascar',
    short: 'Astek',
    role: 'Développeur Senior .NET',
    period: 'Depuis juin 2024',
    duration: 'Poste actuel',
    year: 2024,
    current: true,
    color: '#6f8fe0',
    stack: ['ASP.NET', 'Oracle', 'Vue.js', 'Azure DevOps', 'mRemoteNG', 'C++'],
    skills: ['oracle', 'azuredevops', 'cpp'],
    summary:
      'Maintenance d’une application web microservices pour la configuration d’équipements ferroviaires (TGV) : gestion des titres de transport, des réductions et des paramètres embarqués en temps réel.',
    missions: [
      'Installation des médias sur chaque plateforme',
      'Ajout des paramètres nécessaires au bon fonctionnement des appareils de contrôle',
      'Maintenance des packages d’import/export de données',
      'Maintenance de l’IHM de génération des paramètres',
      'Revue de code des collaborateurs',
    ],
  },
];

// kind : type de projet affiché dans la fiche · repo : null si le dépôt est privé
export const PROJECTS = [
  {
    id: 'harena',
    name: 'Harena · Suivi des dettes',
    short: 'HARENA',
    kind: 'Projet personnel',
    context: 'Conçu et développé seul · 2026 · version 2.1',
    color: '#199c55',
    screen: 'balance',
    stack: ['React Native', 'Expo', 'TypeScript', 'SQLite + Drizzle ORM', 'Firebase (Auth, Firestore, FCM)', 'Cloudflare Workers', 'Kotlin'],
    repo: null,
    description:
      'Application mobile pour suivre l’argent que l’on doit et qu’on nous doit, avec ses proches ou ses partenaires : soldes « à payer / à recevoir », remboursements partiels, transactions récurrentes, rappels, relevés de compte en PDF ou en image à partager, statistiques, reçus en pièce jointe et verrouillage biométrique. Fonctionne hors ligne (SQLite) et se synchronise avec Firestore, permet de partager une relation avec un autre utilisateur, confie les transactions récurrentes à un worker Cloudflare et propose deux widgets Android natifs écrits en Kotlin.',
  },
  {
    id: 'econergy',
    name: 'Econergy · Livraison de gaz',
    short: 'ECONERGY',
    kind: 'Projet professionnel',
    context: 'Application mobile · 2025 – 2026',
    color: '#2f7fd6',
    screen: 'gas',
    stack: ['React Native', 'Expo', 'TypeScript', 'NativeWind', 'Leaflet / OpenStreetMap', 'OpenRouteService', 'Imprimante Sunmi', 'API REST Laravel'],
    repo: null,
    description:
      'Application mobile de commande et de livraison de bouteilles de gaz à Madagascar, avec deux profils. Côté client : catalogue avec tarifs personnalisés, panier synchronisé, adresse de livraison sur carte et suivi des commandes par statut. Côté livreur : tournées, itinéraires, signature du client, encaissement (espèces, Mobile Money, paiements partiels) et impression du ticket de livraison sur l’imprimante thermique du terminal Android Sunmi P3. Connectée à l’API REST du back-office Laravel, développé par un autre développeur.',
  },
  {
    id: 'hiraina',
    name: 'Hiraina · Partitions de chorale',
    short: 'HIRAINA',
    kind: 'Projet professionnel',
    context: 'TeloIray COMPANY · pour la chorale STK – FJKM Anosipatrana · 2022, refonte 2026',
    color: '#c9485f',
    screen: 'music',
    stack: ['ASP.NET Core', 'Clean Architecture', 'Entity Framework', 'MySQL', 'JWT', 'React + TypeScript', 'MUI', 'React Native', 'SQLite', 'Docker'],
    repo: null,
    description:
      'Catalogue de partitions en solfa pour une chorale. Un back-office web en React importe les PDF par lots (titre, auteur, compositeur et tonalité lus dans le nom du fichier), gère auteurs et compositeurs et exporte le catalogue de façon incrémentale. L’application mobile React Native fonctionne hors ligne (SQLite) : lecture des partitions et des paroles, recherche par titre, auteur, tonalité ou étiquette, favoris, thèmes clair et sombre, interface en français et en malgache. API ASP.NET Core en Clean Architecture, développée en binôme.',
  },
  {
    id: 'ateroo',
    name: 'aTeroo Service',
    short: 'ATEROO',
    kind: 'Projet professionnel',
    context: 'Réalisé chez TeloIray COMPANY · 2020',
    color: '#2a9d8f',
    screen: 'delivery',
    stack: ['ASP.NET Core', 'Entity Framework', 'React Native', 'MySQL / SQL Server', 'SignalR', 'Firebase (FCM)', 'JWT', 'Docker'],
    repo: null, // dépôt privé
    description:
      'Solution de gestion de livraisons : une API ASP.NET Core (Entity Framework, authentification JWT, rôles super-admin / admin / livreur) et une application mobile React Native. Planification des livraisons par zone et par créneau, suivi des statuts, gestion des partenaires avec factures PDF, comptabilité des entrées et sorties avec bilan, chat en temps réel avec photos et notifications push Firebase.',
  },
  {
    id: 'hlight',
    name: 'HLight · DMX Controller',
    short: 'HLIGHT',
    kind: 'Projet GitHub',
    color: '#b44cff',
    screen: 'dmx',
    stack: ['C#', 'Windows Forms', 'Arduino', 'DMX512'],
    repo: 'https://github.com/HarenaRaj/DMX_controller',
    description:
      'Console d’éclairage scénique : une application Windows Forms en C# (univers, groupes, scènes, animations, contrôles personnalisés façon console lumière) pilote un Arduino « DMX master » via une liaison série à 250 000 bauds, sur 512 canaux DMX.',
  },
  {
    id: 'home',
    name: 'TeloIray Intelligente Home',
    short: 'HOME',
    kind: 'Projet GitHub',
    color: '#ff7a45',
    screen: 'home',
    stack: ['C++', 'Arduino', 'RF 433 MHz', 'Registre à décalage'],
    repo: 'https://github.com/HarenaRaj/TeloIray.Intelligente.Home',
    description:
      'Système d’alarme domotique sur Arduino : un tableau de bord gère des capteurs (fil et laser), des alarmes intérieure/extérieure et un buzzer via registre à décalage, le tout piloté par une télécommande sans fil 433 MHz à 4 boutons.',
  },
];

export const LANGUAGES = [
  { name: 'Malagasy', level: 90, label: 'Langue maternelle', hello: 'Salama !' },
  { name: 'Français', level: 82, label: 'Courant', hello: 'Bonjour !' },
  { name: 'Anglais', level: 58, label: 'Intermédiaire', hello: 'Hello!' },
];

// Compétences cachées dans les blocs « ? » de chaque zone
export const ZONE_SKILLS = {
  start: ['csharp', 'dotnet', 'git', 'sql'],
  projects: ['typescript', 'expo', 'sqlite', 'kotlin', 'cloudflare', 'javascript', 'react', 'sqlserver', 'php', 'symfony', 'arduino'],
};

// Messages quand on écrase un bug
export const BUG_JOKES = [
  'NullReferenceException écrasée !',
  'Deadlock résolu !',
  'Off-by-one corrigé !',
  'Race condition maîtrisée !',
  'Fuite mémoire colmatée !',
  'Timeout réglé !',
  'Merge conflict résolu !',
  'Requête N+1 optimisée !',
  'CSS cassé réparé !',
];

export function yearsOfExperience(now = new Date()) {
  const start = new Date(PROFILE.careerStart);
  return Math.floor((now - start) / (365.25 * 24 * 3600 * 1000));
}
