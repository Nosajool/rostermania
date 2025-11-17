import type { 
  Team, 
  Player, 
  Map, 
  MapResult, 
  PlayerMapPerformance,
  Agent,
  RoundInfo,
  RoundEvent
} from '../types/types';

// Constants for round timing
const PLANT_PHASE_DURATION = 90; // 1:30 for attackers to plant
const POST_PLANT_DURATION = 45;  // 0:45 for defenders to defuse after plant
const TRADE_WINDOW = 1.0;        // 1 second window for a kill to count as a trade

interface PlayerRoundState {
  player: Player;
  team: 'teamA' | 'teamB';
  isAlive: boolean;
  kills: number;
  assists: Set<string>; // Set of player IDs this player assisted on
  deathTimestamp?: number;
  killedBy?: string;
}

// Simulate a single round with detailed tracking
function simulateRound(
  teamAPlayers: Player[],
  teamBPlayers: Player[],
  attackingTeam: 'teamA' | 'teamB',
  roundNumber: number,
  map: Map
): RoundInfo {
  const events: RoundEvent[] = [];
  let currentTime = 0;
  
  // Initialize player states
  const playerStates = new Map<string, PlayerRoundState>();
  teamAPlayers.forEach(p => {
    playerStates.set(p.id, { player: p, team: 'teamA', isAlive: true, kills: 0, assists: new Set() });
  });
  teamBPlayers.forEach(p => {
    playerStates.set(p.id, { player: p, team: 'teamB', isAlive: true, kills: 0, assists: new Set() });
  });
  
  const attackers = attackingTeam === 'teamA' ? teamAPlayers : teamBPlayers;
  const defenders = attackingTeam === 'teamA' ? teamBPlayers : teamAPlayers;
  const attackingTeamName = attackingTeam;
  const defendingTeamName = attackingTeam === 'teamA' ? 'teamB' : 'teamA';
  
  // Round start event
  events.push({
    timestamp: 0,
    type: 'round_start'
  });
  
  // Calculate team strengths for this round
  const attackStrength = calculateTeamStrength(attackers, 'attack', map);
  const defenseStrength = calculateTeamStrength(defenders, 'defense', map);
  
  // Determine round outcome probability
  const attackAdvantage = attackStrength / (attackStrength + defenseStrength);
  const roundWinProbability = attackAdvantage * (0.85 + Math.random() * 0.3); // Add variance
  const attackersWin = Math.random() < roundWinProbability;
  
  // Simulate engagements during the round
  let bombPlanted = false;
  let bombPlanter: string | undefined;
  let bombDefuser: string | undefined;
  let plantTime: number | undefined;
  let winCondition: RoundInfo['winCondition'];
  let winner: 'teamA' | 'teamB';
  
  // Pre-plant phase (0-90 seconds)
  const plantPhaseEngagements = Math.floor(2 + Math.random() * 3); // 2-4 engagements
  
  for (let i = 0; i < plantPhaseEngagements; i++) {
    const aliveAttackers = Array.from(playerStates.values()).filter(
      ps => ps.isAlive && ps.team === attackingTeamName
    );
    const aliveDefenders = Array.from(playerStates.values()).filter(
      ps => ps.isAlive && ps.team === defendingTeamName
    );
    
    if (aliveAttackers.length === 0 || aliveDefenders.length === 0) break;
    
    // Time this engagement (spread across pre-plant phase)
    const engagementTime = 10 + (i * 20) + Math.random() * 15;
    
    // Determine who wins this engagement
    const attackerWinsEngagement = Math.random() < attackAdvantage;
    
    if (attackerWinsEngagement) {
      // Attacker gets the kill
      simulateKill(
        aliveAttackers,
        aliveDefenders,
        engagementTime,
        events,
        playerStates,
        i === 0 // First kill of the round
      );
    } else {
      // Defender gets the kill
      simulateKill(
        aliveDefenders,
        aliveAttackers,
        engagementTime,
        events,
        playerStates,
        i === 0 // First kill of the round
      );
    }
  }
  
  // Check if round already decided by elimination
  const aliveAttackersCount = Array.from(playerStates.values()).filter(
    ps => ps.isAlive && ps.team === attackingTeamName
  ).length;
  const aliveDefendersCount = Array.from(playerStates.values()).filter(
    ps => ps.isAlive && ps.team === defendingTeamName
  ).length;
  
  if (aliveDefendersCount === 0) {
    // Attackers eliminated all defenders
    winner = attackingTeamName;
    winCondition = 'elimination';
    currentTime = 50 + Math.random() * 30; // Round ends somewhere between 50-80s
  } else if (aliveAttackersCount === 0) {
    // Defenders eliminated all attackers
    winner = defendingTeamName;
    winCondition = 'elimination';
    currentTime = 40 + Math.random() * 30;
  } else {
    // Round continues - bomb plant scenario
    if (attackersWin) {
      // Bomb gets planted
      bombPlanted = true;
      plantTime = 60 + Math.random() * 25; // Plant between 60-85 seconds
      currentTime = plantTime;
      
      const alivePlantCandidates = Array.from(playerStates.values()).filter(
        ps => ps.isAlive && ps.team === attackingTeamName
      );
      bombPlanter = getWeightedPlayer(alivePlantCandidates.map(ps => ps.player), 'igl').id;
      
      events.push({
        timestamp: plantTime,
        type: 'bomb_plant',
        playerId: bombPlanter,
        playerName: playerStates.get(bombPlanter)!.player.name,
        site: Math.random() < 0.5 ? 'A' : 'B'
      });
      
      // Post-plant engagements
      const postPlantEngagements = Math.floor(1 + Math.random() * 3); // 1-3 more fights
      
      for (let i = 0; i < postPlantEngagements; i++) {
        const aliveAttackers = Array.from(playerStates.values()).filter(
          ps => ps.isAlive && ps.team === attackingTeamName
        );
        const aliveDefenders = Array.from(playerStates.values()).filter(
          ps => ps.isAlive && ps.team === defendingTeamName
        );
        
        if (aliveDefenders.length === 0) break;
        
        const postPlantTime = plantTime + 5 + (i * 10) + Math.random() * 8;
        
        // Attackers have advantage post-plant
        const attackerWinsPostPlant = Math.random() < 0.6;
        
        if (attackerWinsPostPlant && aliveAttackers.length > 0) {
          simulateKill(aliveAttackers, aliveDefenders, postPlantTime, events, playerStates, false);
        } else if (aliveDefenders.length > 0) {
          simulateKill(aliveDefenders, aliveAttackers, postPlantTime, events, playerStates, false);
        }
      }
      
      // Check final state
      const finalAliveDefenders = Array.from(playerStates.values()).filter(
        ps => ps.isAlive && ps.team === defendingTeamName
      ).length;
      
      if (finalAliveDefenders === 0) {
        // Bomb explodes
        currentTime = plantTime + POST_PLANT_DURATION;
        events.push({
          timestamp: currentTime,
          type: 'bomb_explode'
        });
        winner = attackingTeamName;
        winCondition = 'bomb_detonated';
      } else {
        // Defenders try to defuse
        const defuseAttemptTime = plantTime + 10 + Math.random() * 20;
        const aliveDefendersList = Array.from(playerStates.values()).filter(
          ps => ps.isAlive && ps.team === defendingTeamName
        );
        bombDefuser = getWeightedPlayer(aliveDefendersList.map(ps => ps.player), 'clutch').id;
        
        events.push({
          timestamp: defuseAttemptTime,
          type: 'bomb_defuse_start',
          playerId: bombDefuser,
          playerName: playerStates.get(bombDefuser)!.player.name
        });
        
        const defuseTime = defuseAttemptTime + 7; // 7 second defuse
        
        if (defuseTime < plantTime + POST_PLANT_DURATION) {
          // Successful defuse
          events.push({
            timestamp: defuseTime,
            type: 'bomb_defuse_complete',
            playerId: bombDefuser,
            playerName: playerStates.get(bombDefuser)!.player.name
          });
          currentTime = defuseTime;
          winner = defendingTeamName;
          winCondition = 'bomb_defused';
        } else {
          // Bomb explodes during defuse
          currentTime = plantTime + POST_PLANT_DURATION;
          events.push({
            timestamp: currentTime,
            type: 'bomb_explode'
          });
          winner = attackingTeamName;
          winCondition = 'bomb_detonated';
        }
      }
    } else {
      // Attackers fail to plant in time
      currentTime = PLANT_PHASE_DURATION;
      winner = defendingTeamName;
      winCondition = 'time_expired';
    }
  }
  
  // Round end event
  events.push({
    timestamp: currentTime,
    type: 'round_end'
  });
  
  // Detect clutch situations
  let clutchSituation: RoundInfo['clutchSituation'] | undefined;
  
  // Check for clutches (1vX where X >= 2)
  const winningTeamAlive = Array.from(playerStates.values()).filter(
    ps => ps.isAlive && ps.team === winner
  );
  const losingTeamAlive = Array.from(playerStates.values()).filter(
    ps => ps.isAlive && ps.team !== winner
  );
  
  if (winningTeamAlive.length === 1 && losingTeamAlive.length >= 1) {
    const clutcher = winningTeamAlive[0];
    const enemyCount = losingTeamAlive.length + 
      Array.from(playerStates.values()).filter(
        ps => !ps.isAlive && ps.team !== winner
      ).length;
    
    if (enemyCount >= 2) {
      clutchSituation = {
        playerId: clutcher.player.id,
        playerName: clutcher.player.name,
        enemiesRemaining: enemyCount,
        won: true
      };
    }
  }
  
  // Find first blood
  const firstBloodEvent = events.find(e => e.isFirstBlood);
  
  return {
    roundNumber,
    attackingTeam: attackingTeamName,
    winner,
    winCondition,
    duration: currentTime,
    events,
    teamAPlayersAlive: Array.from(playerStates.values()).filter(
      ps => ps.isAlive && ps.team === 'teamA'
    ).length,
    teamBPlayersAlive: Array.from(playerStates.values()).filter(
      ps => ps.isAlive && ps.team === 'teamB'
    ).length,
    bombPlanted,
    bombPlanter: bombPlanter ? playerStates.get(bombPlanter)?.player.name : undefined,
    bombDefuser: bombDefuser ? playerStates.get(bombDefuser)?.player.name : undefined,
    clutchSituation,
    firstBlood: firstBloodEvent ? {
      killerId: firstBloodEvent.playerId!,
      killerName: firstBloodEvent.playerName!,
      victimId: firstBloodEvent.targetId!,
      victimName: firstBloodEvent.targetName!,
      timestamp: firstBloodEvent.timestamp,
      weapon: firstBloodEvent.weapon
    } : undefined
  };
}

// Simulate a kill between two teams
function simulateKill(
  killerTeam: PlayerRoundState[],
  victimTeam: PlayerRoundState[],
  timestamp: number,
  events: RoundEvent[],
  playerStates: Map<string, PlayerRoundState>,
  isFirstBlood: boolean
): void {
  if (killerTeam.length === 0 || victimTeam.length === 0) return;
  
  // Select killer weighted by entry stat
  const killer = getWeightedPlayer(killerTeam.map(ps => ps.player), 'entry');
  const killerState = playerStates.get(killer.id)!;
  
  // Select victim (random for now, could weight by positioning)
  const victim = victimTeam[Math.floor(Math.random() * victimTeam.length)].player;
  const victimState = playerStates.get(victim.id)!;
  
  // Check for trade kill (was a teammate killed recently?)
  let isTrade = false;
  let tradedPlayerId: string | undefined;
  
  for (const [pid, pstate] of playerStates.entries()) {
    if (pstate.team === killerState.team && 
        !pstate.isAlive && 
        pstate.deathTimestamp && 
        timestamp - pstate.deathTimestamp <= TRADE_WINDOW &&
        pstate.killedBy === victim.id) {
      isTrade = true;
      tradedPlayerId = pid;
      break;
    }
  }
  
  // Determine clutch situation
  let clutchSituation: string | undefined;
  const killerTeamAlive = Array.from(playerStates.values()).filter(
    ps => ps.isAlive && ps.team === killerState.team
  ).length;
  const victimTeamAlive = Array.from(playerStates.values()).filter(
    ps => ps.isAlive && ps.team === victimState.team
  ).length;
  
  if (killerTeamAlive === 1 && victimTeamAlive >= 2) {
    clutchSituation = `1v${victimTeamAlive}`;
  }
  
  // Record the kill
  killerState.kills++;
  victimState.isAlive = false;
  victimState.deathTimestamp = timestamp;
  victimState.killedBy = killer.id;
  
  // Randomly assign assists (1-2 teammates might assist)
  const potentialAssisters = Array.from(playerStates.values()).filter(
    ps => ps.isAlive && ps.team === killerState.team && ps.player.id !== killer.id
  );
  
  if (potentialAssisters.length > 0 && Math.random() < 0.4) {
    const assister = potentialAssisters[Math.floor(Math.random() * potentialAssisters.length)];
    assister.assists.add(victim.id);
  }
  
  const weapons = ['Vandal', 'Phantom', 'Operator', 'Spectre', 'Sheriff', 'Ghost'];
  const weapon = weapons[Math.floor(Math.random() * weapons.length)];
  
  events.push({
    timestamp,
    type: isTrade ? 'trade_kill' : 'kill',
    playerId: killer.id,
    playerName: killer.name,
    targetId: victim.id,
    targetName: victim.name,
    weapon,
    isHeadshot: Math.random() < 0.35,
    isFirstBlood,
    isTrade,
    tradedPlayerId,
    clutchSituation
  });
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
    playerStrength *= (mapProf / 70);
    
    totalStrength += playerStrength;
  });
  
  // IGL bonus
  const bestIGL = Math.max(...team.map(p => p.stats.igl));
  totalStrength *= (1 + (bestIGL / 100) * 0.15);
  
  // Team vibes bonus
  const avgVibes = team.reduce((sum, p) => sum + p.stats.vibes, 0) / team.length;
  totalStrength *= (1 + (avgVibes / 100) * 0.1);
  
  return totalStrength;
}

// Get weighted random player based on stat
function getWeightedPlayer(team: Player[], stat: keyof Player['stats']): Player {
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

// Simulate a full map
export function simulateMap(
  teamA: Team,
  teamB: Team,
  map: Map
): MapResult {
  let teamAScore = 0;
  let teamBScore = 0;
  const rounds: RoundInfo[] = [];
  
  // Track player performances
  const teamAPerf = initializePerformances(teamA.roster);
  const teamBPerf = initializePerformances(teamB.roster);
  
  // Map player ID to performance object
  const perfMap = new Map<string, PlayerMapPerformance>();
  teamAPerf.forEach(p => perfMap.set(p.playerId, p));
  teamBPerf.forEach(p => perfMap.set(p.playerId, p));
  
  while (true) {
    const roundNum = rounds.length + 1;
    
    // Determine sides (switch at round 13)
    const teamAAttacking = (roundNum <= 12) || (roundNum > 24 && roundNum % 2 === 1);
    
    const roundInfo = simulateRound(
      teamA.roster,
      teamB.roster,
      teamAAttacking ? 'teamA' : 'teamB',
      roundNum,
      map
    );
    
    rounds.push(roundInfo);
    
    // Update scores
    if (roundInfo.winner === 'teamA') {
      teamAScore++;
    } else {
      teamBScore++;
    }
    
    // Update player performances from round
    updatePerformancesFromRound(roundInfo, perfMap, teamA.roster, teamB.roster);
    
    // Check win conditions
    if (teamAScore >= 13 && teamAScore - teamBScore >= 2) break;
    if (teamBScore >= 13 && teamBScore - teamAScore >= 2) break;
    if (rounds.length >= 30) {
      if (teamAScore !== teamBScore) break;
    }
  }
  
  const winner = teamAScore > teamBScore ? 'teamA' : 'teamB';
  const overtime = rounds.length > 24;
  
  // Calculate attack/defense splits
  let teamAAttackRounds = 0;
  let teamADefenseRounds = 0;
  
  rounds.forEach(r => {
    if (r.attackingTeam === 'teamA' && r.winner === 'teamA') teamAAttackRounds++;
    if (r.attackingTeam === 'teamB' && r.winner === 'teamA') teamADefenseRounds++;
  });
  
  // Finalize stats
  finalizePerformances(teamAPerf, rounds.length);
  finalizePerformances(teamBPerf, rounds.length);
  
  return {
    map,
    teamAScore,
    teamBScore,
    winner,
    teamAAttackRounds,
    teamADefenseRounds,
    teamBAttackRounds: rounds.length - teamAAttackRounds - teamADefenseRounds - (teamBScore - teamAAttackRounds),
    teamBDefenseRounds: teamBScore - (rounds.length - teamAAttackRounds - teamADefenseRounds - (teamBScore - teamAAttackRounds)),
    teamAPerformances: teamAPerf,
    teamBPerformances: teamBPerf,
    totalRounds: rounds.length,
    overtime,
    overtimeRounds: overtime ? rounds.length - 24 : undefined,
    rounds
  };
}

// Initialize performances
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
    clutch1v1: 0,
    clutch1v2: 0,
    clutch1v3: 0,
    clutch1v4: 0,
    clutch1v5: 0,
    econRating: 0,
    plants: 0,
    defuses: 0,
    roundsWithKill: 0,
    roundsWithAssist: 0,
    roundsSurvived: 0,
    roundsTraded: 0,
    attackRoundsPlayed: 0,
    defenseRoundsPlayed: 0
  }));
}

// Get player agent
function getPlayerAgent(player: Player): Agent {
  const agentPool = Object.keys(player.agentPool) as Agent[];
  if (agentPool.length === 0) return 'Jett';
  
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

// Update performances from a round
function updatePerformancesFromRound(
  roundInfo: RoundInfo,
  perfMap: Map<string, PlayerMapPerformance>,
  teamARoster: Player[],
  teamBRoster: Player[]
): void {
  // Track who got kills, assists, survived, or was traded this round
  const playerKills = new Map<string, number>();
  const playerAssists = new Set<string>();
  const playerDeaths = new Set<string>();
  const playerTraded = new Set<string>();
  
  // Process events
  roundInfo.events.forEach(event => {
    if (event.type === 'kill' || event.type === 'trade_kill') {
      // Killer gets a kill
      if (event.playerId) {
        playerKills.set(event.playerId, (playerKills.get(event.playerId) || 0) + 1);
        
        const perf = perfMap.get(event.playerId);
        if (perf) {
          perf.kills++;
          if (event.isFirstBlood) {
            perf.firstKills++;
          }
        }
      }
      
      // Victim dies
      if (event.targetId) {
        playerDeaths.add(event.targetId);
        const perf = perfMap.get(event.targetId);
        if (perf) {
          perf.deaths++;
          if (event.isFirstBlood) {
            perf.firstDeaths++;
          }
        }
        
        // Check if this was a trade
        if (event.isTrade && event.tradedPlayerId) {
          playerTraded.add(event.tradedPlayerId);
        }
      }
    } else if (event.type === 'bomb_plant' && event.playerId) {
      const perf = perfMap.get(event.playerId);
      if (perf) perf.plants++;
    } else if (event.type === 'bomb_defuse_complete' && event.playerId) {
      const perf = perfMap.get(event.playerId);
      if (perf) perf.defuses++;
    }
  });
  
  // Update multi-kills
  for (const [playerId, kills] of playerKills.entries()) {
    const perf = perfMap.get(playerId);
    if (!perf) continue;
    
    if (kills === 2) perf.doubleKills++;
    else if (kills === 3) perf.tripleKills++;
    else if (kills === 4) perf.quadraKills++;
    else if (kills === 5) perf.aceKills++;
  }
  
  // Process clutch
  if (roundInfo.clutchSituation) {
    const perf = perfMap.get(roundInfo.clutchSituation.playerId);
    if (perf) {
      perf.clutchesPlayed++;
      if (roundInfo.clutchSituation.won) {
        perf.clutchesWon++;
        
        const enemies = roundInfo.clutchSituation.enemiesRemaining;
        if (enemies === 1) perf.clutch1v1++;
        else if (enemies === 2) perf.clutch1v2++;
        else if (enemies === 3) perf.clutch1v3++;
        else if (enemies === 4) perf.clutch1v4++;
        else if (enemies === 5) perf.clutch1v5++;
      }
    }
  }
  
  // Calculate KAST for each player
  const allPlayers = [...teamARoster, ...teamBRoster];
  
  allPlayers.forEach(player => {
    const perf = perfMap.get(player.id);
    if (!perf) return;
    
    // Check KAST criteria
    const gotKill = playerKills.has(player.id);
    const gotAssist = playerAssists.has(player.id);
    const survived = !playerDeaths.has(player.id);
    const wasTraded = playerTraded.has(player.id);
    
    if (gotKill) perf.roundsWithKill++;
    if (gotAssist) perf.roundsWithAssist++;
    if (survived) perf.roundsSurvived++;
    if (wasTraded) perf.roundsTraded++;
    
    // Track attack/defense rounds
    const playerTeam = teamARoster.includes(player) ? 'teamA' : 'teamB';
    if (roundInfo.attackingTeam === playerTeam) {
      perf.attackRoundsPlayed++;
    } else {
      perf.defenseRoundsPlayed++;
    }
  });
}

// Finalize performance stats
function finalizePerformances(performances: PlayerMapPerformance[], totalRounds: number): void {
  performances.forEach(perf => {
    perf.kd = perf.deaths > 0 ? perf.kills / perf.deaths : perf.kills;
    perf.kpr = perf.kills / totalRounds;
    perf.apr = perf.assists / totalRounds;
    perf.fkpr = perf.firstKills / totalRounds;
    perf.fdpr = perf.firstDeaths / totalRounds;
    
    // ACS calculation
    perf.acs = Math.round((perf.kills * 150 + perf.assists * 50 + perf.firstKills * 25) / totalRounds);
    
    // ADR
    perf.adr = Math.round(perf.acs * 0.7);
    
    // KAST percentage
    const kastRounds = perf.roundsWithKill + perf.roundsWithAssist + perf.roundsSurvived + perf.roundsTraded;
    perf.kast = Math.round((kastRounds / totalRounds) * 100);
    
    // Clutch success rate
    perf.clutchSuccessRate = perf.clutchesPlayed > 0 
      ? Math.round((perf.clutchesWon / perf.clutchesPlayed) * 100)
      : 0;
    
    // Economy rating (simplified)
    perf.econRating = Math.round(50 + (perf.kd - 1) * 20 + (perf.kast - 70) * 0.3);
  });
}

// Simulate best of 3
export function simulateBestOf3(
  teamA: Team,
  teamB: Team,
  maps: [Map, Map, Map]
): MapResult[] {
  const results: MapResult[] = [];
  let teamAWins = 0;
  let teamBWins = 0;
  
  const teamARoster = teamA.roster.filter(p => p.status !== 'reserve').slice(0, 5);
  const teamBRoster = teamB.roster.filter(p => p.status !== 'reserve').slice(0, 5);
  
  const activeTeamA = { ...teamA, roster: teamARoster };
  const activeTeamB = { ...teamB, roster: teamBRoster };
  
  for (let i = 0; i < 3; i++) {
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