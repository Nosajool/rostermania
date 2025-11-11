import { useState, useEffect } from 'react'
import type { Region } from './types/types'
import TeamSelection from './components/TeamSelection'
import Dashboard from './components/Dashboard'
import { GameProvider, useGame } from './hooks/useGame'
import './App.css'

function AppContent() {
  const { playerTeam, region, initializeGame } = useGame();
  const [showTeamSelection, setShowTeamSelection] = useState(!playerTeam);

  useEffect(() => {
    setShowTeamSelection(!playerTeam);
  }, [playerTeam]);

  const handleTeamSelected = (teamName: string, selectedRegion: Region) => {
    initializeGame(teamName, selectedRegion);
    setShowTeamSelection(false);
  };

  return (
    <div className="app">
      {showTeamSelection ? (
        <TeamSelection onTeamSelected={handleTeamSelected} />
      ) : (
        playerTeam && region && (
          <Dashboard teamName={playerTeam.name} region={region} />
        )
      )}
    </div>
  );
}

function App() {
  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  );
}

export default App