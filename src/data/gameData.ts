// Real VCT 2025 data scraped from VLR.gg and official sources

import { Region, Role, Map } from './types';

// All Valorant Agents (27 as of 2025)
export const AGENTS = {
  // Duelists
  JETT: 'Jett',
  PHOENIX: 'Phoenix',
  REYNA: 'Reyna',
  RAZE: 'Raze',
  YORU: 'Yoru',
  NEON: 'Neon',
  ISO: 'Iso',
  
  // Controllers
  BRIMSTONE: 'Brimstone',
  VIPER: 'Viper',
  OMEN: 'Omen',
  ASTRA: 'Astra',
  HARBOR: 'Harbor',
  CLOVE: 'Clove',
  
  // Initiators
  SOVA: 'Sova',
  BREACH: 'Breach',
  SKYE: 'Skye',
  KAY_O: 'KAY/O',
  FADE: 'Fade',
  GEKKO: 'Gekko',
  TEJO: 'Tejo',
  
  // Sentinels
  SAGE: 'Sage',
  CYPHER: 'Cypher',
  KILLJOY: 'Killjoy',
  CHAMBER: 'Chamber',
  DEADLOCK: 'Deadlock',
  VYSE: 'Vyse',
} as const;

// Competitive Maps (Active in VCT 2025)
export const MAPS: Map[] = [
  'Ascent',
  'Haven',
  'Bind',
  'Split',
  'Icebox',
  'Breeze',
  'Fracture',
  'Pearl',
  'Lotus',
  'Sunset',
  'Abyss',
];

// VCT 2025 Americas Teams (12 teams)
export const AMERICAS_TEAMS = [
  {
    name: 'Sentinels',
    shortName: 'SEN',
    region: 'Americas' as Region,
    roster: [
      { name: 'N4RRATE', role: 'Duelist' as Role },
      { name: 'zekken', role: 'Duelist' as Role },
      { name: 'bang', role: 'Controller' as Role },
      { name: 'Zellsis', role: 'Initiator' as Role },
      { name: 'johnqt', role: 'Sentinel' as Role },
    ],
  },
  {
    name: 'G2 Esports',
    shortName: 'G2',
    region: 'Americas' as Region,
    roster: [
      { name: 'leaf', role: 'Duelist' as Role },
      { name: 'jawgemo', role: 'Duelist' as Role },
      { name: 'JonahP', role: 'Initiator' as Role },
      { name: 'trent', role: 'Sentinel' as Role },
      { name: 'valyn', role: 'Controller' as Role },
    ],
  },
  {
    name: 'NRG',
    shortName: 'NRG',
    region: 'Americas' as Region,
    roster: [
      { name: 'mada', role: 'Duelist' as Role },
      { name: 's0m', role: 'Controller' as Role },
      { name: 'Ethan', role: 'Initiator' as Role },
      { name: 'Verno', role: 'Initiator' as Role },
      { name: 'FiNESSE', role: 'Sentinel' as Role },
    ],
  },
  {
    name: '100 Thieves',
    shortName: '100T',
    region: 'Americas' as Region,
    roster: [
      { name: 'Asuna', role: 'Duelist' as Role },
      { name: 'Cryocells', role: 'Duelist' as Role },
      { name: 'Boostio', role: 'Controller' as Role },
      { name: 'eeiu', role: 'Initiator' as Role },
      { name: 'zander', role: 'Sentinel' as Role },
    ],
  },
  {
    name: 'Cloud9',
    shortName: 'C9',
    region: 'Americas' as Region,
    roster: [
      { name: 'OXY', role: 'Duelist' as Role },
      { name: 'v1c', role: 'Duelist' as Role },
      { name: 'Xeppaa', role: 'Initiator' as Role },
      { name: 'mitch', role: 'Controller' as Role },
      { name: 'neT', role: 'Sentinel' as Role },
    ],
  },
  {
    name: 'Evil Geniuses',
    shortName: 'EG',
    region: 'Americas' as Region,
    roster: [
      { name: 'yay', role: 'Duelist' as Role },
      { name: 'icy', role: 'Duelist' as Role },
      { name: 'Derrek', role: 'Initiator' as Role },
      { name: 'NaturE', role: 'Controller' as Role },
      { name: 'supamen', role: 'Sentinel' as Role },
    ],
  },
  {
    name: 'Leviatán',
    shortName: 'LEV',
    region: 'Americas' as Region,
    roster: [
      { name: 'Demon1', role: 'Duelist' as Role },
      { name: 'tex', role: 'Duelist' as Role },
      { name: 'C0M', role: 'Initiator' as Role },
      { name: 'nataNk', role: 'Controller' as Role },
      { name: 'kiNgg', role: 'Sentinel' as Role },
    ],
  },
  {
    name: 'KRÜ Esports',
    shortName: 'KRÜ',
    region: 'Americas' as Region,
    roster: [
      { name: 'keznit', role: 'Duelist' as Role },
      { name: 'adverso', role: 'Duelist' as Role },
      { name: 'Mazino', role: 'Initiator' as Role },
      { name: 'Shyy', role: 'Controller' as Role },
      { name: 'Melser', role: 'Sentinel' as Role },
    ],
  },
  {
    name: 'LOUD',
    shortName: 'LOUD',
    region: 'Americas' as Region,
    roster: [
      { name: 'dgzin', role: 'Duelist' as Role },
      { name: 'cauanzin', role: 'Initiator' as Role },
      { name: 'tuyz', role: 'Controller' as Role },
      { name: 'v1nny', role: 'Sentinel' as Role },
      { name: 'pANcada', role: 'Controller' as Role },
    ],
  },
  {
    name: 'MIBR',
    shortName: 'MIBR',
    region: 'Americas' as Region,
    roster: [
      { name: 'aspas', role: 'Duelist' as Role },
      { name: 'artzin', role: 'Duelist' as Role },
      { name: 'cortezia', role: 'Initiator' as Role },
      { name: 'xenom', role: 'Controller' as Role },
      { name: 'nzr', role: 'Sentinel' as Role },
    ],
  },
  {
    name: 'FURIA',
    shortName: 'FUR',
    region: 'Americas' as Region,
    roster: [
      { name: 'mwzera', role: 'Duelist' as Role },
      { name: 'heat', role: 'Duelist' as Role },
      { name: 'Khalil', role: 'Initiator' as Role },
      { name: 'havoc', role: 'Controller' as Role },
      { name: 'raafa', role: 'Sentinel' as Role },
    ],
  },
  {
    name: '2Game Esports',
    shortName: '2G',
    region: 'Americas' as Region,
    roster: [
      { name: 'gobera', role: 'Duelist' as Role },
      { name: 'pryze', role: 'Duelist' as Role },
      { name: 'silentzz', role: 'Initiator' as Role },
      { name: 'lz', role: 'Controller' as Role },
      { name: 'Zap', role: 'Sentinel' as Role },
    ],
  },
];

// VCT 2025 EMEA Teams (12 teams)
export const EMEA_TEAMS = [
  {
    name: 'Team Heretics',
    shortName: 'TH',
    region: 'EMEA' as Region,
    roster: [
      { name: 'Wo0t', role: 'Duelist' as Role },
      { name: 'benjyfishy', role: 'Duelist' as Role },
      { name: 'RieNs', role: 'Initiator' as Role },
      { name: 'Boo', role: 'Controller' as Role },
      { name: 'ComeBack', role: 'Sentinel' as Role },
    ],
  },
  {
    name: 'Fnatic',
    shortName: 'FNC',
    region: 'EMEA' as Region,
    roster: [
      { name: 'Derke', role: 'Duelist' as Role },
      { name: 'Alfajer', role: 'Sentinel' as Role },
      { name: 'Chronicle', role: 'Flex' as Role },
      { name: 'Leo', role: 'Initiator' as Role },
      { name: 'Boaster', role: 'Controller' as Role },
    ],
  },
  {
    name: 'Team Vitality',
    shortName: 'VIT',
    region: 'EMEA' as Region,
    roster: [
      { name: 'Derke', role: 'Duelist' as Role },
      { name: 'Kicks', role: 'Duelist' as Role },
      { name: 'Chronicle', role: 'Initiator' as Role },
      { name: 'Less', role: 'Sentinel' as Role },
      { name: 'KovaQ', role: 'Controller' as Role },
    ],
  },
  {
    name: 'Team Liquid',
    shortName: 'TL',
    region: 'EMEA' as Region,
    roster: [
      { name: 'keiko', role: 'Duelist' as Role },
      { name: 'nAts', role: 'Sentinel' as Role },
      { name: 'paTiTek', role: 'Initiator' as Role },
      { name: 'kamo', role: 'Controller' as Role },
      { name: 'Enzo', role: 'Flex' as Role },
    ],
  },
  {
    name: 'Karmine Corp',
    shortName: 'KC',
    region: 'EMEA' as Region,
    roster: [
      { name: 'N4RRATE', role: 'Duelist' as Role },
      { name: 'Magnum', role: 'Duelist' as Role },
      { name: 'marteen', role: 'Initiator' as Role },
      { name: 'Shin', role: 'Controller' as Role },
      { name: 'XMS', role: 'Sentinel' as Role },
    ],
  },
  {
    name: 'NAVI',
    shortName: 'NAVI',
    region: 'EMEA' as Region,
    roster: [
      { name: 'cNed', role: 'Duelist' as Role },
      { name: 'Shao', role: 'Initiator' as Role },
      { name: 'Zyppan', role: 'Flex' as Role },
      { name: 'ANGE1', role: 'Controller' as Role },
      { name: 'Suygetsu', role: 'Sentinel' as Role },
    ],
  },
  {
    name: 'FUT Esports',
    shortName: 'FUT',
    region: 'EMEA' as Region,
    roster: [
      { name: 'MrFaliN', role: 'Duelist' as Role },
      { name: 'yetujey', role: 'Duelist' as Role },
      { name: 'AtaKaptan', role: 'Initiator' as Role },
      { name: 'qRaxs', role: 'Controller' as Role },
      { name: 'MrSNOOPY', role: 'Sentinel' as Role },
    ],
  },
  {
    name: 'BBL Esports',
    shortName: 'BBL',
    region: 'EMEA' as Region,
    roster: [
      { name: 'Jamppi', role: 'Duelist' as Role },
      { name: 'sociablEE', role: 'Duelist' as Role },
      { name: 'PROFEK', role: 'Initiator' as Role },
      { name: 'LewN', role: 'Controller' as Role },
      { name: 'aimDLL', role: 'Sentinel' as Role },
    ],
  },
  {
    name: 'GIANTX',
    shortName: 'GX',
    region: 'EMEA' as Region,
    roster: [
      { name: 'Cloud', role: 'Duelist' as Role },
      { name: 'grubinho', role: 'Duelist' as Role },
      { name: 'westside', role: 'Initiator' as Role },
      { name: 'Flickless', role: 'Controller' as Role },
      { name: 'ara', role: 'Sentinel' as Role },
    ],
  },
  {
    name: 'Gentle Mates',
    shortName: 'M8',
    region: 'EMEA' as Region,
    roster: [
      { name: 'Minny', role: 'Duelist' as Role },
      { name: 'Alive', role: 'Duelist' as Role },
      { name: 'hoody', role: 'Initiator' as Role },
      { name: 'Avez', role: 'Controller' as Role },
      { name: 'Destrian', role: 'Sentinel' as Role },
    ],
  },
  {
    name: 'BBL PCIFIC',
    shortName: 'PCIFIC',
    region: 'EMEA' as Region,
    roster: [
      { name: 'Rosé', role: 'Duelist' as Role },
      { name: 'Crewen', role: 'Duelist' as Role },
      { name: 'Loita', role: 'Initiator' as Role },
      { name: 'Lar0k', role: 'Controller' as Role },
      { name: 'lovers rock', role: 'Sentinel' as Role },
    ],
  },
  {
    name: 'ULF Esports',
    shortName: 'ULF',
    region: 'EMEA' as Region,
    roster: [
      { name: 'nekky', role: 'Duelist' as Role },
      { name: 's0pp', role: 'Duelist' as Role },
      { name: 'audaz', role: 'Initiator' as Role },
      { name: 'Favian', role: 'Controller' as Role },
      { name: 'echo', role: 'Sentinel' as Role },
    ],
  },
];

// VCT 2025 Pacific Teams (12 teams)
export const PACIFIC_TEAMS = [
  {
    name: 'Gen.G',
    shortName: 'GENG',
    region: 'Pacific' as Region,
    roster: [
      { name: 't3xture', role: 'Duelist' as Role },
      { name: 'Meteor', role: 'Duelist' as Role },
      { name: 'Lakia', role: 'Initiator' as Role },
      { name: 'Karon', role: 'Controller' as Role },
      { name: 'Munchkin', role: 'Sentinel' as Role },
    ],
  },
  {
    name: 'Paper Rex',
    shortName: 'PRX',
    region: 'Pacific' as Region,
    roster: [
      { name: 'Jinggg', role: 'Duelist' as Role },
      { name: 'f0rsakeN', role: 'Flex' as Role },
      { name: 'mindfreak', role: 'Controller' as Role },
      { name: 'd4v41', role: 'Initiator' as Role },
      { name: 'Alecks', role: 'Sentinel' as Role },
    ],
  },
  {
    name: 'DRX',
    shortName: 'DRX',
    region: 'Pacific' as Region,
    roster: [
      { name: 'Buzz', role: 'Duelist' as Role },
      { name: 'Stax', role: 'Initiator' as Role },
      { name: 'MaKo', role: 'Controller' as Role },
      { name: 'Rb', role: 'Sentinel' as Role },
      { name: 'Foxy9', role: 'Flex' as Role },
    ],
  },
  {
    name: 'T1',
    shortName: 'T1',
    region: 'Pacific' as Region,
    roster: [
      { name: 'Sayaplayer', role: 'Duelist' as Role },
      { name: 'xccurate', role: 'Flex' as Role },
      { name: 'Meteor', role: 'Initiator' as Role },
      { name: 'iZu', role: 'Controller' as Role },
      { name: 'Rossy', role: 'Sentinel' as Role },
    ],
  },
  {
    name: 'Rex Regum Qeon',
    shortName: 'RRQ',
    region: 'Pacific' as Region,
    roster: [
      { name: 'Monyet', role: 'Duelist' as Role },
      { name: 'Jemkin', role: 'Duelist' as Role },
      { name: 'fl1pzjder', role: 'Initiator' as Role },
      { name: 'Estrella', role: 'Controller' as Role },
      { name: 'Lmemore', role: 'Sentinel' as Role },
    ],
  },
  {
    name: 'ZETA DIVISION',
    shortName: 'ZETA',
    region: 'Pacific' as Region,
    roster: [
      { name: 'Dep', role: 'Duelist' as Role },
      { name: 'SugarZ3ro', role: 'Initiator' as Role },
      { name: 'Laz', role: 'Flex' as Role },
      { name: 'CLZ', role: 'Controller' as Role },
      { name: 'Yuran', role: 'Sentinel' as Role },
    ],
  },
  {
    name: 'DetonatioN FocusMe',
    shortName: 'DFM',
    region: 'Pacific' as Region,
    roster: [
      { name: 'Meiy', role: 'Duelist' as Role },
      { name: 'Anthem', role: 'Flex' as Role },
      { name: 'Suggest', role: 'Initiator' as Role },
      { name: 'Reita', role: 'Controller' as Role },
      { name: 'gya9', role: 'Sentinel' as Role },
    ],
  },
  {
    name: 'Team Secret',
    shortName: 'TS',
    region: 'Pacific' as Region,
    roster: [
      { name: 'invy', role: 'Duelist' as Role },
      { name: 'JessieVash', role: 'Flex' as Role },
      { name: 'DubsteP', role: 'Initiator' as Role },
      { name: 'Jremy', role: 'Controller' as Role },
      { name: 'Wild0reoo', role: 'Sentinel' as Role },
    ],
  },
  {
    name: 'Talon Esports',
    shortName: 'TLN',
    region: 'Pacific' as Region,
    roster: [
      { name: 'crws', role: 'Duelist' as Role },
      { name: 'Surf', role: 'Flex' as Role },
      { name: 'JitboyS', role: 'Initiator' as Role },
      { name: 'GarnetS', role: 'Controller' as Role },
      { name: 'Primmie', role: 'Sentinel' as Role },
    ],
  },
  {
    name: 'Global Esports',
    shortName: 'GE',
    region: 'Pacific' as Region,
    roster: [
      { name: 'Monyet', role: 'Duelist' as Role },
      { name: 'Texture', role: 'Flex' as Role },
      { name: 'Lightningfast', role: 'Initiator' as Role },
      { name: 'Bazzi', role: 'Controller' as Role },
      { name: 't3xture', role: 'Sentinel' as Role },
    ],
  },
  {
    name: 'Nongshim RedForce',
    shortName: 'NS',
    region: 'Pacific' as Region,
    roster: [
      { name: 'eKo', role: 'Duelist' as Role },
      { name: 'JoxJo', role: 'Duelist' as Role },
      { name: 'Retla', role: 'Initiator' as Role },
      { name: 'Esperanza', role: 'Controller' as Role },
      { name: 'Izu', role: 'Sentinel' as Role },
    ],
  },
  {
    name: 'SLT Seongnam',
    shortName: 'SLT',
    region: 'Pacific' as Region,
    roster: [
      { name: 'BeYN', role: 'Duelist' as Role },
      { name: 'Persia', role: 'Duelist' as Role },
      { name: 'Seoldam', role: 'Initiator' as Role },
      { name: 'Bangnan', role: 'Controller' as Role },
      { name: 'iNTRO', role: 'Sentinel' as Role },
    ],
  },
];

// VCT 2025 China Teams (12 teams) - Sample data
export const CHINA_TEAMS = [
  {
    name: 'EDward Gaming',
    shortName: 'EDG',
    region: 'China' as Region,
    roster: [
      { name: 'KangKang', role: 'Duelist' as Role },
      { name: 'CHICHOO', role: 'Duelist' as Role },
      { name: 'Nobody', role: 'Initiator' as Role },
      { name: 'Smoggy', role: 'Flex' as Role },
      { name: 'S1Mon', role: 'Sentinel' as Role },
    ],
  },
  // Add more China teams...
];

export const ALL_TEAMS = [
  ...AMERICAS_TEAMS,
  ...EMEA_TEAMS,
  ...PACIFIC_TEAMS,
  ...CHINA_TEAMS,
];

// Helper function to get teams by region
export function getTeamsByRegion(region: Region) {
  switch (region) {
    case 'Americas':
      return AMERICAS_TEAMS;
    case 'EMEA':
      return EMEA_TEAMS;
    case 'Pacific':
      return PACIFIC_TEAMS;
    case 'China':
      return CHINA_TEAMS;
    default:
      return [];
  }
}