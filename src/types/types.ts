// Core game types for Valorant Manager

export type Region = 'Americas' | 'EMEA' | 'Pacific' | 'China';

export type Role = 'Duelist' | 'Initiator' | 'Controller' | 'Sentinel' | 'Flex';

export type Map = 'Ascent' | 'Split' | 'Haven' | 'Bind' | 'Icebox' | 'Breeze' | 'Fracture' | 'Pearl' | 'Lotus' | 'Sunset';

export type Agent = 
  // Duelists
  | 'Jett' | 'Phoenix' | 'Reyna' | 'Raze' | 'Yoru' | 'Neon' | 'Iso'
  // Controllers
  | 'Brimstone' | 'Viper' | 'Omen' | 'Astra' | 'Harbor' | 'Clove'
  // Initiators
  | 'Sova' | 'Breach' | 'Skye' | 'KAY/O' | 'Fade' | 'Gekko' | 'Tejo'
  // Sentinels
  | 'Sage' | 'Cypher' | 'Killjoy' | 'Chamber' | 'Deadlock' | 'Vyse';

export interface PlayerStats {
  mechanics: number;      // 0-100: Aim and gunplay ability
  igl: number;           // 0-100: In-game leadership and strategy
  mental: number;        // 0-100: Composure under pressure
  clutch: number;        // 0-100: Performance in 1vX situations
  vibes: number;         // 0-100: Team morale contribution
  lurking: number;       // 0-100: Solo play and flanking
  entry: number;         // 0-100: First contact aggression
  support: number;       // 0-100: Utility usage and teamplay
  stamina: number;       // 0-100: Consistency across long matches
}

export interface PlayerContract {
  salary: number;        // Annual salary
  yearsRemaining: number;
  totalYears: number;    // Original contract length
  buyoutClause: number;  // Buyout amount to release early
  signedDate?: Date;     // When contract was signed
}

// Player synergy with another player (bidirectional)
export interface PlayerSynergy {
  playerId: string;      // ID of the other player
  value: number;         // -30 to +30 (negative = anti-synergy, positive = synergy)
}

export type PlayerStatus = 'active' | 'reserve';

export interface Player {
  id: string;
  name: string;
  age: number;
  region: Region;
  role: Role;
  preferredRole: Role;   // Role where they get stat bonuses
  stats: PlayerStats;
  contract?: PlayerContract;
  teamId?: string;
  status?: PlayerStatus;  // Active roster or reserve
  
  // Agent proficiency: 0-100 for each agent they can play
  agentPool: Partial<Record<Agent, number>>;
  
  // Player synergies (positive) and anti-synergies (negative)
  synergies: PlayerSynergy[];
  
  // Map-specific proficiency
  mapProficiency?: Partial<Record<Map, number>>; // 0-100 for each map
  
  // Development attributes
  potential?: number;     // 0-100: Maximum achievable skill level
  development?: number;   // 0-100: Progress toward potential
  morale?: number;        // 0-100: Current morale state
  form?: number;          // 0-100: Current performance form
}

export interface Coach {
  id: string;
  name: string;
  type: 'Head Coach' | 'Assistant Coach' | 'Performance Coach';
  statBoosts: Partial<PlayerStats>; // Which stats they improve
  salary: number;
  contract: {
    yearsRemaining: number;
  };
}

export interface Team {
  id: string;
  name: string;
  shortName: string;     // e.g., "SEN", "FNC"
  region: Region;
  roster: Player[];      // Should have exactly 5 active players
  coaches: Coach[];
  budget: number;
  
  // League standing info
  wins: number;
  losses: number;
  mapDifferential: number;    // Maps won - maps lost
  roundDifferential: number;  // Rounds won - rounds lost
  
  // Team-level map practice tracking
  lastPracticedMaps: Partial<Record<Map, Date>>; // Track when team last practiced each map
  mapPracticeLevel: Partial<Record<Map, number>>; // 0-100 proficiency from practice/scrims
}

// Detailed player performance stats for a single map (based on VLR.gg format)
export interface PlayerMapPerformance {
  playerId: string;
  playerName: string;
  agent: Agent;
  
  // Core stats
  kills: number;
  deaths: number;
  assists: number;
  
  // Advanced stats
  acs: number;           // Average Combat Score
  kd: number;            // Kill/Death ratio
  adr: number;           // Average Damage per Round
  kast: number;          // Kill, Assist, Survive, Trade % (0-100)
  
  // Per round stats
  kpr: number;           // Kills per round
  apr: number;           // Assists per round
  fkpr: number;          // First kills per round
  fdpr: number;          // First deaths per round
  
  // Opening duels
  firstKills: number;    // Total first kills
  firstDeaths: number;   // Total first deaths
  
  // Multi-kills
  doubleKills: number;
  tripleKills: number;
  quadraKills: number;
  aceKills: number;
  
  // Clutches
  clutchesWon: number;
  clutchesPlayed: number;
  clutchSuccessRate: number; // Percentage
  
  // Economy
  econRating: number;    // Economy efficiency rating
  
  // Plants/Defuses (situational)
  plants?: number;
  defuses?: number;
}

export interface MapResult {
  map: Map;
  teamAScore: number;    // Rounds won by team A
  teamBScore: number;    // Rounds won by team B
  winner: 'teamA' | 'teamB';
  
  // Attacking/Defending splits
  teamAAttackRounds: number;
  teamADefenseRounds: number;
  teamBAttackRounds: number;
  teamBDefenseRounds: number;
  
  // Detailed player performances
  teamAPerformances: PlayerMapPerformance[];
  teamBPerformances: PlayerMapPerformance[];
  
  // Map-level stats
  totalRounds: number;
  overtime: boolean;
  overtimeRounds?: number;
}

export interface Match {
  id: string;
  week: number;
  teamA: Team;
  teamB: Team;
  maps: MapResult[];
  winner?: Team;
  stage: 'Kickoff' | 'Stage 1' | 'Stage 2' | 'Playoffs' | 'Masters' | 'Champions';
  
  // Map pick/ban phase
  mapVeto?: {
    bans: Map[];         // Alternating bans
    picks: Map[];        // Maps that will be played
    decider?: Map;       // Final map if needed
  };
}

export interface Group {
  id: string;
  name: string;          // e.g., "Group A"
  teams: Team[];         // 6 teams
  standings: Standing[];
}

export interface Standing {
  team: Team;
  wins: number;
  losses: number;
  mapDifferential: number;
  roundDifferential: number;
  matchesPlayed: number;
  
  // Head-to-head records for tiebreakers
  headToHead?: Record<string, { wins: number; losses: number }>; // teamId -> record
}

export interface Season {
  year: number;
  region: Region;
  currentStage: 'Kickoff' | 'Stage 1' | 'Stage 2' | 'Playoffs' | 'Masters' | 'Champions';
  groups?: Group[];      // For group stage
  matches: Match[];
}

// Scrim objective types
export type ScrimObjective = 
  | 'macro_play'           // Overall strategic coordination
  | 'site_retakes'        // Retaking planted sites
  | 'site_executes'       // Coordinated site takes
  | 'utility_usage'       // Ability combinations and timing
  | 'lurk_timings'        // Solo play and flanking
  | 'defense_setups'      // Defensive positioning
  | 'communication'       // Team comms and callouts
  | 'trading'             // Refrag and teamplay
  | 'map_control';        // Early round map presence

// Team composition for a scrim
export interface ScrimComposition {
  playerId: string;
  playerName: string;
  agent: Agent;
}

// Scrim opponent team
export interface ScrimOpponent {
  teamId: string;
  teamName: string;
  teamShortName: string;
  region: Region;
  scrimQuality: number;   // 0-100: Overall effectiveness as practice partner
  
  // Strengths by objective (0-100 for each)
  objectiveStrengths: Partial<Record<ScrimObjective, number>>;
  
  // Map proficiency (0-100 for each map)
  mapStrengths: Partial<Record<Map, number>>;
}

// Scrim session configuration
export interface ScrimSession {
  id: string;
  week: number;
  date: Date;
  map: Map;
  objective: ScrimObjective;
  opponent: ScrimOpponent;
  composition: ScrimComposition[]; // Exactly 5 players
}

// Scrim result showing improvements
export interface ScrimResult {
  session: ScrimSession;
  
  // Team improvements
  teamMapProficiency: number;      // Improvement to team's map proficiency
  objectiveProficiency: number;    // Specific objective improvement
  
  // Individual player improvements
  playerImprovements: {
    playerId: string;
    playerName: string;
    agentProficiency: number;      // Improvement to agent proficiency (0-5)
    statImprovements: Partial<PlayerStats>; // Stat gains from objective
    synergyGains: {                // Synergy improvements with teammates
      playerId: string;
      change: number;              // -2 to +2
    }[];
  }[];
  
  // Result quality based on opponent and objective match
  qualityRating: number;           // 0-100: How effective this scrim was
  feedback: string;                // Description of what was learned
}

// Weekly scrim tracking
export interface WeeklyScrimData {
  week: number;
  scrimsCompleted: number;        // Current count (max 5)
  scrimSessions: ScrimSession[];
  scrimResults: ScrimResult[];
}

// Utility type for game state
export interface GameState {
  currentSeason: Season;
  playerTeam: Team;      // The team the user manages
  allTeams: Team[];
  freeAgents: Player[];
  currentDate: Date;
  
  // Scrim tracking
  weeklyScrimData?: WeeklyScrimData;
}