import type { 
  Team, 
  Player, 
  Map, 
  MapResult, 
  PlayerMapPerformance,
  Agent 
} from '../types/types';

// Kill event with timestamp
interface KillEvent {
  killer: Player;
  victim: Player;
  timestamp: number; // seconds into round
  wasTraded: boolean;
}

// Round result with detailed kill tracking
interface RoundResult {
  winner: 'attack' | 'defense';
  winCondition: 'elimination' | 'bomb_detonated' | 'bomb_defused' | 'time_expired';
  kills: KillEvent[];
  survivors: Player[]; // Players who survived the round
  bombPlanted: boolean;
  plantTime?: number; // When bomb was planted
}

// Simulate a single round with realistic mechanics
function simulateRound(
  attackingTeam: Player[],
  defendingTeam: Player[],
  map: Map
): RoundResult {
  const kills: KillEvent[] = [];
  const aliveAttackers = [...attackingTeam];
  const aliveDefenders = [...defendingTeam];
  
  const PLANT_TIME = 90; // 1:30 to plant
  const DEFUSE_TIME = 45; // 45 seconds to defuse after plant
  const TRADE_WINDOW = 3; // 3 seconds to get a trade
  
  let currentTime = 0;
  let bombPlanted = false;
  let plantTime = 0;
  
  // Calculate team strengths
  const attackStrength = calculateTeamStrength(attackingTeam, 'attack', map);
  const defenseStrength = calculateTeamStrength(defendingTeam, 'defense', map);
  
  // Determine round pacing based on team strengths
  const avgKillTime = 15 + Math.random() * 10; // Kills happen every 15-25 seconds on average
  
  // Simulate engagement phase
  while (aliveAttackers.length > 0 && aliveDefenders.length > 0) {
    currentTime += Math.random() * avgKillTime * 0.5 + avgKillTime * 0.5;
    
    // Check if attackers try to plant
    if (!bombPlanted && currentTime < PLANT_TIME && aliveAttackers.length > aliveDefenders.length) {
      // Likely plant scenario
      if (Math.random() < 0.7) {
        bombPlanted = true;
        plantTime = currentTime;
      }
    }
    
    // Time expired without plant
    if (!bombPlanted && currentTime >= PLANT_TIME) {
      return {
        winner: 'defense',
        winCondition: 'time_expired',
        kills,
        survivors: [...aliveDefenders],
        bombPlanted: false,
      };
    }
    
    // Bomb detonates
    if (bombPlanted && (currentTime - plantTime) >= DEFUSE_TIME) {
      return {
        winner: 'attack',
        winCondition: 'bomb_detonated',
        kills,
        survivors: [...aliveAttackers],
        bombPlanted: true,
        plantTime,
      };
    }
    
    // Simulate a kill
    const { killer, victim, team } = simulateKill(aliveAttackers, aliveDefenders, attackStrength, defenseStrength);
    
    const killEvent: KillEvent = {
      killer,
      victim,
      timestamp: currentTime,
      wasTraded: false,
    };
    
    kills.push(killEvent);
    
    // Remove victim from alive list
    if (team === 'attack') {
      const victimIndex = aliveAttackers.findIndex(p => p.id === victim.id);
      if (victimIndex !== -1) aliveAttackers.splice(victimIndex, 1);
    } else {
      const victimIndex = aliveDefenders.findIndex(p => p.id === victim.id);
      if (victimIndex !== -1) aliveDefenders.splice(victimIndex, 1);
    }
  }
  
  // Check for trades (kills within TRADE_WINDOW seconds)
  for (let i = 0; i < kills.length - 1; i++) {
    const kill = kills[i];
    const nextKill = kills[i + 1];
    
    // Check if next kill is a trade (victim's team kills the killer)
    if (nextKill.timestamp - kill.timestamp <= TRADE_WINDOW) {
      const victimWasAttacker = attackingTeam.some(p => p.id === kill.victim.id);
      const nextKillerIsAttacker = attackingTeam.some(p => p.id === nextKill.killer.id);
      
      // Trade happened if the victim's teammate killed the killer
      if (victimWasAttacker === nextKillerIsAttacker && nextKill.victim.id === kill.killer.id) {
        kill.wasTraded = true;
      }
    }
  }
  
  // Determine winner
  if (aliveAttackers.length === 0) {
    // Defenders eliminated all attackers
    if (bombPlanted) {
      // But bomb is planted - can they defuse?
      const timeToDefuse = DEFUSE_TIME - (currentTime - plantTime);
      if (timeToDefuse > 7) { // Need at least 7 seconds to defuse
        return {
          winner: 'defense',
          winCondition: 'bomb_defused',
          kills,
          survivors: [...aliveDefenders],
          bombPlanted: true,
          plantTime,
        };
      } else {
        return {
          winner: 'attack',
          winCondition: 'bomb_detonated',
          kills,
          survivors: [],
          bombPlanted: true,
          plantTime,
        };
      }
    } else {
      return {
        winner: 'defense',
        winCondition: 'elimination',
        kills,
        survivors: [...aliveDefenders],
        bombPlanted: false,
      };
    }
  } else {
    // Attackers eliminated all defenders
    return {
      winner: 'attack',
      winCondition: bombPlanted ? 'bomb_detonated' : 'elimination',
      kills,
      survivors: [...aliveAttackers],
      bombPlanted,
      plantTime: bombPlanted ? plantTime : undefined,
    };
  }
}

// Simulate a single kill engagement
function simulateKill(
  aliveAttackers: Player[],
  aliveDefenders: Player[],
  attackStrength: number,
  defenseStrength: number
): { killer: Player; victim: Player; team: 'attack' | 'defense' } {
  // Determine which team gets the kill based on relative strength
  const attackRoll = attackStrength * (0.8 + Math.random() * 0.4);
  const defenseRoll = defenseStrength * (0.8 + Math.random() * 0.4);
  
  const attackerKills = attackRoll > defenseRoll;
  
  if (attackerKills) {
    const killer = getRandomWeightedPlayer(aliveAttackers, 'entry') || aliveAttackers[0];
    const victim = getRandomWeightedPlayer(aliveDefenders, 'mechanics') || aliveDefenders[0];
    return { killer, victim, team: 'defense' };
  } else {
    const killer = getRandomWeightedPlayer(aliveDefenders, 'entry') || aliveDefenders[0];
    const victim = getRandomWeightedPlayer(aliveAttackers, 'mechanics') || aliveAttackers[0];
    return { killer, victim, team: 'attack' };
  }
}

// Calculate overall team strength for a side
function calculateTeamStrength(
  team: Player[],
  side: 'attack' | 'defense',
  map: Map
): number {
  let totalStrength = 0;
  
  team.forEach(player => {
    const stats = player.stats;
    
    // Base strength from mechanics and role-specific stats
    let playerStrength = stats.mechanics * 0.3;
    
    if (side === 'attack') {
      playerStrength += stats.entry * 0.3;
      playerStrength += stats.lurking * 0.2;
      playerStrength += stats.clutch * 0.1;
      playerStrength += stats.support * 0.1;
    } else {
      playerStrength += stats.support * 0.3;
      playerStrength += stats.clutch * 0.2;
      playerStrength += stats.mental * 0.1;
      playerStrength += stats.entry * 0.1;
    }
    
    // Map proficiency bonus
    const mapProf = player.mapProficiency?.[map] || 70;
    playerStrength *= (mapProf / 70); // Normalize around 70
    
    totalStrength += playerStrength;
  });
  
  // IGL bonus (find highest IGL stat)
  const bestIGL = Math.max(...team.map(p => p.stats.igl));
  totalStrength *= (1 + (bestIGL / 100) * 0.15); // Up to 15% bonus
  
  // Team vibes bonus (average)
  const avgVibes = team.reduce((sum, p) => sum + p.stats.vibes, 0) / team.length;
  totalStrength *= (1 + (avgVibes / 100) * 0.1); // Up to 10% bonus
  
  return totalStrength;
}

// Get random player weighted by a stat
function getRandomWeightedPlayer(team: Player[], stat: keyof Player['stats']): Player | undefined {
  const weights = team.map(p => p.stats[stat]);
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  
  if (totalWeight === 0) return team[0];
  
  let random = Math.random() * totalWeight;
  
  for (let i = 0; i < team.length; i++) {
    random -= weights[i];
    if (random <= 0) {
      return team[i];
    }
  }
  
  return team[0];
}

// Simulate a full map (first to 13, must win by 2)
export function simulateMap(
  teamA: Team,
  teamB: Team,
  map: Map
): MapResult {
  let teamAScore = 0;
  let teamBScore = 0;
  let totalRounds = 0;
  
  // Track player performances
  const teamAPerf = initializePerformances(teamA.roster);
  const teamBPerf = initializePerformances(teamB.roster);
  
  // Track KAST data per round
  const teamAKastRounds: boolean[] = Array(teamA.roster.length).fill(false);
  const teamBKastRounds: boolean[] = Array(teamB.roster.length).fill(false);
  
  const teamAKastCount: number[] = Array(teamA.roster.length).fill(0);
  const teamBKastCount: number[] = Array(teamB.roster.length).fill(0);
  
  // Standard match: 24 rounds (12 attack, 12 defense each)
  // Then overtime if tied
  
  while (true) {
    totalRounds++;
    const roundNum = totalRounds;
    
    // Determine sides (switch at round 13)
    const teamAAttacking = (roundNum <= 12) || (roundNum > 24 && roundNum % 2 === 1);
    
    const result = simulateRound(
      teamAAttacking ? teamA.roster : teamB.roster,
      teamAAttacking ? teamB.roster : teamA.roster,
      map
    );
    
    // Update scores
    const teamAWon = (result.winner === 'attack' && teamAAttacking) || 
                     (result.winner === 'defense' && !teamAAttacking);
    
    if (teamAWon) {
      teamAScore++;
    } else {
      teamBScore++;
    }
    
    // Update performances based on round result
    updatePerformancesFromRound(
      teamAPerf, 
      teamA.roster, 
      result, 
      teamAAttacking,
      teamAWon,
      teamAKastCount
    );
    
    updatePerformancesFromRound(
      teamBPerf, 
      teamB.roster, 
      result, 
      !teamAAttacking,
      !teamAWon,
      teamBKastCount
    );
    
    // Check win conditions
    if (teamAScore >= 13 && teamAScore - teamBScore >= 2) {
      break;
    }
    if (teamBScore >= 13 && teamBScore - teamAScore >= 2) {
      break;
    }
    
    // Overtime cap at round 30
    if (totalRounds >= 30) {
      if (teamAScore > teamBScore) break;
      if (teamBScore > teamAScore) break;
    }
  }
  
  const winner = teamAScore > teamBScore ? 'teamA' : 'teamB';
  const overtime = totalRounds > 24;
  
  // Finalize performance stats
  finalizePerformances(teamAPerf, totalRounds, teamAKastCount);
  finalizePerformances(teamBPerf, totalRounds, teamBKastCount);
  
  return {
    map,
    teamAScore,
    teamBScore,
    winner,
    teamAAttackRounds: teamAScore,
    teamADefenseRounds: 0,
    teamBAttackRounds: teamBScore,
    teamBDefenseRounds: 0,
    teamAPerformances: teamAPerf,
    teamBPerformances: teamBPerf,
    totalRounds,
    overtime,
    overtimeRounds: overtime ? totalRounds - 24 : undefined,
  };
}

// Initialize player performance tracking
function initializePerformances(roster: Player[]): PlayerMapPerformance[] {
  return roster.map(player => ({
    playerId: player.id || player.name,
    playerName: player.name,
    agent: getPlayerAgent(player),
    kills: 0,
    deaths: 0,
    assists: 0,
    acs: 0,
    kd: 0,
    adr: 0,
    kast: 0,
    kpr: 0,
    apr: 0,
    fkpr: 0,
    fdpr: 0,
    firstKills: 0,
    firstDeaths: 0,
    doubleKills: 0,
    tripleKills: 0,
    quadraKills: 0,
    aceKills: 0,
    clutchesWon: 0,
    clutchesPlayed: 0,
    clutchSuccessRate: 0,
    econRating: 0,
  }));
}

// Get appropriate agent for player based on their pool
function getPlayerAgent(player: Player): Agent {
  const agentPool = Object.keys(player.agentPool) as Agent[];
  if (agentPool.length === 0) return 'Jett'; // Fallback
  
  // Pick highest proficiency agent
  let bestAgent = agentPool[0];
  let bestProf = player.agentPool[bestAgent] || 0;
  
  agentPool.forEach(agent => {
    const prof = player.agentPool[agent] || 0;
    if (prof > bestProf) {
      bestAgent = agent;
      bestProf = prof;
    }
  });
  
  return bestAgent;
}

// Update performance stats from a round result
function updatePerformancesFromRound(
  performances: PlayerMapPerformance[],
  roster: Player[],
  roundResult: RoundResult,
  isAttacking: boolean,
  wonRound: boolean,
  kastCount: number[]
) {
  // Track kills and deaths from kill events
  roundResult.kills.forEach((killEvent, killIndex) => {
    const killerIdx = roster.findIndex(p => p.id === killEvent.killer.id);
    const victimIdx = roster.findIndex(p => p.id === killEvent.victim.id);
    
    if (killerIdx !== -1) {
      performances[killerIdx].kills++;
      
      // First kill
      if (killIndex === 0) {
        performances[killerIdx].firstKills++;
      }
      
      // KAST: Got a kill
      kastCount[killerIdx] = 1;
      
      // Check for multi-kills (kills within same round)
      const killerKillsThisRound = roundResult.kills.filter(k => k.killer.id === killEvent.killer.id).length;
      if (killerKillsThisRound === 2) performances[killerIdx].doubleKills++;
      if (killerKillsThisRound === 3) performances[killerIdx].tripleKills++;
      if (killerKillsThisRound === 4) performances[killerIdx].quadraKills++;
      if (killerKillsThisRound === 5) performances[killerIdx].aceKills++;
    }
    
    if (victimIdx !== -1) {
      performances[victimIdx].deaths++;
      
      // First death
      if (killIndex === 0) {
        performances[victimIdx].firstDeaths++;
      }
      
      // KAST: Was traded
      if (killEvent.wasTraded) {
        kastCount[victimIdx] = 1;
      }
    }
  });
  
  // Track survivors (KAST: Survived)
  roundResult.survivors.forEach(survivor => {
    const idx = roster.findIndex(p => p.id === survivor.id);
    if (idx !== -1) {
      kastCount[idx] = 1;
    }
  });
  
  // Assists: Players on winning team who didn't get kills but survived or got traded
  if (wonRound) {
    roster.forEach((player, idx) => {
      const gotKill = roundResult.kills.some(k => k.killer.id === player.id);
      const died = roundResult.kills.some(k => k.victim.id === player.id);
      const survived = roundResult.survivors.some(s => s.id === player.id);
      
      // Assist chance for players who didn't get the kill but were involved
      if (!gotKill && (survived || died)) {
        if (Math.random() < player.stats.support / 150) {
          performances[idx].assists++;
          kastCount[idx] = 1; // KAST: Got assist
        }
      }
    });
  }
}

// Calculate final stats
function finalizePerformances(
  performances: PlayerMapPerformance[], 
  totalRounds: number,
  kastCount: number[]
) {
  performances.forEach((perf, idx) => {
    perf.kd = perf.deaths > 0 ? perf.kills / perf.deaths : perf.kills;
    perf.kpr = perf.kills / totalRounds;
    perf.apr = perf.assists / totalRounds;
    perf.fkpr = perf.firstKills / totalRounds;
    perf.fdpr = perf.firstDeaths / totalRounds;
    
    // ACS (simplified calculation)
    perf.acs = Math.round((perf.kills * 150 + perf.assists * 50) / totalRounds);
    
    // ADR (damage roughly correlates with ACS)
    perf.adr = Math.round(perf.acs * 0.7);
    
    // KAST (Kill, Assist, Survived, Traded percentage)
    perf.kast = Math.round((kastCount[idx] / totalRounds) * 100);
    
    // Economy rating (simplified)
    perf.econRating = Math.round(50 + (perf.kd - 1) * 20);
  });
}

// Simulate best of 3 match
export function simulateBestOf3(
  teamA: Team,
  teamB: Team,
  maps: [Map, Map, Map]
): MapResult[] {
  const results: MapResult[] = [];
  let teamAWins = 0;
  let teamBWins = 0;
  
  // Use only active players
  const teamARoster = teamA.roster.filter(p => p.status !== 'reserve').slice(0, 5);
  const teamBRoster = teamB.roster.filter(p => p.status !== 'reserve').slice(0, 5);
  
  // Create temporary teams with active rosters
  const activeTeamA = { ...teamA, roster: teamARoster };
  const activeTeamB = { ...teamB, roster: teamBRoster };
  
  for (let i = 0; i < 3; i++) {
    // Stop if already won (BO3)
    if (teamAWins === 2 || teamBWins === 2) break;
    
    const mapResult = simulateMap(activeTeamA, activeTeamB, maps[i]);
    results.push(mapResult);
    
    if (mapResult.winner === 'teamA') {
      teamAWins++;
    } else {
      teamBWins++;
    }
  }
  
  return results;
}