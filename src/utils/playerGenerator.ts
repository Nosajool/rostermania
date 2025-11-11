import type { Player, PlayerStats, Role, Agent, Region } from '../types/types';

// Helper to generate random number within range
function randomInRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Generate stats based on role and tier
export function generatePlayerStats(role: Role, tier: 'S' | 'A' | 'B' | 'C'): PlayerStats {
  // Base stats by tier
  const tierBases = {
    S: { min: 75, max: 95 },  // Elite players
    A: { min: 65, max: 85 },  // Good players
    B: { min: 55, max: 75 },  // Average players
    C: { min: 45, max: 65 },  // Below average players
  };

  const base = tierBases[tier];

  // Role-specific stat modifiers
  const roleModifiers: Record<Role, Partial<Record<keyof PlayerStats, number>>> = {
    Duelist: {
      mechanics: 10,
      entry: 15,
      lurking: 5,
      clutch: 5,
    },
    Initiator: {
      igl: 10,
      support: 15,
      vibes: 5,
    },
    Controller: {
      igl: 15,
      support: 10,
      mental: 5,
    },
    Sentinel: {
      clutch: 10,
      mental: 10,
      support: 5,
    },
    Flex: {
      // Balanced, no major modifiers
    },
  };

  const modifiers = roleModifiers[role] || {};

  return {
    mechanics: Math.min(100, randomInRange(base.min, base.max) + (modifiers.mechanics || 0)),
    igl: Math.min(100, randomInRange(base.min, base.max) + (modifiers.igl || 0)),
    mental: Math.min(100, randomInRange(base.min, base.max) + (modifiers.mental || 0)),
    clutch: Math.min(100, randomInRange(base.min, base.max) + (modifiers.clutch || 0)),
    vibes: Math.min(100, randomInRange(base.min, base.max) + (modifiers.vibes || 0)),
    lurking: Math.min(100, randomInRange(base.min, base.max) + (modifiers.lurking || 0)),
    entry: Math.min(100, randomInRange(base.min, base.max) + (modifiers.entry || 0)),
    support: Math.min(100, randomInRange(base.min, base.max) + (modifiers.support || 0)),
    stamina: randomInRange(base.min, base.max),
  };
}

// Generate agent pool based on role
export function generateAgentPool(role: Role, tier: 'S' | 'A' | 'B' | 'C'): Partial<Record<Agent, number>> {
  const agentPool: Partial<Record<Agent, number>> = {};

  // Define agents by role
  const roleAgents: Record<Role, Agent[]> = {
    Duelist: ['Jett', 'Raze', 'Neon', 'Yoru', 'Phoenix', 'Reyna', 'Iso'],
    Controller: ['Omen', 'Astra', 'Viper', 'Brimstone', 'Harbor', 'Clove'],
    Initiator: ['Sova', 'Fade', 'Gekko', 'Breach', 'Skye', 'KAY/O', 'Tejo'],
    Sentinel: ['Cypher', 'Killjoy', 'Chamber', 'Sage', 'Deadlock', 'Vyse'],
    Flex: [...([] as Agent[])], // Will get agents from multiple roles
  };

  const primaryAgents = roleAgents[role];

  if (role === 'Flex') {
    // Flex players can play agents from 2-3 roles
    const roles: Role[] = ['Duelist', 'Initiator', 'Controller', 'Sentinel'];
    const numRoles = randomInRange(2, 3);
    const selectedRoles = roles.sort(() => Math.random() - 0.5).slice(0, numRoles);
    
    selectedRoles.forEach(r => {
      const agents = roleAgents[r];
      const numAgents = randomInRange(2, 4);
      const selectedAgents = agents.sort(() => Math.random() - 0.5).slice(0, numAgents);
      
      selectedAgents.forEach((agent, index) => {
        // Best proficiency on first agent, decreasing for others
        const proficiency = index === 0 
          ? randomInRange(70, 90) 
          : randomInRange(50, 75);
        agentPool[agent] = proficiency;
      });
    });
  } else {
    // Regular role: pick 2-5 agents from their role
    const numAgents = tier === 'S' || tier === 'A' ? randomInRange(3, 5) : randomInRange(2, 4);
    const selectedAgents = primaryAgents.sort(() => Math.random() - 0.5).slice(0, numAgents);

    selectedAgents.forEach((agent, index) => {
      // Main agent gets highest proficiency
      const baseProficiency = tier === 'S' ? randomInRange(80, 95) :
                              tier === 'A' ? randomInRange(70, 85) :
                              tier === 'B' ? randomInRange(60, 75) :
                              randomInRange(50, 65);
      
      // First agent is their best, others are slightly lower
      const proficiency = index === 0 ? baseProficiency : baseProficiency - randomInRange(5, 15);
      agentPool[agent] = Math.max(50, proficiency);
    });
  }

  return agentPool;
}

// Generate a complete player
export function generatePlayer(
  name: string,
  role: Role,
  region: Region,
  tier: 'S' | 'A' | 'B' | 'C',
  age?: number
): Omit<Player, 'teamId'> {
  return {
    id: name.toLowerCase().replace(/\s+/g, '-'),
    name,
    age: age || randomInRange(18, 28),
    region,
    role,
    preferredRole: role,
    stats: generatePlayerStats(role, tier),
    agentPool: generateAgentPool(role, tier),
    synergies: [], // Will be populated later
    mapProficiency: {}, // Can be populated based on team practice
  };
}

// Determine tier based on team reputation
export function getTeamTier(teamName: string): 'S' | 'A' | 'B' | 'C' {
  const sTierTeams = ['Sentinels', 'Gen.G', 'Team Heretics', 'Fnatic', 'G2 Esports', 'Paper Rex', 'Team Vitality', 'EDward Gaming'];
  const aTierTeams = ['NRG', '100 Thieves', 'Leviatán', 'DRX', 'T1', 'Team Liquid', 'NAVI', 'Karmine Corp'];
  
  if (sTierTeams.includes(teamName)) return 'S';
  if (aTierTeams.includes(teamName)) return 'A';
  
  // Random between B and C for other teams
  return Math.random() > 0.5 ? 'B' : 'C';
}

// Example: Create a specific player with custom stats (like johnqt from VLR)
export function createCustomPlayer(
  name: string,
  role: Role,
  region: Region,
  stats: Partial<PlayerStats>,
  agentPool: Partial<Record<Agent, number>>,
  age: number
): Omit<Player, 'teamId'> {
  const defaultStats = generatePlayerStats(role, 'S');
  
  return {
    id: name.toLowerCase().replace(/\s+/g, '-'),
    name,
    age,
    region,
    role,
    preferredRole: role,
    stats: { ...defaultStats, ...stats },
    agentPool,
    synergies: [],
    mapProficiency: {},
  };
}

// Example usage:
// const johnqt = createCustomPlayer(
//   'johnqt',
//   'Sentinel',
//   'Americas',
//   { igl: 95, clutch: 88, mental: 92 },
//   { 'Cypher': 85, 'Sage': 78, 'Killjoy': 82, 'Viper': 75 },
//   23
// );