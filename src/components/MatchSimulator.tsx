import { useState } from 'react';
import type { Match, Map } from '../types/types';
import { useGame } from '../hooks/useGame';
import { simulateBestOf3 } from '../utils/matchSimulator';
import styles from './MatchSimulator.module.css';

interface MatchSimulatorProps {
  match: Match;
  onClose: () => void;
}

export default function MatchSimulator({ match, onClose }: MatchSimulatorProps) {
  const { updateMatchResult } = useGame();
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationComplete, setSimulationComplete] = useState(false);
  const [result, setResult] = useState<Match | null>(null);

  const handleSimulate = () => {
    setIsSimulating(true);
    
    // Simulate with a slight delay for UX
    setTimeout(() => {
      // Pick maps for the match (in real version, this could be from map veto)
      const maps: [Map, Map, Map] = ['Ascent', 'Bind', 'Haven'];
      
      // Run simulation
      const mapResults = simulateBestOf3(match.teamA, match.teamB, maps);
      
      // Calculate winner
      const teamAWins = mapResults.filter(m => m.winner === 'teamA').length;
      const teamBWins = mapResults.filter(m => m.winner === 'teamB').length;
      const winner = teamAWins > teamBWins ? match.teamA : match.teamB;
      
      // Create updated match
      const updatedMatch: Match = {
        ...match,
        maps: mapResults,
        winner,
      };
      
      setResult(updatedMatch);
      setIsSimulating(false);
      setSimulationComplete(true);
      
      // Update the match in game state
      updateMatchResult(match.id, updatedMatch);
    }, 1000);
  };

  const handleClose = () => {
    onClose();
  };

  if (simulationComplete && result) {
    const teamAWins = result.maps.filter(m => m.winner === 'teamA').length;
    const teamBWins = result.maps.filter(m => m.winner === 'teamB').length;
    
    return (
      <div className={styles['match-simulator']}>
        <h3>Match Result</h3>
        
        <div className={styles['match-result']}>
          <div className={styles['team-result']}>
            <h4>{result.teamA.name}</h4>
            <span className={`${styles['score']} ${teamAWins > teamBWins ? styles.winner : ''}`}>
              {teamAWins}
            </span>
          </div>
          
          <span className={styles['vs']}>-</span>
          
          <div className={styles['team-result']}>
            <h4>{result.teamB.name}</h4>
            <span className={`${styles['score']} ${teamBWins > teamAWins ? styles.winner : ''}`}>
              {teamBWins}
            </span>
          </div>
        </div>

        <div className={styles['map-results']}>
          <h4>Map Breakdown</h4>
          {result.maps.map((mapResult, idx) => (
            <div key={idx} className={styles['map-result']}>
              <span className={styles['map-name']}>{mapResult.map}</span>
              <div className={styles['map-score']}>
                <span className={mapResult.winner === 'teamA' ? styles.winner : ''}>
                  {mapResult.teamAScore}
                </span>
                <span>-</span>
                <span className={mapResult.winner === 'teamB' ? styles.winner : ''}>
                  {mapResult.teamBScore}
                </span>
              </div>
              {mapResult.overtime && (
                <span className={styles['overtime-badge']}>OT</span>
              )}
            </div>
          ))}
        </div>

        <div className={styles['actions']}>
          <button className={styles['close-button']} onClick={handleClose}>
            Continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles['match-simulator']}>
      <h3>Simulate Match</h3>
      
      <div className={styles['match-preview']}>
        <div className={styles['team-preview']}>
          <h4>{match.teamA.name}</h4>
          <span className={styles['team-short']}>{match.teamA.shortName}</span>
        </div>
        
        <span className={styles['vs']}>VS</span>
        
        <div className={styles['team-preview']}>
          <h4>{match.teamB.name}</h4>
          <span className={styles['team-short']}>{match.teamB.shortName}</span>
        </div>
      </div>

      <div className={styles['actions']}>
        {!isSimulating ? (
          <>
            <button 
              className={styles['simulate-button']} 
              onClick={handleSimulate}
            >
              Run Simulation
            </button>
            <button 
              className={styles['cancel-button']} 
              onClick={handleClose}
            >
              Cancel
            </button>
          </>
        ) : (
          <div className={styles['simulating']}>
            <div className={styles['spinner']} />
            <span>Simulating match...</span>
          </div>
        )}
      </div>
    </div>
  );
}