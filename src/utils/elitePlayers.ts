import type { Player, Agent } from '../types/types';

// Top 10 players from Valorant Champions 2025 based on VLR.gg stats
// These are manually curated with realistic stats and agent pools

export const ELITE_PLAYERS: Omit<Player, 'teamId'>[] = [
  {
    id: 'aspas',
    name: 'aspas',
    age: 21,
    region: 'Americas',
    role: 'Duelist',
    preferredRole: 'Duelist',
    stats: {
      mechanics: 98,      // Elite aim, topped K/D at Champions
      igl: 65,            // Not a caller
      mental: 92,         // Clutch performer under pressure
      clutch: 95,         // Insane 1vX ability
      vibes: 85,          // Team morale booster
      lurking: 88,        // Strong lurk player
      entry: 97,          // Aggressive entry fragger
      support: 70,        // Focused on frags
      stamina: 94,        // Consistent performance
    },
    agentPool: {
      'Jett': 98,
      'Raze': 95,
      'Neon': 90,
      'Reyna': 92,
      'KAY/O': 75,       // Flex pick
    } as Partial<Record<Agent, number>>,
    synergies: [],
    mapProficiency: {},
  },
  
  {
    id: 'kaajak',
    name: 'kaajak',
    age: 19,
    region: 'EMEA',
    role: 'Duelist',
    preferredRole: 'Duelist',
    stats: {
      mechanics: 96,
      igl: 68,
      mental: 90,
      clutch: 88,
      vibes: 82,
      lurking: 85,
      entry: 96,         // 62% FBSR at Champions
      support: 72,
      stamina: 91,
    },
    agentPool: {
      'Jett': 97,
      'Raze': 94,
      'Neon': 88,
      'Yoru': 80,
    } as Partial<Record<Agent, number>>,
    synergies: [],
    mapProficiency: {},
  },

  {
    id: 'alfajer',
    name: 'Alfajer',
    age: 20,
    region: 'EMEA',
    role: 'Sentinel',
    preferredRole: 'Sentinel',
    stats: {
      mechanics: 95,
      igl: 78,
      mental: 93,
      clutch: 94,         // Elite clutch player
      vibes: 88,
      lurking: 90,        // Strong lurker
      entry: 75,
      support: 85,
      stamina: 92,
    },
    agentPool: {
      'Cypher': 96,
      'Killjoy': 95,
      'Sage': 88,
      'Chamber': 90,
      'Raze': 85,        // Flex duelist
    } as Partial<Record<Agent, number>>,
    synergies: [],
    mapProficiency: {},
  },

  {
    id: 'cortezia',
    name: 'cortezia',
    age: 22,
    region: 'Americas',
    role: 'Initiator',
    preferredRole: 'Initiator',
    stats: {
      mechanics: 92,     // Top 5 K/D at Champions
      igl: 82,
      mental: 88,
      clutch: 85,
      vibes: 86,
      lurking: 80,
      entry: 85,
      support: 94,       // Excellent util usage
      stamina: 89,
    },
    agentPool: {
      'Sova': 95,
      'Fade': 92,
      'Gekko': 88,
      'KAY/O': 90,
      'Breach': 85,
    } as Partial<Record<Agent, number>>,
    synergies: [],
    mapProficiency: {},
  },

  {
    id: 'verno',
    name: 'Verno',
    age: 18,
    region: 'Americas',
    role: 'Initiator',
    preferredRole: 'Initiator',
    stats: {
      mechanics: 94,
      igl: 75,
      mental: 85,        // Young player, still developing
      clutch: 88,
      vibes: 90,         // High energy player
      lurking: 82,
      entry: 88,
      support: 92,
      stamina: 87,
    },
    agentPool: {
      'Gekko': 94,
      'Fade': 90,
      'Sova': 88,
      'Breach': 85,
    } as Partial<Record<Agent, number>>,
    synergies: [],
    mapProficiency: {},
  },

  {
    id: 'mako',
    name: 'MaKo',
    age: 23,
    region: 'Pacific',
    role: 'Controller',
    preferredRole: 'Controller',
    stats: {
      mechanics: 91,
      igl: 88,           // Smart caller
      mental: 95,        // Ice cold under pressure
      clutch: 92,
      vibes: 87,
      lurking: 85,
      entry: 70,
      support: 97,       // Best smoke player utility
      stamina: 93,
    },
    agentPool: {
      'Omen': 98,
      'Astra': 96,
      'Viper': 94,
      'Brimstone': 90,
      'Harbor': 88,
    } as Partial<Record<Agent, number>>,
    synergies: [],
    mapProficiency: {},
  },

  {
    id: 'less',
    name: 'Less',
    age: 21,
    region: 'Americas',
    role: 'Sentinel',
    preferredRole: 'Sentinel',
    stats: {
      mechanics: 94,
      igl: 80,
      mental: 94,
      clutch: 96,        // One of best clutch players
      vibes: 85,
      lurking: 93,       // Elite lurker
      entry: 75,
      support: 90,
      stamina: 92,
    },
    agentPool: {
      'Viper': 97,
      'Killjoy': 94,
      'Cypher': 92,
      'Chamber': 88,
    } as Partial<Record<Agent, number>>,
    synergies: [],
    mapProficiency: {},
  },

  {
    id: 't3xture',
    name: 't3xture',
    age: 21,
    region: 'Pacific',
    role: 'Duelist',
    preferredRole: 'Duelist',
    stats: {
      mechanics: 97,
      igl: 70,
      mental: 90,
      clutch: 91,
      vibes: 88,
      lurking: 87,
      entry: 95,
      support: 74,
      stamina: 93,
    },
    agentPool: {
      'Jett': 96,
      'Raze': 93,
      'Neon': 91,
      'Yoru': 85,
    } as Partial<Record<Agent, number>>,
    synergies: [],
    mapProficiency: {},
  },

  {
    id: 'chronicle',
    name: 'Chronicle',
    age: 24,
    region: 'EMEA',
    role: 'Flex',
    preferredRole: 'Flex',
    stats: {
      mechanics: 93,
      igl: 90,           // 3x champion, high game IQ
      mental: 96,        // Championship experience
      clutch: 92,
      vibes: 91,
      lurking: 88,
      entry: 82,
      support: 94,
      stamina: 95,       // Consistent across years
    },
    agentPool: {
      'Viper': 94,
      'Cypher': 92,
      'Fade': 90,
      'Sage': 91,
      'Brimstone': 88,
      'Breach': 87,
      'KAY/O': 89,
    } as Partial<Record<Agent, number>>,
    synergies: [],
    mapProficiency: {},
  },

  {
    id: 'johnqt',
    name: 'johnqt',
    age: 23,
    region: 'Americas',
    role: 'Sentinel',
    preferredRole: 'Sentinel',
    stats: {
      mechanics: 88,
      igl: 97,           // Elite IGL, Masters winner
      mental: 95,        // Calm under pressure
      clutch: 90,
      vibes: 92,         // Great teammate
      lurking: 85,
      entry: 70,
      support: 93,
      stamina: 91,
    },
    agentPool: {
      'Cypher': 92,
      'Sage': 90,
      'Killjoy': 88,
      'Viper': 86,
    } as Partial<Record<Agent, number>>,
    synergies: [],
    mapProficiency: {},
  },
];

// Helper to get elite player by name
export function getElitePlayer(name: string): Omit<Player, 'teamId'> | undefined {
  return ELITE_PLAYERS.find(p => p.name.toLowerCase() === name.toLowerCase());
}