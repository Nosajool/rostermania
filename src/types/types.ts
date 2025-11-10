// Core game types for Valorant Manager

export type Region = 'Americas' | 'EMEA' | 'Pacific' | 'China';

export type Role = 'Duelist' | 'Initiator' | 'Controller' | 'Sentinel' | 'Flex';

export type Map = 'Ascent' | 'Split' | 'Haven' | 'Bind' | 'Icebox' | 'Breeze' | 'Fracture' | 'Pearl' | 'Lotus' | 'Sunset' | 'Abyss';

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
  buyoutClause?: number; // Optional buyout amount
}

// Player synergy with another player (bidirectional)
export interface PlayerSynergy {
  playerId: string;      // ID of the other player
  value: number;         // -30 to +30 (negative = anti-synergy, positive = synergy)
}

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
  
  // Agent proficiency: 0-100 for each agent they can play
  agentPool: Partial<Record<Agent, number>>;
  
  // Player synergies (positive) and anti-synergies (negative)
  synergies: PlayerSynergy[];
  
  // Map-specific proficiency
  mapProficiency?: Partial<Record<Map, number>>; // 0-100 for each map
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

// Utility type for game state
export interface GameState {
  currentSeason: Season;
  playerTeam: Team;      // The team the user manages
  allTeams: Team[];
  freeAgents: Player[];
  currentDate: Date;
}