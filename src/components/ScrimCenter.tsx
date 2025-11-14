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
import styles from './ScrimCenter.module.css';

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
      <div className={styles['scrim-center']}>
        <div className={styles['scrim-header']}>
          <h2>Scrim Results</h2>
          <div className={styles['scrims-remaining']}>
            {scrimsThisWeek} / {MAX_SCRIMS_PER_WEEK} Scrims Used This Week
          </div>
        </div>

        <div className={styles['scrim-results']}>
          <div className={styles['result-header']}>
            <h3>Practice Session Complete</h3>
            <div className={styles['quality-rating']}>
              Quality Rating: <span className={`${styles.rating} ${styles[getQualityClass(lastResult.qualityRating)]}`}>
                {lastResult.qualityRating}/100
              </span>
            </div>
          </div>

          <div className={styles['result-feedback']}>
            <p>{lastResult.feedback}</p>
          </div>

          <div className={styles['result-section']}>
            <h4>Team Improvements</h4>
            <div className={styles['improvement-grid']}>
              <div className={styles['improvement-card']}>
                <span className={styles['improvement-label']}>Map Proficiency ({selectedMap})</span>
                <span className={styles['improvement-value']}>+{lastResult.teamMapProficiency}</span>
              </div>
              <div className={styles['improvement-card']}>
                <span className={styles['improvement-label']}>{getObjectiveLabel(selectedObjective)}</span>
                <span className={styles['improvement-value']}>+{lastResult.objectiveProficiency}</span>
              </div>
            </div>
          </div>

          <div className={styles['result-section']}>
            <h4>Player Development</h4>
            <div className={styles['player-improvements']}>
              {lastResult.playerImprovements.map((imp: any) => (
                <div key={imp.playerId} className={styles['player-improvement-card']}>
                  <h5>{imp.playerName}</h5>
                  
                  {imp.agentProficiency > 0 && (
                    <div className={styles['stat-gain']}>
                      <span>Agent Proficiency:</span>
                      <span className={styles['gain-value']}>+{imp.agentProficiency}</span>
                    </div>
                  )}
                  
                  {Object.keys(imp.statImprovements).length > 0 && (
                    <div className={styles['stat-gains']}>
                      {Object.entries(imp.statImprovements).map(([stat, value]: [string, any]) => (
                        <div key={stat} className={styles['stat-gain']}>
                          <span>{stat}:</span>
                          <span className={styles['gain-value']}>+{value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {imp.synergyGains.length > 0 && (
                    <div className={styles['synergy-gains']}>
                      <span>Synergy Improvements:</span>
                      {imp.synergyGains.map((syn: any) => {
                        const teammate = composition.find(c => c.playerId === syn.playerId);
                        return (
                          <div key={syn.playerId} className={styles['synergy-gain']}>
                            <span>{teammate?.playerName}</span>
                            <span className={styles['gain-value']}>+{syn.change}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className={styles['result-actions']}>
            <button className={styles['primary-button']} onClick={handleReset}>
              {scrimsThisWeek < MAX_SCRIMS_PER_WEEK ? 'Schedule Another Scrim' : 'Back to Training'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles['scrim-center']}>
      <div className={styles['scrim-header']}>
        <h2>Scrim Center</h2>
        <div className={styles['scrims-remaining']}>
          {scrimsThisWeek} / {MAX_SCRIMS_PER_WEEK} Scrims Used This Week
        </div>
      </div>

      {scrimsThisWeek >= MAX_SCRIMS_PER_WEEK && (
        <div className={styles['warning-banner']}>
          You've reached the maximum scrims for this week. Complete matches to advance to next week.
        </div>
      )}

      <div className={styles['scrim-stepper']}>
        <div className={`${styles.step} ${currentStep === 'select_map' ? styles.active : ''} ${selectedMap ? styles.completed : ''}`}>
          1. Map
        </div>
        <div className={`${styles.step} ${currentStep === 'select_opponent' ? styles.active : ''} ${selectedOpponent ? styles.completed : ''}`}>
          2. Opponent
        </div>
        <div className={`${styles.step} ${currentStep === 'select_composition' ? styles.active : ''} ${composition.length === 5 ? styles.completed : ''}`}>
          3. Roster
        </div>
        <div className={`${styles.step} ${currentStep === 'select_objective' ? styles.active : ''}`}>
          4. Objective
        </div>
      </div>

      {/* Step 1: Map Selection */}
      {currentStep === 'select_map' && (
        <div className={styles['step-content']}>
          <h3>Select Practice Map</h3>
          <p className={styles['step-description']}>Choose which map your team will practice on</p>
          <div className={styles['map-grid']}>
            {MAPS.map(map => (
              <div
                key={map}
                className={`${styles['map-card']} ${selectedMap === map ? styles.selected : ''}`}
                onClick={() => handleMapSelect(map)}
              >
                <div className={styles['map-name']}>{map}</div>
                <div className={styles['map-prof']}>
                  Team Proficiency: {playerTeam.mapPracticeLevel?.[map] || 50}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Opponent Selection */}
      {currentStep === 'select_opponent' && (
        <div className={styles['step-content']}>
          <div className={styles['step-header']}>
            <button className={styles['back-button']} onClick={() => setCurrentStep('select_map')}>← Back</button>
            <h3>Select Practice Opponent</h3>
          </div>
          <p className={styles['step-description']}>Higher quality opponents provide better training</p>
          <div className={styles['opponent-list']}>
            {availableOpponents.map(opponent => (
              <div
                key={opponent.teamId}
                className={`${styles['opponent-card']} ${selectedOpponent?.teamId === opponent.teamId ? styles.selected : ''}`}
                onClick={() => handleOpponentSelect(opponent)}
              >
                <div className={styles['opponent-info']}>
                  <h4>{opponent.teamName}</h4>
                  <span className={styles['opponent-region']}>{opponent.region}</span>
                </div>
                <div className={styles['opponent-stats']}>
                  <div className={styles['opponent-stat']}>
                    <span className={styles['stat-label']}>Quality</span>
                    <span className={`${styles['stat-value']} ${styles[getQualityClass(opponent.scrimQuality)]}`}>
                      {opponent.scrimQuality}
                    </span>
                  </div>
                  {selectedMap && (
                    <div className={styles['opponent-stat']}>
                      <span className={styles['stat-label']}>{selectedMap}</span>
                      <span className={styles['stat-value']}>
                        {opponent.mapStrengths[selectedMap] || 50}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          <button 
            className={styles['continue-button']}
            disabled={!selectedOpponent}
            onClick={() => setCurrentStep('select_composition')}
          >
            Continue to Roster Selection
          </button>
        </div>
      )}

      {/* Step 3: Composition */}
      {currentStep === 'select_composition' && (
        <div className={styles['step-content']}>
          <div className={styles['step-header']}>
            <button className={styles['back-button']} onClick={() => setCurrentStep('select_opponent')}>← Back</button>
            <h3>Select Team Composition</h3>
          </div>
          <p className={styles['step-description']}>Choose 5 players and their agents ({composition.length}/5 selected)</p>
          
          <div className={styles['composition-layout']}>
            <div className={styles['player-selection']}>
              <h4>Available Players</h4>
              <div className={styles['player-list']}>
                {availablePlayers
                  .filter(p => !composition.find(c => c.playerId === p.id))
                  .map(player => (
                    <div
                      key={player.id}
                      className={`${styles['player-select-card']} ${composition.length >= 5 ? styles['disabled'] : ''}`}
                      onClick={() => handlePlayerSelect(player)}
                    >
                      <div className={styles['player-info']}>
                        <h5>{player.name}</h5>
                        <span className={styles['player-role']}>{player.role}</span>
                        {player.status === 'reserve' && <span className={styles['reserve-badge']}>Reserve</span>}
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            <div className={styles['selected-composition']}>
              <h4>Team Composition</h4>
              {composition.length === 0 ? (
                <p className={styles['empty-message']}>Select 5 players for the scrim</p>
              ) : (
                <div className={styles['composition-list']}>
                  {composition.map(comp => {
                    const player = availablePlayers.find(p => p.id === comp.playerId)!;
                    const playerAgents = Object.keys(player.agentPool) as Agent[];
                    
                    return (
                      <div key={comp.playerId} className={styles['composition-card']}>
                        <div className={styles['comp-player-info']}>
                          <h5>{comp.playerName}</h5>
                          <span className={styles['comp-role']}>{player.role}</span>
                        </div>
                        <div className={styles['agent-selector']}>
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
                          className={styles['remove-button']}
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
            className={styles['continue-button']}
            disabled={composition.length !== 5}
            onClick={() => setCurrentStep('select_objective')}
          >
            Continue to Objective Selection
          </button>
        </div>
      )}

      {/* Step 4: Objective */}
      {currentStep === 'select_objective' && (
        <div className={styles['step-content']}>
          <div className={styles['step-header']}>
            <button className={styles['back-button']} onClick={() => setCurrentStep('select_composition')}>← Back</button>
            <h3>Select Practice Objective</h3>
          </div>
          <p className={styles['step-description']}>Focus your practice on specific aspects of gameplay</p>
          
          <div className={styles['objective-grid']}>
            {objectives.map(objective => (
              <div
                key={objective}
                className={`${styles['objective-card']} ${selectedObjective === objective ? styles['selected'] : ''}`}
                onClick={() => setSelectedObjective(objective)}
              >
                <h4>{getObjectiveLabel(objective)}</h4>
                <p>{getObjectiveDescription(objective)}</p>
                {selectedOpponent && (
                  <div className={styles['opponent-strength']}>
                    Opponent Strength: {selectedOpponent.objectiveStrengths[objective] || 50}/100
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className={styles['scrim-summary']}>
            <h4>Scrim Summary</h4>
            <div className={styles['summary-grid']}>
              <div><strong>Map:</strong> {selectedMap}</div>
              <div><strong>Opponent:</strong> {selectedOpponent?.teamName}</div>
              <div><strong>Players:</strong> {composition.length}</div>
              <div><strong>Objective:</strong> {getObjectiveLabel(selectedObjective)}</div>
            </div>
          </div>

          <button 
            className={styles['start-button']}
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