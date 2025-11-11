import { useState } from 'react';
import type { Region, MapResult, Match, Map } from '../types/types';
import MapResultDetails from './MapResultDetails';
import { useGame } from '../hooks/useGame';
import { simulateBestOf3 } from '../utils/matchSimulator';
import './ScheduleView.css';

interface ScheduleViewProps {
  teamName: string;
  region: Region;
}

export default function ScheduleView({ teamName }: ScheduleViewProps) {
  const { schedule, currentWeek, updateMatchResult, advanceWeek } = useGame();
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [selectedMap, setSelectedMap] = useState<MapResult | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const handleSimulateMatch = (matchId: string) => {
    const match = schedule.find(m => m.id === matchId);
    if (!match || match.winner) return;

    // Use a static map pool for simulation (could be made dynamic)
    const mapPool: [Map, Map, Map] = ['Ascent', 'Bind', 'Haven'];
    const results = simulateBestOf3(match.teamA, match.teamB, mapPool);

    const teamAWins = results.filter(r => r.winner === 'teamA').length;
    const teamBWins = results.filter(r => r.winner === 'teamB').length;
    const winner = teamAWins > teamBWins ? match.teamA : match.teamB;

    const updatedMatch = { ...match, maps: results, winner };
    updateMatchResult(matchId, updatedMatch);
    setSelectedMatch(updatedMatch);
  };

  const handleSimulateWeek = async () => {
    setIsSimulating(true);
    
    // Get all matches for the current week that haven't been played
    const weekMatches = schedule.filter(m => m.week === currentWeek && !m.winner);
    
    // Simulate each match with a small delay for visual feedback
    for (const match of weekMatches) {
      await new Promise(resolve => setTimeout(resolve, 300)); // 300ms delay between matches
      handleSimulateMatch(match.id);
    }
    
    setIsSimulating(false);
    
    // Advance to next week after simulation
    advanceWeek();
  };

  const upcomingMatches = schedule.filter(m => !m.winner);
  const completedMatches = schedule.filter(m => m.winner);
  const currentWeekMatches = schedule.filter(m => m.week === currentWeek);
  const currentWeekUnplayed = currentWeekMatches.filter(m => !m.winner).length;

  return (
    <div className="schedule-view">
      <div className="schedule-header">
        <div className="header-content">
          <div>
            <h2>Match Schedule - Stage 1</h2>
            <p className="week-info">Week {currentWeek} • {currentWeekUnplayed} matches remaining</p>
          </div>
          {currentWeekUnplayed > 0 && (
            <button 
              className="simulate-week-button"
              onClick={handleSimulateWeek}
              disabled={isSimulating}
            >
              {isSimulating ? 'Simulating...' : `Simulate Week ${currentWeek}`}
            </button>
          )}
        </div>
      </div>

      <div className="schedule-layout">
        {/* Match List */}
        <div className="match-list">
          {upcomingMatches.length > 0 && (
            <div className="match-section">
              <h3>Upcoming Matches</h3>
              {upcomingMatches.map(match => (
                <div 
                  key={match.id} 
                  className={`match-card ${selectedMatch?.id === match.id ? 'selected' : ''}`}
                  onClick={() => setSelectedMatch(match)}
                >
                  <div className="match-header">
                    <span className="week-label">Week {match.week}</span>
                    <span className="match-status upcoming">Upcoming</span>
                  </div>
                  <div className="match-teams">
                    <div className="team-name">{match.teamA.name}</div>
                    <div className="match-vs">vs</div>
                    <div className="team-name">{match.teamB.name}</div>
                  </div>
                  <button 
                    className="simulate-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSimulateMatch(match.id);
                    }}
                  >
                    Simulate Match
                  </button>
                </div>
              ))}
            </div>
          )}

          {completedMatches.length > 0 && (
            <div className="match-section">
              <h3>Completed Matches</h3>
              {completedMatches.map(match => (
                <div 
                  key={match.id} 
                  className={`match-card completed ${selectedMatch?.id === match.id ? 'selected' : ''}`}
                  onClick={() => setSelectedMatch(match)}
                >
                  <div className="match-header">
                    <span className="week-label">Week {match.week}</span>
                    <span className={`match-status ${match.winner?.name === teamName ? 'win' : 'loss'}`}>
                      {match.winner?.name === teamName ? 'Win' : 'Loss'}
                    </span>
                  </div>
                  <div className="match-teams">
                    <div className={`team-name ${match.winner?.name === match.teamA.name ? 'winner' : ''}`}>
                      {match.teamA.name}
                    </div>
                    <div className="match-score">
                      {getMatchScore(match.maps, 'teamA')} - {getMatchScore(match.maps, 'teamB')}
                    </div>
                    <div className={`team-name ${match.winner?.name === match.teamB.name ? 'winner' : ''}`}>
                      {match.teamB.name}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Match Details Panel */}
        <div className="match-details">
          {selectedMatch ? (
            <>
              <div className="details-header">
                <h2>Match Details</h2>
                <span className="week-label">Week {selectedMatch.week}</span>
              </div>

              <div className="matchup">
                <div className="matchup-team">
                  <h3>{selectedMatch.teamA.name}</h3>
                </div>
                <div className="matchup-vs">VS</div>
                <div className="matchup-team">
                  <h3>{selectedMatch.teamB.name}</h3>
                </div>
              </div>

              {!selectedMatch.winner ? (
                <div className="not-simulated">
                  <p>This match has not been played yet.</p>
                  <button 
                    className="simulate-button-large"
                    onClick={() => handleSimulateMatch(selectedMatch.id)}
                  >
                    Simulate Match
                  </button>
                </div>
              ) : (
                <div className="match-results">
                  <div className="final-score">
                    <span className={selectedMatch.winner?.name === selectedMatch.teamA.name ? 'winner' : ''}>
                      {selectedMatch.teamA.name}
                    </span>
                    <span className="score">
                      {getMatchScore(selectedMatch.maps || [], 'teamA')} - {getMatchScore(selectedMatch.maps || [], 'teamB')}
                    </span>
                    <span className={selectedMatch.winner?.name === selectedMatch.teamB.name ? 'winner' : ''}>
                      {selectedMatch.teamB.name}
                    </span>
                  </div>

                  <div className="map-results">
                    <h4>Map Results</h4>
                    {selectedMatch.maps?.map((mapResult, idx) => (
                      <div
                        key={idx}
                        className={`map-result-card ${selectedMap?.map === mapResult.map ? 'selected' : ''}`}
                        onClick={() => setSelectedMap(selectedMap?.map === mapResult.map ? null : mapResult)}
                      >
                        <div className="map-result-header">
                          <span className="map-name">{mapResult.map}</span>
                          <span className={`map-winner ${mapResult.winner === 'teamA' ? 'team-a' : 'team-b'}`}>
                            {mapResult.winner === 'teamA' ? selectedMatch.teamA.name : selectedMatch.teamB.name}
                          </span>
                        </div>
                        <div className="map-score">
                          {mapResult.teamAScore} - {mapResult.teamBScore}
                          {mapResult.overtime && <span className="overtime-badge">OT</span>}
                        </div>
                      </div>
                    ))}
                  </div>

                  {selectedMap && (
                    <MapResultDetails
                      mapResult={selectedMap}
                      teamAName={selectedMatch.teamA.name}
                      teamBName={selectedMatch.teamB.name}
                    />
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="no-selection">
              <p>Select a match to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function getMatchScore(results: MapResult[], team: 'teamA' | 'teamB'): number {
  return results.filter(r => r.winner === team).length;
}