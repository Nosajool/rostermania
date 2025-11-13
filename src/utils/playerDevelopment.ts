import type { Player, PlayerStats } from '../types/types';
import { calculateOverallRating } from './contractUtils';

// Age curves - peak performance ages
const PEAK_AGE_START = 22;
const PEAK_AGE_END = 26;
const DECLINE_AGE_START = 28;

// Calculate potential based on current stats and age
export function calculatePotential(player: Player): number {
  const currentOverall = calculateOverallRating(player);
  
  // Young players have higher potential
  if (player.age <= 20) {
    return Math.min(100, currentOverall + Math.random() * 20 + 10);
  } else if (player.age <= 23) {
    return Math.min(100, currentOverall + Math.random() * 15 + 5);
  } else if (player.age <= 26) {
    return Math.min(100, currentOverall + Math.random() * 8);
  } else {
    return currentOverall; // Veterans at their peak
  }
}

// Development rate based on age
export function getDevelopmentRate(age: number): number {
  if (age <= 20) return 1.5;  // Young players develop fast
  if (age <= 23) return 1.2;
  if (age <= 26) return 0.8;
  if (age <= 28) return 0.5;
  return 0.2; // Veterans develop slowly
}

// Apply age-based stat changes (yearly)
export function applyAgeProgression(player: Player): Player {
  const newAge = player.age + 1;
  let updatedStats = { ...player.stats };
  
  // Young players (18-21): Rapid improvement
  if (player.age < PEAK_AGE_START) {
    const growthRate = player.morale >= 70 ? 1.5 : 1.0;
    updatedStats = improveStats(updatedStats, player.potential, growthRate);
  }
  
  // Prime years (22-26): Slight improvement or maintenance
  else if (player.age >= PEAK_AGE_START && player.age < DECLINE_AGE_START) {
    const currentOverall = calculateOverallRating(player);
    if (currentOverall < player.potential) {
      updatedStats = improveStats(updatedStats, player.potential, 0.5);
    }
  }
  
  // Decline years (28+): Gradual decline
  else if (player.age >= DECLINE_AGE_START) {
    updatedStats = declineStats(updatedStats, player.age);
  }
  
  return {
    ...player,
    age: newAge,
    stats: updatedStats,
  };
}

// Improve stats toward potential
function improveStats(stats: PlayerStats, potential: number, growthRate: number): PlayerStats {
  const improved: PlayerStats = { ...stats };
  const statsKeys = Object.keys(stats) as (keyof PlayerStats)[];
  
  statsKeys.forEach(key => {
    const currentValue = stats[key];
    const maxValue = Math.min(100, potential);
    
    if (currentValue < maxValue) {
      // Random growth between 0-3 points, scaled by growth rate
      const growth = Math.floor(Math.random() * 3 * growthRate);
      improved[key] = Math.min(maxValue, currentValue + growth);
    }
  });
  
  return improved;
}

// Apply age-related decline
function declineStats(stats: PlayerStats, age: number): PlayerStats {
  const declined: PlayerStats = { ...stats };
  
  // Decline rate increases with age
  const declineRate = (age - DECLINE_AGE_START + 1) * 0.3;
  
  // Physical stats decline faster
  const physicalStats: (keyof PlayerStats)[] = ['mechanics', 'stamina', 'entry'];
  const mentalStats: (keyof PlayerStats)[] = ['igl', 'mental', 'clutch'];
  
  physicalStats.forEach(key => {
    const decline = Math.floor(Math.random() * 2 * declineRate);
    declined[key] = Math.max(40, stats[key] - decline);
  });
  
  // Mental stats decline slower
  mentalStats.forEach(key => {
    const decline = Math.floor(Math.random() * declineRate);
    declined[key] = Math.max(40, stats[key] - decline);
  });
  
  return declined;
}

// Training focus types
export type TrainingFocus = 
  | 'aim' 
  | 'strategy' 
  | 'teamwork' 
  | 'mentality' 
  | 'agents'
  | 'balanced';

// Apply weekly training
export function applyTraining(player: Player, focus: TrainingFocus): Player {
  let updatedStats = { ...player.stats };
  const trainingEfficiency = (player.morale / 100) * getDevelopmentRate(player.age);
  
  switch (focus) {
    case 'aim':
      updatedStats = trainSpecificStats(updatedStats, ['mechanics', 'entry'], trainingEfficiency, player.potential);
      break;
    case 'strategy':
      updatedStats = trainSpecificStats(updatedStats, ['igl', 'support'], trainingEfficiency, player.potential);
      break;
    case 'teamwork':
      updatedStats = trainSpecificStats(updatedStats, ['vibes', 'support', 'clutch'], trainingEfficiency, player.potential);
      break;
    case 'mentality':
      updatedStats = trainSpecificStats(updatedStats, ['mental', 'clutch', 'stamina'], trainingEfficiency, player.potential);
      break;
    case 'agents':
      // Agent training improves agent pool proficiency
      return {
        ...player,
        agentPool: improveAgentPool(player.agentPool, trainingEfficiency),
      };
    case 'balanced':
      updatedStats = trainBalanced(updatedStats, trainingEfficiency, player.potential);
      break;
  }
  
  // Increase development progress
  const newDevelopment = Math.min(100, player.development + (trainingEfficiency * 2));
  
  return {
    ...player,
    stats: updatedStats,
    development: newDevelopment,
  };
}

// Train specific stats
function trainSpecificStats(
  stats: PlayerStats, 
  focusStats: (keyof PlayerStats)[], 
  efficiency: number,
  potential: number
): PlayerStats {
  const updated = { ...stats };
  
  focusStats.forEach(stat => {
    if (updated[stat] < potential) {
      // Small chance of improvement each week
      if (Math.random() < efficiency * 0.3) {
        updated[stat] = Math.min(potential, updated[stat] + 1);
      }
    }
  });
  
  return updated;
}

// Balanced training improves all stats slightly
function trainBalanced(stats: PlayerStats, efficiency: number, potential: number): PlayerStats {
  const updated = { ...stats };
  const statsKeys = Object.keys(stats) as (keyof PlayerStats)[];
  
  // Pick 2-3 random stats to improve
  const numStats = Math.floor(Math.random() * 2) + 2;
  const selectedStats = statsKeys.sort(() => Math.random() - 0.5).slice(0, numStats);
  
  selectedStats.forEach(stat => {
    if (updated[stat] < potential && Math.random() < efficiency * 0.2) {
      updated[stat] = Math.min(potential, updated[stat] + 1);
    }
  });
  
  return updated;
}

// Improve agent pool
function improveAgentPool(
  agentPool: Partial<Record<string, number>>, 
  efficiency: number
): Partial<Record<string, number>> {
  const updated = { ...agentPool };
  const agents = Object.keys(agentPool);
  
  // Pick 1-2 agents to improve
  const numAgents = Math.random() < 0.5 ? 1 : 2;
  const selectedAgents = agents.sort(() => Math.random() - 0.5).slice(0, numAgents);
  
  selectedAgents.forEach(agent => {
    const current = updated[agent] || 0;
    if (current < 95 && Math.random() < efficiency * 0.4) {
      updated[agent] = Math.min(95, current + 1);
    }
  });
  
  return updated;
}

// Update morale based on various factors
export function updateMorale(
  player: Player, 
  factors: {
    wins?: number;           // Recent wins boost morale
    losses?: number;         // Recent losses decrease morale
    playingTime?: boolean;   // Active players have better morale
    contractSituation?: 'good' | 'expiring' | 'unhappy';
    teamChemistry?: number;  // 0-100
  }
): Player {
  let moraleChange = 0;
  
  // Win/loss record
  if (factors.wins !== undefined && factors.losses !== undefined) {
    const winRate = factors.wins / (factors.wins + factors.losses || 1);
    if (winRate > 0.6) moraleChange += 5;
    else if (winRate < 0.4) moraleChange -= 5;
  }
  
  // Playing time
  if (factors.playingTime !== undefined) {
    moraleChange += factors.playingTime ? 3 : -4;
  }
  
  // Contract situation
  if (factors.contractSituation === 'unhappy') moraleChange -= 10;
  else if (factors.contractSituation === 'expiring') moraleChange -= 5;
  else if (factors.contractSituation === 'good') moraleChange += 5;
  
  // Team chemistry
  if (factors.teamChemistry !== undefined) {
    if (factors.teamChemistry > 80) moraleChange += 3;
    else if (factors.teamChemistry < 50) moraleChange -= 3;
  }
  
  const newMorale = Math.max(0, Math.min(100, player.morale + moraleChange));
  
  return {
    ...player,
    morale: newMorale,
  };
}

// Update form based on recent performance
export function updateForm(player: Player, recentACS: number): Player {
  // ACS thresholds
  let formChange = 0;
  
  if (recentACS > 250) formChange = 5;
  else if (recentACS > 200) formChange = 3;
  else if (recentACS > 150) formChange = 1;
  else if (recentACS < 100) formChange = -5;
  else if (recentACS < 130) formChange = -3;
  
  const newForm = Math.max(0, Math.min(100, player.form + formChange));
  
  return {
    ...player,
    form: newForm,
  };
}

// Initialize development attributes for existing players
export function initializeDevelopment(player: Player): Player {
  if (player.potential !== undefined) return player; // Already initialized
  
  return {
    ...player,
    potential: calculatePotential(player),
    development: Math.random() * 30, // Random starting development
    morale: 70 + Math.random() * 20, // Start with decent morale
    form: 60 + Math.random() * 30,   // Average form
  };
}