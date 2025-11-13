import { useState } from 'react';
import type { Player } from '../types/types';
import { useGame } from '../hooks/useGame';
import { type TrainingFocus, applyTraining } from '../utils/playerDevelopment';
import { calculateOverallRating } from '../utils/contractUtils';
import './TrainingCenter.css';

export default function TrainingCenter() {
  const { playerTeam, trainPlayer } = useGame();
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [selectedFocus, setSelectedFocus] = useState<TrainingFocus>('balanced');

  if (!playerTeam) return <div>Loading...</div>;

  const handleTrain = () => {
    if (!selectedPlayer) return;
    
    trainPlayer(selectedPlayer.id, selectedFocus);
    alert(`${selectedPlayer.name} has completed ${selectedFocus} training!`);
  };

  const trainingOptions: { focus: TrainingFocus; label: string; description: string; stats: string }[] = [
    {
      focus: 'aim',
      label: '🎯 Aim Training',
      description: 'Focus on mechanical skill and entry fragging',
      stats: 'Mechanics, Entry'
    },
    {
      focus: 'strategy',
      label: '🧠 Strategy',
      description: 'Develop game sense and leadership abilities',
      stats: 'IGL, Support'
    },
    {
      focus: 'teamwork',
      label: '🤝 Teamwork',
      description: 'Improve coordination and team chemistry',
      stats: 'Vibes, Support, Clutch'
    },
    {
      focus: 'mentality',
      label: '💪 Mental Training',
      description: 'Build mental fortitude and consistency',
      stats: 'Mental, Clutch, Stamina'
    },
    {
      focus: 'agents',
      label: '🎮 Agent Practice',
      description: 'Expand and improve agent pool proficiency',
      stats: 'Agent Pool'
    },
    {
      focus: 'balanced',
      label: '⚖️ Balanced Training',
      description: 'Well-rounded development across all areas',
      stats: 'All Stats'
    },
  ];

  return (
    <div className="training-center">
      <div className="training-header">
        <h2>Training Center</h2>
        <p className="training-subtitle">Develop your players through focused training programs</p>
      </div>

      <div className="training-layout">
        {/* Player Selection */}
        <div className="player-selection">
          <h3>Select Player</h3>
          <div className="player-list-training">
            {playerTeam.roster.map(player => {
              const overall = calculateOverallRating(player);
              const isActive = player.status !== 'reserve';
              
              return (
                <div
                  key={player.id}
                  className={`training-player-card ${selectedPlayer?.id === player.id ? 'selected' : ''} ${!isActive ? 'reserve' : ''}`}
                  onClick={() => setSelectedPlayer(player)}
                >
                  <div className="training-player-info">
                    <h4>{player.name}</h4>
                    <span className="player-role-small">{player.role}</span>
                  </div>
                  <div className="training-player-stats">
                    <div className="stat-mini">
                      <span className="stat-mini-label">Overall</span>
                      <span className="stat-mini-value">{overall}</span>
                    </div>
                    <div className="stat-mini">
                      <span className="stat-mini-label">Potential</span>
                      <span className="stat-mini-value">{player.potential || '?'}</span>
                    </div>
                    <div className="stat-mini">
                      <span className="stat-mini-label">Morale</span>
                      <span className={`stat-mini-value morale ${getMoraleClass(player.morale || 70)}`}>
                        {player.morale || 70}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Training Options */}
        <div className="training-options">
          {selectedPlayer ? (
            <>
              <div className="selected-player-header">
                <h3>Training for {selectedPlayer.name}</h3>
                <div className="player-dev-info">
                  <div className="dev-stat">
                    <span>Development:</span>
                    <div className="dev-bar">
                      <div 
                        className="dev-bar-fill"
                        style={{ width: `${selectedPlayer.development || 0}%` }}
                      />
                    </div>
                    <span>{selectedPlayer.development || 0}%</span>
                  </div>
                  <div className="dev-stat">
                    <span>Form:</span>
                    <div className="form-indicator" style={{ 
                      backgroundColor: getFormColor(selectedPlayer.form || 70) 
                    }}>
                      {selectedPlayer.form || 70}
                    </div>
                  </div>
                </div>
              </div>

              <h4>Select Training Focus</h4>
              <div className="training-options-grid">
                {trainingOptions.map(option => (
                  <div
                    key={option.focus}
                    className={`training-option ${selectedFocus === option.focus ? 'selected' : ''}`}
                    onClick={() => setSelectedFocus(option.focus)}
                  >
                    <div className="option-header">
                      <span className="option-icon">{option.label}</span>
                    </div>
                    <p className="option-description">{option.description}</p>
                    <div className="option-stats">
                      <span className="stats-label">Improves:</span>
                      <span className="stats-list">{option.stats}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="training-actions">
                <button className="train-button" onClick={handleTrain}>
                  Begin Training
                </button>
              </div>

              {/* Development Tips */}
              <div className="training-tips">
                <h4>💡 Development Tips</h4>
                <ul>
                  <li>Young players (under 23) develop faster</li>
                  <li>High morale increases training effectiveness</li>
                  <li>Players reach their peak between ages 22-26</li>
                  <li>Veterans (28+) develop slower but maintain experience</li>
                  <li>Regular playing time boosts morale and development</li>
                </ul>
              </div>
            </>
          ) : (
            <div className="no-player-selected">
              <p>Select a player to begin training</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function getMoraleClass(morale: number): string {
  if (morale >= 80) return 'high';
  if (morale >= 60) return 'medium';
  return 'low';
}

function getFormColor(form: number): string {
  if (form >= 80) return '#4ade80';
  if (form >= 60) return '#60a5fa';
  if (form >= 40) return '#fbbf24';
  return '#f87171';
}