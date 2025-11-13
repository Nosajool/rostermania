import type { 
  Team, 
  Player, 
  Map, 
  MapResult, 
  PlayerMapPerformance,
  Agent 
} from '../types/types';

// Simulate a single round (team returns true if they win the round)
function simulateRound(
  attackingTeam: Player[],
  defendingTeam: Player[],
  map: Map
): { winner: 'attack' | 'defense'; firstKill?: string; firstDeath?: string } {
  // Calculate team strengths
  const attackStrength = calculateTeamStrength(attackingTeam, 'attack', map);
  const defenseStrength = calculateTeamStrength(defendingTeam, 'defense', map);
  
  // Add randomness (20% variance)
  const attackRoll = attackStrength * (0.9 + Math.random() * 0.2);
  const defenseRoll = defenseStrength * (0.9 + Math.random() * 0.2);
  
  // Determine winner
  const winner = attackRoll > defenseRoll ? 'attack' : 'defense';
  
  // Simulate first blood
  const firstKillPlayer = winner === 'attack' 
    ? getRandomWeightedPlayer(attackingTeam, 'entry')
    : getRandomWeightedPlayer(defendingTeam, 'entry');
  
  const firstDeathPlayer = winner === 'attack'
    ? getRandomWeightedPlayer(defendingTeam, 'mechanics')
    : getRandomWeightedPlayer(attackingTeam, 'mechanics');
  
  return {
    winner,
    firstKill: firstKillPlayer?.name,
    firstDeath: firstDeathPlayer?.name,
  };
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
    if ((result.winner === 'attack' && teamAAttacking) || 
        (result.winner === 'defense' && !teamAAttacking)) {
      teamAScore++;
      updatePerformances(teamAPerf, teamA.roster, true, result);
      updatePerformances(teamBPerf, teamB.roster, false, result);
    } else {
      teamBScore++;
      updatePerformances(teamAPerf, teamA.roster, false, result);
      updatePerformances(teamBPerf, teamB.roster, true, result);
    }
    
    // Track attack/defense splits
    if (teamAAttacking) {
      if (result.winner === 'attack') {
        teamAPerf.forEach(p => (p as any).attackRoundsWon = ((p as any).attackRoundsWon || 0) + 1);
      }
    } else {
      if (result.winner === 'defense') {
        teamAPerf.forEach(p => (p as any).defenseRoundsWon = ((p as any).defenseRoundsWon || 0) + 1);
      }
    }
    
    // Check win conditions
    if (teamAScore >= 13 && teamAScore - teamBScore >= 2) {
      break;
    }
    if (teamBScore >= 13 && teamBScore - teamAScore >= 2) {
      break;
    }
    
    // Overtime cap at round 30 (15-15, sudden death after)
    if (totalRounds >= 30) {
      if (teamAScore > teamBScore) break;
      if (teamBScore > teamAScore) break;
    }
  }
  
  const winner = teamAScore > teamBScore ? 'teamA' : 'teamB';
  const overtime = totalRounds > 24;
  
  // Finalize performance stats
  finalizePerformances(teamAPerf, totalRounds);
  finalizePerformances(teamBPerf, totalRounds);
  
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

// Update performance stats for a round
function updatePerformances(
  performances: PlayerMapPerformance[],
  roster: Player[],
  wonRound: boolean,
  roundResult: { firstKill?: string; firstDeath?: string }
) {
  performances.forEach((perf, idx) => {
    const player = roster[idx];
    
    // Simulate kills based on mechanics and role
    const killChance = (player.stats.mechanics + player.stats.entry) / 200;
    const kills = Math.random() < killChance ? (Math.random() < 0.3 ? 2 : 1) : 0;
    perf.kills += kills;
    
    // Deaths (less if won round)
    const deathChance = wonRound ? 0.15 : 0.35;
    if (Math.random() < deathChance) {
      perf.deaths++;
    }
    
    // Assists based on support stat
    const assistChance = player.stats.support / 150;
    if (Math.random() < assistChance) {
      perf.assists++;
    }
    
    // First kills/deaths
    if (roundResult.firstKill === player.name) {
      perf.firstKills++;
    }
    if (roundResult.firstDeath === player.name) {
      perf.firstDeaths++;
    }
  });
}

// Calculate final stats
function finalizePerformances(performances: PlayerMapPerformance[], totalRounds: number) {
  performances.forEach(perf => {
    perf.kd = perf.deaths > 0 ? perf.kills / perf.deaths : perf.kills;
    perf.kpr = perf.kills / totalRounds;
    perf.apr = perf.assists / totalRounds;
    perf.fkpr = perf.firstKills / totalRounds;
    perf.fdpr = perf.firstDeaths / totalRounds;
    
    // ACS (simplified calculation)
    perf.acs = Math.round((perf.kills * 150 + perf.assists * 50) / totalRounds);
    
    // ADR (damage roughly correlates with ACS)
    perf.adr = Math.round(perf.acs * 0.7);
    
    // KAST (simplified - rounds where player got K, A, S, or T)
    perf.kast = Math.min(95, Math.round(((perf.kills + perf.assists) / totalRounds) * 100));
    
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