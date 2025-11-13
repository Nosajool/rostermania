import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Match, Team, Region } from '../types/types';
import { generateSchedule, getCachedTeam } from '../utils/teamUtils';

interface GameState {
  playerTeam: Team | null;
  region: Region | null;
  allTeams: Team[];
  schedule: Match[];
  currentWeek: number;
  currentStage: 'Stage 1' | 'Stage 2' | 'Playoffs';
}

interface GameContextType extends GameState {
  initializeGame: (teamName: string, region: Region) => void;
  updateMatchResult: (matchId: string, updatedMatch: Match) => void;
  advanceWeek: () => void;
  resetGame: () => void;
  signFreeAgent: (player: Player) => void;
  releasePlayer: (playerId: string) => void;
  moveToReserve: (playerId: string) => void;
  moveToActive: (playerId: string) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

const STORAGE_KEY = 'vct-manager-game-state';

export function GameProvider({ children }: { children: ReactNode }) {
  const [gameState, setGameState] = useState<GameState>(() => {
    // Load from localStorage on mount
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to load game state:', e);
      }
    }
    return {
      playerTeam: null,
      region: null,
      allTeams: [],
      schedule: [],
      currentWeek: 1,
      currentStage: 'Stage 1',
    };
  });

  // Save to localStorage whenever state changes
  useEffect(() => {
    if (gameState.playerTeam) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
    }
  }, [gameState]);

  const initializeGame = (teamName: string, region: Region) => {
    const { teams, schedule } = generateSchedule(region);
    const playerTeam = getCachedTeam(teamName, region);

    setGameState({
      playerTeam,
      region,
      allTeams: teams,
      schedule,
      currentWeek: 1,
      currentStage: 'Stage 1',
    });
  };

  const updateMatchResult = (matchId: string, updatedMatch: Match) => {
    setGameState(prev => ({
      ...prev,
      schedule: prev.schedule.map(m => 
        m.id === matchId ? updatedMatch : m
      ),
    }));
  };

  const advanceWeek = () => {
    setGameState(prev => ({
      ...prev,
      currentWeek: prev.currentWeek + 1,
    }));
  };

  const resetGame = () => {
    localStorage.removeItem(STORAGE_KEY);
    setGameState({
      playerTeam: null,
      region: null,
      allTeams: [],
      schedule: [],
      currentWeek: 1,
      currentStage: 'Stage 1',
    });
  };

  const signFreeAgent = (player: Player) => {
    setGameState(prev => {
      if (!prev.playerTeam) return prev;
      
      // Check roster limit (5 active + 3 reserve = 8 total)
      if (prev.playerTeam.roster.length >= 8) {
        alert('Roster is full (8 players maximum)!');
        return prev;
      }
      
      // New signings default to reserve unless roster has less than 5 active players
      const activePlayers = prev.playerTeam.roster.filter(p => p.status !== 'reserve').length;
      const status = activePlayers < 5 ? 'active' : 'reserve';
      
      // Add player to roster
      const updatedRoster = [...prev.playerTeam.roster, { 
        ...player, 
        teamId: prev.playerTeam!.name,
        status 
      }];
      
      const updatedPlayerTeam = {
        ...prev.playerTeam,
        roster: updatedRoster,
      };
      
      // Update the team in allTeams and schedule
      const updatedAllTeams = prev.allTeams.map(t => 
        t.name === prev.playerTeam!.name ? updatedPlayerTeam : t
      );
      
      const updatedSchedule = prev.schedule.map(match => ({
        ...match,
        teamA: match.teamA.name === prev.playerTeam!.name ? updatedPlayerTeam : match.teamA,
        teamB: match.teamB.name === prev.playerTeam!.name ? updatedPlayerTeam : match.teamB,
      }));
      
      return {
        ...prev,
        playerTeam: updatedPlayerTeam,
        allTeams: updatedAllTeams,
        schedule: updatedSchedule,
      };
    });
  };

  const releasePlayer = (playerId: string) => {
    setGameState(prev => {
      if (!prev.playerTeam) return prev;
      
      const player = prev.playerTeam.roster.find(p => p.id === playerId);
      
      // Can only release reserve players
      if (player?.status !== 'reserve') {
        alert('You can only release reserve players. Move them to reserve first.');
        return prev;
      }
      
      // Remove player from roster
      const updatedRoster = prev.playerTeam.roster.filter(p => p.id !== playerId);
      
      return {
        ...prev,
        playerTeam: {
          ...prev.playerTeam,
          roster: updatedRoster,
        },
      };
    });
  };

  const moveToReserve = (playerId: string) => {
    setGameState(prev => {
      if (!prev.playerTeam) return prev;
      
      const player = prev.playerTeam.roster.find(p => p.id === playerId);
      
      // Check if player is already reserve
      if (player?.status === 'reserve') {
        return prev;
      }
      
      const activePlayers = prev.playerTeam.roster.filter(p => p.status !== 'reserve');
      const reservePlayers = prev.playerTeam.roster.filter(p => p.status === 'reserve');
      
      // Check if reserve is full
      if (reservePlayers.length >= 3) {
        alert('Reserve is full (3 players maximum)! Move a reserve player to active first.');
        return prev;
      }
      
      const updatedRoster = prev.playerTeam.roster.map(p =>
        p.id === playerId ? { ...p, status: 'reserve' as const } : p
      );
      
      return {
        ...prev,
        playerTeam: {
          ...prev.playerTeam,
          roster: updatedRoster,
        },
      };
    });
  };

  const moveToActive = (playerId: string) => {
    setGameState(prev => {
      if (!prev.playerTeam) return prev;
      
      const player = prev.playerTeam.roster.find(p => p.id === playerId);
      
      // Check if player is already active
      if (player?.status !== 'reserve') {
        return prev;
      }
      
      const activePlayers = prev.playerTeam.roster.filter(p => p.status !== 'reserve');
      
      // Check if active roster is full
      if (activePlayers.length >= 5) {
        alert('Active roster is full (5 players maximum)! Move a player to reserve first.');
        return prev;
      }
      
      const updatedRoster = prev.playerTeam.roster.map(p =>
        p.id === playerId ? { ...p, status: 'active' as const } : p
      );
      
      return {
        ...prev,
        playerTeam: {
          ...prev.playerTeam,
          roster: updatedRoster,
        },
      };
    });
  };

  return (
    <GameContext.Provider value={{
      ...gameState,
      initializeGame,
      updateMatchResult,
      advanceWeek,
      resetGame,
      signFreeAgent,
      releasePlayer,
      moveToReserve,
      moveToActive,
    }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}