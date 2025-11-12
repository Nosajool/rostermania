import type { Player, Region, Role } from '../types/types';
import { generatePlayer } from './playerGenerator';

// Tier 2 team names by region (from Ascension tournaments)
const TIER2_TEAMS = {
  Americas: ['TSM', 'ENVY', 'Team Solid', 'Winthrop University', '9z Team', 'Six Karma'],
  EMEA: ['Mandatory', 'Enterprise', 'ULF Esports', 'BBL PCIFIC', 'Joblife', 'Fire Flux'],
  Pacific: ['BOOM Esports', 'NAOS', 'Velocity Gaming', 'RIDDLE', 'FULL Sense', 'E-KING'],
  China: ['Rare Atom', 'Bilibili Gaming', 'Attacking Soul', 'Nova Esports']
};

// Real player names from Tier 2/Ascension
const TIER2_PLAYER_NAMES = {
  Americas: [
    'gMd', 'seven', 'alvinboy', 'vora', 'Timotino', // TSM
    'YaBoiDre', 'ethos', 'jakee', 'brawk', 'Verno', // ENVY  
    'mitch', 'bjor', 'XXiF', 'Reduxx', 'koalanoob', // Various
    'nismo', 'Thief', 'Genghsta', 'NaturE', 'Zander',
    'dapr', 'corey', 'Wedid', 'mada', 'penny'
  ],
  EMEA: [
    'soulcas', 'AvovA', 'MOLSI', 'NiKo', 'Click', // Apeks players
    'Rosé', 'Crewen', 'Loita', 'Lar0k', 'echo', // BBL PCIFIC
    'Alive', 'Minny', 'hoody', 'Avez', 'Destrian',
    'nekky', 's0pp', 'audaz', 'Favian', 'Kai',
    'Cender', 'Logan', 'Sociable', 'ALIVE', 'Kadavra'
  ],
  Pacific: [
    'Monyet', 'Jemkin', 'fl1pzjder', 'Estrella', 'Lmemore', // RRQ/BOOM
    'JoxJo', 'Retla', 'Esperanza', 'eKo', 'Izu', // Nongshim
    'BeYN', 'Persia', 'Seoldam', 'Bangnan', 'iNTRO', // SLT
    'Whitecat', 'Lightningfast', 'Bazzi', 'Excali', 'SkRossi',
    'invy', 'DubsteP', 'Wild0reoo', 'JessieVash', 'Jremy'
  ],
  China: [
    'Nobody', 'CHICHOO', 'KangKang', 'Smoggy', 'S1Mon',
    'Haodong', 'Life', 'Yuicaw', 'yoman', 'AAAAY',
    'AfteR', 'Ninebody', 'Evo', 'Shion', 'autumn'
  ]
};

// Generate a pool of free agents from Tier 2
export function generateTier2FreeAgents(region: Region, count: number = 50): Player[] {
  const freeAgents: Player[] = [];
  const playerNames = TIER2_PLAYER_NAMES[region];
  const usedNames = new Set<string>();

  for (let i = 0; i < count; i++) {
    // Pick a random name that hasn't been used
    let name: string;
    do {
      name = playerNames[Math.floor(Math.random() * playerNames.length)];
    } while (usedNames.has(name) && usedNames.size < playerNames.length);
    
    if (usedNames.has(name)) {
      // If we've used all names, add a number suffix
      name = `${name}${i}`;
    }
    usedNames.add(name);

    // Random role distribution
    const roles: Role[] = ['Duelist', 'Initiator', 'Controller', 'Sentinel', 'Flex'];
    const role = roles[Math.floor(Math.random() * roles.length)];

    // Tier 2 players are B/C tier with occasional A tier prospects
    const tiers: ('A' | 'B' | 'C')[] = ['B', 'B', 'B', 'C', 'C', 'A'];
    const tier = tiers[Math.floor(Math.random() * tiers.length)];

    // Generate the player
    const player = generatePlayer(name, role, region, tier, randomAge(18, 24));

    // Add contract info (all free agents have no contract)
    player.contract = undefined;
    player.teamId = undefined;

    freeAgents.push(player);
  }

  // Sort by overall rating (best players first)
  return freeAgents.sort((a, b) => {
    const aOverall = Object.values(a.stats).reduce((sum, val) => sum + val, 0) / 9;
    const bOverall = Object.values(b.stats).reduce((sum, val) => sum + val, 0) / 9;
    return bOverall - aOverall;
  });
}

function randomAge(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Get suggested free agents based on team needs
export function getSuggestedFreeAgents(
  currentRoster: Player[],
  freeAgents: Player[],
  maxSuggestions: number = 5
): Player[] {
  // Analyze roster weaknesses
  const roleCount: Record<Role, number> = {
    Duelist: 0,
    Initiator: 0,
    Controller: 0,
    Sentinel: 0,
    Flex: 0
  };

  currentRoster.forEach(player => {
    roleCount[player.role]++;
  });

  // Find roles that need improvement
  const neededRoles: Role[] = [];
  (['Duelist', 'Initiator', 'Controller', 'Sentinel'] as Role[]).forEach(role => {
    if (roleCount[role] === 0) {
      neededRoles.push(role, role); // Double weight for missing roles
    } else if (roleCount[role] === 1) {
      neededRoles.push(role); // Single weight for underrepresented roles
    }
  });

  // Filter free agents by needed roles and get best ones
  const suggested = freeAgents
    .filter(fa => neededRoles.includes(fa.role))
    .slice(0, maxSuggestions);

  // If not enough suggestions, add top rated players regardless of role
  if (suggested.length < maxSuggestions) {
    const remaining = freeAgents
      .filter(fa => !suggested.includes(fa))
      .slice(0, maxSuggestions - suggested.length);
    suggested.push(...remaining);
  }

  return suggested;
}