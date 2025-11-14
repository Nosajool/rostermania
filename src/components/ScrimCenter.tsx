import { useState } from 'react';
import type { 
  Player, 
  Map, 
  Agent, 
  ScrimObjective, 
  ScrimOpponent,
  ScrimComposition,
  ScrimSession,
} from '../types/types';
import { useGame } from '../hooks/useGame';
import { 
  generateScrimOpponents, 
  simulateScrim,
  getObjectiveLabel,
  getObjectiveDescription,
} from '../utils/scrimSimulator';
import { MAPS, AGENTS } from '../data/gameData';
import './ScrimCenter.css';

type ScrimStep = 'select_map' | 'select_opponent' | 'select_composition' | 'select_objective' | 'confirm';

export default function ScrimCenter() {
  const { playerTeam, allTeams, schedule, currentWeek, completeScrim, weeklyScrimData } = useGame();
  const [currentStep, setCurrentStep] = useState<ScrimStep>('select_map');
  
  // Scrim configuration state
  const [selectedMap, setSelectedMap] = useState<Map | null>(null);
  const [selectedOpponent, setSelectedOpponent] = useState<ScrimOpponent | null>(null);
  const [selectedObjective, setSelectedObjective] = useState<ScrimObjective>('macro_play');
  const [composition, setComposition] = useState<ScrimComposition[]>([]);
  
  // Results
  const [showResults, setShowResults] = useState(false);
  const [lastResult, setLastResult] = useState<any>(null);

  const MAX_SCRIMS_PER_WEEK = 5;

  if (!playerTeam) return <div>Loading...</div>;

  // Generate available opponents
  const availableOpponents = generateScrimOpponents(
    allTeams,
    playerTeam.name,
    schedule,
    currentWeek
  );

  // Get available players (active + reserve)
  const availablePlayers = playerTeam.roster;

  const handleMapSelect = (map: Map) => {
    setSelectedMap(map);
    setCurrentStep('select_opponent');
  };

  const handleOpponentSelect = (opponent: ScrimOpponent) => {
    setSelectedOpponent(opponent);
    setCurrentStep('select_composition');
  };

  const handlePlayerSelect = (player: Player) => {
    if (composition.length >= 5) return;
    
    // Default agent selection (first agent in pool or best proficiency)
    const agents = Object.keys(player.agentPool) as Agent[];
    const bestAgent = agents.reduce((best, agent) => {
      const proficiency = player.agentPool[agent] || 0;
      const bestProf = player.agentPool[best] || 0;
      return proficiency > bestProf ? agent : best;
    }, agents[0]);
    
    setComposition([...composition, {
      playerId: player.id,
      playerName: player.name,
      agent: bestAgent,
    }]);
  };

  const handleRemovePlayer = (playerId: string) => {
    setComposition(composition.filter(c => c.playerId !== playerId));
  };

  const handleAgentChange = (playerId: string, agent: Agent) => {
    setComposition(composition.map(c => 
      c.playerId === playerId ? { ...c, agent } : c
    ));
  };

  const handleStartScrim = () => {
    if (!selectedMap || !selectedOpponent || composition.length !== 5) return;
    
    const session: ScrimSession = {
      id: `scrim-${Date.now()}`,
      week: currentWeek,
      date: new Date(),
      map: selectedMap,
      objective: selectedObjective,
      opponent: selectedOpponent,
      composition,
    };
    
    const result = simulateScrim(session, playerTeam);
    completeScrim(result);
    setLastResult(result);
    setShowResults(true);
  };

  const handleReset = () => {
    setCurrentStep('select_map');
    setSelectedMap(null);
    setSelectedOpponent(null);
    setComposition([]);
    setShowResults(false);
    setLastResult(null);
  };

  const objectives: ScrimObjective[] = [
    'macro_play',
    'site_retakes',
    'site_executes',
    'utility_usage',
    'lurk_timings',
    'defense_setups',
    'communication',
    'trading',
    'map_control',
  ];

  const scrimsThisWeek = weeklyScrimData?.scrimsCompleted || 0;

  if (showResults && lastResult) {
    return (
      <div className="scrim-center">
        <div className="scrim-header">
          <h2>Scrim Results</h2>
          <div className="scrims-remaining">
            {scrimsThisWeek} / {MAX_SCRIMS_PER_WEEK} Scrims Used This Week
          </div>
        </div>

        <div className="scrim-results">
          <div className="result-header">
            <h3>Practice Session Complete</h3>
            <div className="quality-rating">
              Quality Rating: <span className={`rating ${getQualityClass(lastResult.qualityRating)}`}>
                {lastResult.qualityRating}/100
              </span>
            </div>
          </div>

          <div className="result-feedback">
            <p>{lastResult.feedback}</p>
          </div>

          <div className="result-section">
            <h4>Team Improvements</h4>
            <div className="improvement-grid">
              <div className="improvement-card">
                <span className="improvement-label">Map Proficiency ({selectedMap})</span>
                <span className="improvement-value">+{lastResult.teamMapProficiency}</span>
              </div>
              <div className="improvement-card">
                <span className="improvement-label">{getObjectiveLabel(selectedObjective)}</span>
                <span className="improvement-value">+{lastResult.objectiveProficiency}</span>
              </div>
            </div>
          </div>

          <div className="result-section">
            <h4>Player Development</h4>
            <div className="player-improvements">
              {lastResult.playerImprovements.map((imp: any) => (
                <div key={imp.playerId} className="player-improvement-card">
                  <h5>{imp.playerName}</h5>
                  
                  {imp.agentProficiency > 0 && (
                    <div className="stat-gain">
                      <span>Agent Proficiency:</span>
                      <span className="gain-value">+{imp.agentProficiency}</span>
                    </div>
                  )}
                  
                  {Object.keys(imp.statImprovements).length > 0 && (
                    <div className="stat-gains">
                      {Object.entries(imp.statImprovements).map(([stat, value]: [string, any]) => (
                        <div key={stat} className="stat-gain">
                          <span>{stat}:</span>
                          <span className="gain-value">+{value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {imp.synergyGains.length > 0 && (
                    <div className="synergy-gains">
                      <span>Synergy Improvements:</span>
                      {imp.synergyGains.map((syn: any) => {
                        const teammate = composition.find(c => c.playerId === syn.playerId);
                        return (
                          <div key={syn.playerId} className="synergy-gain">
                            <span>{teammate?.playerName}</span>
                            <span className="gain-value">+{syn.change}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="result-actions">
            <button className="primary-button" onClick={handleReset}>
              {scrimsThisWeek < MAX_SCRIMS_PER_WEEK ? 'Schedule Another Scrim' : 'Back to Training'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="scrim-center">
      <div className="scrim-header">
        <h2>Scrim Center</h2>
        <div className="scrims-remaining">
          {scrimsThisWeek} / {MAX_SCRIMS_PER_WEEK} Scrims Used This Week
        </div>
      </div>

      {scrimsThisWeek >= MAX_SCRIMS_PER_WEEK && (
        <div className="warning-banner">
          You've reached the maximum scrims for this week. Complete matches to advance to next week.
        </div>
      )}

      <div className="scrim-stepper">
        <div className={`step ${currentStep === 'select_map' ? 'active' : ''} ${selectedMap ? 'completed' : ''}`}>
          1. Map
        </div>
        <div className={`step ${currentStep === 'select_opponent' ? 'active' : ''} ${selectedOpponent ? 'completed' : ''}`}>
          2. Opponent
        </div>
        <div className={`step ${currentStep === 'select_composition' ? 'active' : ''} ${composition.length === 5 ? 'completed' : ''}`}>
          3. Roster
        </div>
        <div className={`step ${currentStep === 'select_objective' ? 'active' : ''}`}>
          4. Objective
        </div>
      </div>

      {/* Step 1: Map Selection */}
      {currentStep === 'select_map' && (
        <div className="step-content">
          <h3>Select Practice Map</h3>
          <p className="step-description">Choose which map your team will practice on</p>
          <div className="map-grid">
            {MAPS.map(map => (
              <div
                key={map}
                className={`map-card ${selectedMap === map ? 'selected' : ''}`}
                onClick={() => handleMapSelect(map)}
              >
                <div className="map-name">{map}</div>
                <div className="map-prof">
                  Team Proficiency: {playerTeam.mapPracticeLevel?.[map] || 50}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Opponent Selection */}
      {currentStep === 'select_opponent' && (
        <div className="step-content">
          <div className="step-header">
            <button className="back-button" onClick={() => setCurrentStep('select_map')}>← Back</button>
            <h3>Select Practice Opponent</h3>
          </div>
          <p className="step-description">Higher quality opponents provide better training</p>
          <div className="opponent-list">
            {availableOpponents.map(opponent => (
              <div
                key={opponent.teamId}
                className={`opponent-card ${selectedOpponent?.teamId === opponent.teamId ? 'selected' : ''}`}
                onClick={() => handleOpponentSelect(opponent)}
              >
                <div className="opponent-info">
                  <h4>{opponent.teamName}</h4>
                  <span className="opponent-region">{opponent.region}</span>
                </div>
                <div className="opponent-stats">
                  <div className="opponent-stat">
                    <span className="stat-label">Quality</span>
                    <span className={`stat-value ${getQualityClass(opponent.scrimQuality)}`}>
                      {opponent.scrimQuality}
                    </span>
                  </div>
                  {selectedMap && (
                    <div className="opponent-stat">
                      <span className="stat-label">{selectedMap}</span>
                      <span className="stat-value">
                        {opponent.mapStrengths[selectedMap] || 50}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          <button 
            className="continue-button"
            disabled={!selectedOpponent}
            onClick={() => setCurrentStep('select_composition')}
          >
            Continue to Roster Selection
          </button>
        </div>
      )}

      {/* Step 3: Composition */}
      {currentStep === 'select_composition' && (
        <div className="step-content">
          <div className="step-header">
            <button className="back-button" onClick={() => setCurrentStep('select_opponent')}>← Back</button>
            <h3>Select Team Composition</h3>
          </div>
          <p className="step-description">Choose 5 players and their agents ({composition.length}/5 selected)</p>
          
          <div className="composition-layout">
            <div className="player-selection">
              <h4>Available Players</h4>
              <div className="player-list">
                {availablePlayers
                  .filter(p => !composition.find(c => c.playerId === p.id))
                  .map(player => (
                    <div
                      key={player.id}
                      className={`player-select-card ${composition.length >= 5 ? 'disabled' : ''}`}
                      onClick={() => handlePlayerSelect(player)}
                    >
                      <div className="player-info">
                        <h5>{player.name}</h5>
                        <span className="player-role">{player.role}</span>
                        {player.status === 'reserve' && <span className="reserve-badge">Reserve</span>}
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            <div className="selected-composition">
              <h4>Team Composition</h4>
              {composition.length === 0 ? (
                <p className="empty-message">Select 5 players for the scrim</p>
              ) : (
                <div className="composition-list">
                  {composition.map(comp => {
                    const player = availablePlayers.find(p => p.id === comp.playerId)!;
                    const playerAgents = Object.keys(player.agentPool) as Agent[];
                    
                    return (
                      <div key={comp.playerId} className="composition-card">
                        <div className="comp-player-info">
                          <h5>{comp.playerName}</h5>
                          <span className="comp-role">{player.role}</span>
                        </div>
                        <div className="agent-selector">
                          <label>Agent:</label>
                          <select 
                            value={comp.agent}
                            onChange={(e) => handleAgentChange(comp.playerId, e.target.value as Agent)}
                          >
                            {playerAgents.map(agent => (
                              <option key={agent} value={agent}>
                                {agent} ({player.agentPool[agent]})
                              </option>
                            ))}
                          </select>
                        </div>
                        <button 
                          className="remove-button"
                          onClick={() => handleRemovePlayer(comp.playerId)}
                        >
                          Remove
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
          
          <button 
            className="continue-button"
            disabled={composition.length !== 5}
            onClick={() => setCurrentStep('select_objective')}
          >
            Continue to Objective Selection
          </button>
        </div>
      )}

      {/* Step 4: Objective */}
      {currentStep === 'select_objective' && (
        <div className="step-content">
          <div className="step-header">
            <button className="back-button" onClick={() => setCurrentStep('select_composition')}>← Back</button>
            <h3>Select Practice Objective</h3>
          </div>
          <p className="step-description">Focus your practice on specific aspects of gameplay</p>
          
          <div className="objective-grid">
            {objectives.map(objective => (
              <div
                key={objective}
                className={`objective-card ${selectedObjective === objective ? 'selected' : ''}`}
                onClick={() => setSelectedObjective(objective)}
              >
                <h4>{getObjectiveLabel(objective)}</h4>
                <p>{getObjectiveDescription(objective)}</p>
                {selectedOpponent && (
                  <div className="opponent-strength">
                    Opponent Strength: {selectedOpponent.objectiveStrengths[objective] || 50}/100
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="scrim-summary">
            <h4>Scrim Summary</h4>
            <div className="summary-grid">
              <div><strong>Map:</strong> {selectedMap}</div>
              <div><strong>Opponent:</strong> {selectedOpponent?.teamName}</div>
              <div><strong>Players:</strong> {composition.length}</div>
              <div><strong>Objective:</strong> {getObjectiveLabel(selectedObjective)}</div>
            </div>
          </div>

          <button 
            className="start-button"
            disabled={scrimsThisWeek >= MAX_SCRIMS_PER_WEEK}
            onClick={handleStartScrim}
          >
            Start Scrim
          </button>
        </div>
      )}
    </div>
  );
}

function getQualityClass(quality: number): string {
  if (quality >= 80) return 'excellent';
  if (quality >= 60) return 'good';
  if (quality >= 40) return 'average';
  return 'poor';
}