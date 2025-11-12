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
      
      // Add player to roster
      const updatedRoster = [...prev.playerTeam.roster, { ...player, teamId: prev.playerTeam!.name }];
      
      return {
        ...prev,
        playerTeam: {
          ...prev.playerTeam,
          roster: updatedRoster,
        },
      };
    });
  };

  const releasePlayer = (playerId: string) => {
    setGameState(prev => {
      if (!prev.playerTeam) return prev;
      
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

  return (
    <GameContext.Provider value={{
      ...gameState,
      initializeGame,
      updateMatchResult,
      advanceWeek,
      resetGame,
      signFreeAgent,
      releasePlayer,
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