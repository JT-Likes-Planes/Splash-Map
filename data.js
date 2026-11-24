const CATS = [
  { id: 'all',   name: 'All',    ico: '🌊', c: '#00e5d0' },
  { id: 'manu',  name: 'Manu',   ico: '💣', c: '#00e5d0' },
  { id: 'cliff', name: 'Cliff',  ico: '🪨', c: '#ffc233' },
  { id: 'swim',  name: 'Swim',   ico: '🏊', c: '#2ec5ff' },
  { id: 'swing', name: 'Swing',  ico: '🪢', c: '#7dff8b' },
  { id: 'pier',  name: 'Wharf',  ico: '⚓', c: '#ff7eb6' }
];

const STYLES = ['Manu 💣', 'Cannonball 💥', 'Dive 🐬', 'Backflip 🤸', 'Swim 🏊'];

const HAZARDS_LIST = [
  'Check tide / depth first',
  'Submerged rocks',
  'Boat traffic',
  'Strong current / rip',
  'Slippery ledge'
];

const SEED_SPOTS = [
  {
    id: 's1', name: 'Raglan Wharf', cat: 'manu', lat: -37.7985, lng: 174.8726,
    height: 4.5, depth: 5.0, rating: 4.9, votes: 42,
    desc: 'Classic West Coast manu spot off the main wharf. Best 2 hours either side of high tide.',
    tags: ['High tide best', 'Ladder exit', 'Deep channel'],
    hazards: ['Boat traffic', 'Check tide / depth first'],
    comments: [
      { by: 'Tane', txt: 'Massive splashes at high tide today!', ts: Date.now() - 86400000 }
    ]
  },
  {
    id: 's2', name: 'Taupō Hole in One', cat: 'pier', lat: -38.6897, lng: 176.0686,
    height: 3.0, depth: 6.0, rating: 4.7, votes: 31,
    desc: 'Crystal-clear freshwater boardwalks along Lake Taupō. Super easy swim-out.',
    tags: ['Freshwater', 'Family friendly', 'Always deep'],
    hazards: ['Boat traffic'],
    comments: []
  },
  {
    id: 's3', name: 'Maunganui Jump Rock', cat: 'cliff', lat: -37.6309, lng: 176.1715,
    height: 8.5, depth: 7.0, rating: 4.8, votes: 54,
    desc: 'Clean basalt launch ledge tucked near Leisure Island. Scope the swell before dropping.',
    tags: ['Clear water', 'Clean landing', '8m+ drop'],
    hazards: ['Submerged rocks', 'Strong current / rip', 'Slippery ledge'],
    comments: []
  },
  {
    id: 's4', name: 'Waitematā Devonport Wharf', cat: 'manu', lat: -36.8327, lng: 174.7959,
    height: 5.0, depth: 6.5, rating: 4.6, votes: 27,
    desc: 'City skyline backdrop with wide timber planks for synced crew manus.',
    tags: ['Skyline view', 'Wide platform', 'Easy ladder'],
    hazards: ['Boat traffic'],
    comments: []
  },
  {
    id: 's5', name: 'Kai Iwi Rope Swing', cat: 'swing', lat: -35.8021, lng: 173.6531,
    height: 5.5, depth: 4.5, rating: 4.9, votes: 38,
    desc: 'Turquoise dune lake swing shaded by pōhutukawa. Calm warm water.',
    tags: ['Freshwater', 'No swell', 'Rope swing'],
    hazards: ['Slippery ledge'],
    comments: []
  },
  {
    id: 's6', name: 'Mermaid Pools Matapōuri', cat: 'swim', lat: -35.5653, lng: 174.5131,
    height: 2.0, depth: 3.5, rating: 4.5, votes: 19,
    desc: 'Sheltered tidal basin great for chill swims and low-tide snorkels.',
    tags: ['Tidal pool', 'Snorkel', 'Scenic'],
    hazards: ['Check tide / depth first', 'Submerged rocks'],
    comments: []
  }
];

const SEED_FEED = [
  {
    id: 'f1', who: 'Tane K.', av: '🦈', spotId: 's1', spot: 'Raglan Wharf',
    style: 'Manu 💣', height: 4.5, count: 6, stokes: 18, stoked: false,
    note: 'Cleanest pop of the summer at high tide. Water was glassy!',
    ts: Date.now() - 3600000 * 3
  },
  {
    id: 'f2', who: 'Aroha M.', av: '🐬', spotId: 's3', spot: 'Maunganui Jump Rock',
    style: 'Backflip 🤸', height: 8.5, count: 3, stokes: 24, stoked: false,
    note: 'Zero swell on the eastern edge. Stoked to land the layout.',
    ts: Date.now() - 3600000 * 11
  },
  {
    id: 'f3', who: 'Liam W.', av: '🐙', spotId: 's5', spot: 'Kai Iwi Rope Swing',
    style: 'Cannonball 💥', height: 5.5, count: 9, stokes: 12, stoked: false,
    note: 'Warm lake water and zero wind. Full crew session!',
    ts: Date.now() - 86400000
  }
];

const SEED_RANKS = [
  { name: 'Tane K.', av: '🦈', jumps: 84, xp: 1420 },
  { name: 'Aroha M.', av: '🐬', jumps: 71, xp: 1180 },
  { name: 'Liam W.', av: '🐙', jumps: 56, xp: 940 },
  { name: 'Maya R.', av: '🦭', jumps: 39, xp: 680 }
];

const BADGES = [
  { id: 'b1', ico: '💦', name: 'First Splash', check: u => u.jumps >= 1 },
  { id: 'b2', ico: '💣', name: 'Manu Streak',  check: u => u.jumps >= 10 },
  { id: 'b3', ico: '🪨', name: 'Cliff Send',   check: u => u.maxH >= 7 },
  { id: 'b4', ico: '📍', name: 'Scout',        check: u => u.added >= 1 },
  { id: 'b5', ico: '❤️', name: 'Spot Saver',   check: u => u.favs >= 3 },
  { id: 'b6', ico: '👑', name: 'Water Boss',   check: u => u.xp >= 500 }
];
