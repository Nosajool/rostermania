import type { Team, Region, Player, Match } from '../types/types';
import { getTeamsByRegion } from '../data/gameData';
import { ELITE_PLAYERS } from '../utils/elitePlayers';
import { generatePlayer, getTeamTier } from './playerGenerator';

// Convert basic team data to full Team object with all required fields
export function createFullTeam(teamName: string, region: Region): Team {
  const basicTeams = getTeamsByRegion(region);
  const basicTeam = basicTeams.find(t => t.name === teamName);
  
  if (!basicTeam) {
    throw new Error(`Team ${teamName} not found in region ${region}`);
  }
  
  // Generate full player data
  const tier = getTeamTier(teamName);
  const fullRoster: Player[] = basicTeam.roster.map(basicPlayer => {
    // Check if this is an elite player
    const elitePlayer = ELITE_PLAYERS.find(p => p.name === basicPlayer.name);
    
    if (elitePlayer) {
      return { ...elitePlayer, teamId: basicTeam.name };
    }
    
    // Generate stats for non-elite players
    const generatedPlayer = generatePlayer(
      basicPlayer.name,
      basicPlayer.role,
      region,
      tier
    );
    
    return { ...generatedPlayer, teamId: basicTeam.name };
  });
  
  return {
    id: basicTeam.name.toLowerCase().replace(/\s+/g, '-'),
    name: basicTeam.name,
    shortName: basicTeam.shortName,
    region: basicTeam.region,
    roster: fullRoster,
    coaches: [], // Can be populated later
    budget: 2500000, // $2.5M default
    wins: 0,
    losses: 0,
    mapDifferential: 0,
    roundDifferential: 0,
    lastPracticedMaps: {},
    mapPracticeLevel: {},
  };
}

// Get all teams in a region as full Team objects
export function getAllTeamsInRegion(region: Region): Team[] {
  const basicTeams = getTeamsByRegion(region);
  return basicTeams.map(bt => createFullTeam(bt.name, region));
}

// Cache for teams to avoid regenerating stats
const teamCache = new Map<string, Team>();

export function getCachedTeam(teamName: string, region: Region): Team {
  const key = `${region}-${teamName}`;
  
  if (!teamCache.has(key)) {
    teamCache.set(key, createFullTeam(teamName, region));
  }
  
  return teamCache.get(key)!;
}

export function clearTeamCache(): void {
  teamCache.clear();
}

// Generate a round-robin schedule for a given region
export function generateSchedule(region: Region): { teams: Team[], schedule: Match[] } {
  const teams = getAllTeamsInRegion(region);
  const schedule: Match[] = [];
  let matchIdCounter = 0;

  if (teams.length < 2) {
    return { teams, schedule: [] };
  }

  // Simple round-robin schedule generation
  for (let i = 0; i < teams.length; i++) {
    for (let j = i + 1; j < teams.length; j++) {
      const match: Match = {
        id: `match-${matchIdCounter++}`,
        week: 0, // Assigned later
        teamA: teams[i],
        teamB: teams[j],
        mapResults: [],
        stage: 'Stage 1',
      };
      schedule.push(match);
    }
  }

  // Shuffle the schedule to make it less predictable
  for (let i = schedule.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [schedule[i], schedule[j]] = [schedule[j], schedule[i]];
  }
  
  // Assign weeks
  const matchesPerWeek = Math.floor(teams.length / 2);
  schedule.forEach((match, index) => {
    match.week = Math.floor(index / matchesPerWeek) + 1;
  });

  return { teams, schedule };
}
