import type {
  Player,
  Team,
  Map,
  Agent,
  ScrimObjective,
  ScrimOpponent,
  ScrimSession,
  ScrimResult,
  ScrimComposition,
  PlayerStats,
  Match,
} from '../types/types';

// Generate scrim opponents from all teams in the league
export function generateScrimOpponents(
  allTeams: Team[],
  playerTeamName: string,
  upcomingMatches: Match[],
  currentWeek: number
): ScrimOpponent[] {
  const opponents: ScrimOpponent[] = [];
  
  // Get teams from upcoming matches in the next 2 weeks
  const upcomingOpponentNames = upcomingMatches
    .filter(m => m.week >= currentWeek && m.week <= currentWeek + 2)
    .flatMap(m => [m.teamA.name, m.teamB.name])
    .filter(name => name !== playerTeamName);
  
  allTeams.forEach(team => {
    // Skip player's own team
    if (team.name === playerTeamName) return;
    
    // Skip upcoming opponents (teams want to hide strats)
    if (upcomingOpponentNames.includes(team.name)) return;
    
    // Calculate scrim quality based on team strength
    const avgStats = calculateTeamAverageStats(team);
    const scrimQuality = Math.min(100, Math.max(40, avgStats.overall + Math.random() * 20 - 10));
    
    // Generate objective strengths
    const objectiveStrengths = generateObjectiveStrengths(team);
    
    // Generate map strengths
    const mapStrengths = generateMapStrengths(team);
    
    opponents.push({
      teamId: team.id,
      teamName: team.name,
      teamShortName: team.shortName,
      region: team.region,
      scrimQuality,
      objectiveStrengths,
      mapStrengths,
    });
  });
  
  // Sort by scrim quality (best practice partners first)
  return opponents.sort((a, b) => b.scrimQuality - a.scrimQuality);
}

// Calculate team average stats
function calculateTeamAverageStats(team: Team): { overall: number } {
  const activePlayers = team.roster.filter(p => p.status !== 'reserve');
  if (activePlayers.length === 0) return { overall: 50 };
  
  const totalStats = activePlayers.reduce((acc, player) => {
    const stats = player.stats;
    return acc + (
      stats.mechanics + stats.igl + stats.mental + stats.clutch +
      stats.vibes + stats.lurking + stats.entry + stats.support + stats.stamina
    ) / 9;
  }, 0);
  
  return { overall: totalStats / activePlayers.length };
}

// Generate objective strengths for a team
function generateObjectiveStrengths(team: Team): Partial<Record<ScrimObjective, number>> {
  const avgStats = calculateTeamAverageStats(team);
  const base = avgStats.overall;
  
  return {
    macro_play: Math.min(100, base + Math.random() * 20 - 10),
    site_retakes: Math.min(100, base + Math.random() * 20 - 10),
    site_executes: Math.min(100, base + Math.random() * 20 - 10),
    utility_usage: Math.min(100, base + Math.random() * 20 - 10),
    lurk_timings: Math.min(100, base + Math.random() * 20 - 10),
    defense_setups: Math.min(100, base + Math.random() * 20 - 10),
    communication: Math.min(100, base + Math.random() * 20 - 10),
    trading: Math.min(100, base + Math.random() * 20 - 10),
    map_control: Math.min(100, base + Math.random() * 20 - 10),
  };
}

// Generate map strengths for a team
function generateMapStrengths(team: Team): Partial<Record<Map, number>> {
  const maps: Map[] = ['Ascent', 'Split', 'Haven', 'Bind', 'Icebox', 'Breeze', 'Fracture', 'Pearl', 'Lotus', 'Sunset'];
  const strengths: Partial<Record<Map, number>> = {};
  
  maps.forEach(map => {
    strengths[map] = team.mapPracticeLevel?.[map] || (50 + Math.random() * 30);
  });
  
  return strengths;
}

// Simulate a scrim session
export function simulateScrim(session: ScrimSession, playerTeam: Team): ScrimResult {
  const { map, objective, opponent, composition } = session;
  
  // Calculate base quality from opponent strength and objective match
  const opponentObjectiveStrength = opponent.objectiveStrengths[objective] || 50;
  const opponentMapStrength = opponent.mapStrengths[map] || 50;
  
  // Quality is based on opponent strengths (better opponents = better practice)
  const baseQuality = (opponentObjectiveStrength + opponentMapStrength + opponent.scrimQuality) / 3;
  
  // Adjust quality based on player composition
  const compositionQuality = calculateCompositionQuality(composition, playerTeam, map, objective);
  
  const qualityRating = Math.min(100, (baseQuality + compositionQuality) / 2);
  
  // Calculate team improvements
  const teamMapProficiency = calculateMapProficiencyGain(qualityRating);
  const objectiveProficiency = calculateObjectiveProficiencyGain(qualityRating, objective);
  
  // Calculate individual player improvements
  const playerImprovements = composition.map(comp => {
    const player = playerTeam.roster.find(p => p.id === comp.playerId)!;
    return calculatePlayerImprovements(player, comp.agent, objective, qualityRating, composition, playerTeam);
  });
  
  // Generate feedback
  const feedback = generateScrimFeedback(opponent, objective, qualityRating);
  
  return {
    session,
    teamMapProficiency,
    objectiveProficiency,
    playerImprovements,
    qualityRating,
    feedback,
  };
}

// Calculate composition quality
function calculateCompositionQuality(
  composition: ScrimComposition[],
  playerTeam: Team,
  map: Map,
  objective: ScrimObjective
): number {
  let quality = 50;
  
  // Check agent proficiency
  composition.forEach(comp => {
    const player = playerTeam.roster.find(p => p.id === comp.playerId);
    if (player) {
      const agentProf = player.agentPool[comp.agent] || 0;
      quality += (agentProf - 50) * 0.2; // Bonus/penalty based on agent proficiency
    }
  });
  
  // Check role diversity
  const roles = composition.map(comp => {
    const player = playerTeam.roster.find(p => p.id === comp.playerId);
    return player?.role || 'Flex';
  });
  const uniqueRoles = new Set(roles).size;
  quality += uniqueRoles * 5; // Bonus for role diversity
  
  return Math.max(0, Math.min(100, quality));
}

// Calculate map proficiency gain
function calculateMapProficiencyGain(qualityRating: number): number {
  // Higher quality = more gain (0-3 points)
  return Math.floor((qualityRating / 100) * 3 * (Math.random() * 0.5 + 0.75));
}

// Calculate objective proficiency gain
function calculateObjectiveProficiencyGain(qualityRating: number, objective: ScrimObjective): number {
  // Higher quality = more gain (0-5 points)
  return Math.floor((qualityRating / 100) * 5 * (Math.random() * 0.5 + 0.75));
}

// Calculate individual player improvements
function calculatePlayerImprovements(
  player: Player,
  agent: Agent,
  objective: ScrimObjective,
  qualityRating: number,
  composition: ScrimComposition[],
  playerTeam: Team
) {
  // Agent proficiency gain (0-5 based on quality)
  const currentProf = player.agentPool[agent] || 0;
  const potential = player.potential || 75;
  const maxGain = Math.min(5, potential - currentProf);
  const agentProficiency = Math.floor((qualityRating / 100) * maxGain * (Math.random() * 0.5 + 0.5));
  
  // Stat improvements based on objective
  const statImprovements = calculateStatImprovements(player, objective, qualityRating);
  
  // Synergy gains with teammates
  const synergyGains = composition
    .filter(comp => comp.playerId !== player.id)
    .map(comp => ({
      playerId: comp.playerId,
      change: Math.random() < 0.5 ? 1 : (Math.random() < 0.3 ? 2 : 0), // Chance of +1 or +2
    }))
    .filter(gain => gain.change > 0);
  
  return {
    playerId: player.id,
    playerName: player.name,
    agentProficiency,
    statImprovements,
    synergyGains,
  };
}

// Calculate stat improvements based on objective
function calculateStatImprovements(
  player: Player,
  objective: ScrimObjective,
  qualityRating: number
): Partial<PlayerStats> {
  const improvements: Partial<PlayerStats> = {};
  const effectiveQuality = qualityRating / 100;
  const potential = player.potential || 75;
  
  // Define which stats each objective improves
  const objectiveStatMap: Record<ScrimObjective, (keyof PlayerStats)[]> = {
    macro_play: ['igl', 'mental', 'support'],
    site_retakes: ['clutch', 'mental', 'support'],
    site_executes: ['entry', 'support', 'mechanics'],
    utility_usage: ['support', 'igl'],
    lurk_timings: ['lurking', 'mental', 'clutch'],
    defense_setups: ['support', 'mental'],
    communication: ['igl', 'support', 'vibes'],
    trading: ['support', 'vibes', 'entry'],
    map_control: ['igl', 'lurking', 'entry'],
  };
  
  const stats = objectiveStatMap[objective] || [];
  
  stats.forEach(stat => {
    const currentValue = player.stats[stat];
    if (currentValue < potential && Math.random() < effectiveQuality * 0.3) {
      improvements[stat] = 1; // +1 point gain
    }
  });
  
  return improvements;
}

// Generate scrim feedback
function generateScrimFeedback(
  opponent: ScrimOpponent,
  objective: ScrimObjective,
  qualityRating: number
): string {
  const objectiveLabels: Record<ScrimObjective, string> = {
    macro_play: 'macro strategy and map control',
    site_retakes: 'retake coordination',
    site_executes: 'site execution timing',
    utility_usage: 'utility combinations',
    lurk_timings: 'lurk plays and flanking',
    defense_setups: 'defensive positioning',
    communication: 'team communication',
    trading: 'trading and refragging',
    map_control: 'early round map control',
  };
  
  const objectiveLabel = objectiveLabels[objective];
  
  if (qualityRating >= 80) {
    return `Excellent practice session against ${opponent.teamName}! The team made significant progress on ${objectiveLabel}. Players showed strong improvement and team synergy is building.`;
  } else if (qualityRating >= 60) {
    return `Good scrim against ${opponent.teamName}. The team learned valuable lessons about ${objectiveLabel}. Some areas still need work, but progress is visible.`;
  } else if (qualityRating >= 40) {
    return `Productive session with ${opponent.teamName}. The team gained some experience with ${objectiveLabel}, though there's room for improvement. Keep practicing!`;
  } else {
    return `Challenging scrim against ${opponent.teamName}. While progress on ${objectiveLabel} was limited, the team identified areas to work on in future sessions.`;
  }
}

// Get objective label for display
export function getObjectiveLabel(objective: ScrimObjective): string {
  const labels: Record<ScrimObjective, string> = {
    macro_play: 'Macro Play',
    site_retakes: 'Site Retakes',
    site_executes: 'Site Executes',
    utility_usage: 'Utility Usage',
    lurk_timings: 'Lurk Timings',
    defense_setups: 'Defense Setups',
    communication: 'Communication',
    trading: 'Trading',
    map_control: 'Map Control',
  };
  return labels[objective];
}

// Get objective description
export function getObjectiveDescription(objective: ScrimObjective): string {
  const descriptions: Record<ScrimObjective, string> = {
    macro_play: 'Improve overall strategic coordination and game sense',
    site_retakes: 'Practice retaking planted sites with coordination',
    site_executes: 'Perfect site take timings and executions',
    utility_usage: 'Develop ability combinations and utility synergies',
    lurk_timings: 'Enhance solo play, flanking, and lurk timings',
    defense_setups: 'Refine defensive positioning and site holds',
    communication: 'Build better team communication and callouts',
    trading: 'Improve refragging and trading effectiveness',
    map_control: 'Master early round map presence and control',
  };
  return descriptions[objective];
}