import { useState } from 'react';
import type { Player } from '../types/types';
import { useGame } from '../hooks/useGame';
import { type TrainingFocus, applyTraining } from '../utils/playerDevelopment';
import { calculateOverallRating } from '../utils/contractUtils';
import { formatToOneDecimal } from '../utils/formatUtils';
import TrainingResultModal from './TrainingResultModal';
import styles from './TrainingCenter.module.css';

export default function TrainingCenter() {
  const { playerTeam, trainPlayer } = useGame();
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [selectedFocus, setSelectedFocus] = useState<TrainingFocus>('balanced');
  const [showResult, setShowResult] = useState(false);
  const [playerBefore, setPlayerBefore] = useState<Player | null>(null);
  const [playerAfter, setPlayerAfter] = useState<Player | null>(null);

  if (!playerTeam) return <div>Loading...</div>;

  const handleTrain = () => {
    if (!selectedPlayer) return;
    
    // Store before state
    setPlayerBefore({ ...selectedPlayer });
    
    // Apply training locally to show preview
    const trainedPlayer = applyTraining(selectedPlayer, selectedFocus);
    setPlayerAfter(trainedPlayer);
    
    // Update in game state
    trainPlayer(selectedPlayer.id, selectedFocus);
    
    // Show result modal
    setShowResult(true);
  };

  const handleCloseResult = () => {
    setShowResult(false);
    setPlayerBefore(null);
    setPlayerAfter(null);
    
    // Refresh selected player to show updated stats
    if (selectedPlayer) {
      const updatedPlayer = playerTeam.roster.find(p => p.id === selectedPlayer.id);
      if (updatedPlayer) {
        setSelectedPlayer(updatedPlayer);
      }
    }
  };

  const getFocusLabel = (focus: TrainingFocus): string => {
    const labels: Record<TrainingFocus, string> = {
      'aim': '🎯 Aim Training',
      'strategy': '🧠 Strategy',
      'teamwork': '🤝 Teamwork',
      'mentality': '💪 Mental Training',
      'agents': '🎮 Agent Practice',
      'balanced': '⚖️ Balanced Training',
    };
    return labels[focus];
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
    <div className={styles['training-center']}>
      <div className={styles['training-header']}>
        <h2>Training Center</h2>
        <p className={styles['training-subtitle']}>Develop your players through focused training programs</p>
      </div>

      <div className={styles['training-layout']}>
        {/* Player Selection */}
        <div className={styles['player-selection']}>
          <h3>Select Player</h3>
          <div className={styles['player-list-training']}>
            {playerTeam.roster.map(player => {
              const overall = calculateOverallRating(player);
              const isActive = player.status !== 'reserve';

              return (
                <div
                  key={player.id}
                  className={`${styles['training-player-card']} ${selectedPlayer?.id === player.id ? styles['selected'] : ''} ${!isActive ? styles['reserve'] : ''}`}
                  onClick={() => setSelectedPlayer(player)}
                >
                  <div className={styles['training-player-info']}>
                    <h4>{player.name}</h4>
                    <span className={styles['player-role-small']}>{player.role}</span>
                  </div>
                  <div className={styles['training-player-stats']}>
                    <div className={styles['stat-mini']}>
                      <span className={styles['stat-mini-label']}>Overall</span>
                      <span className={styles['stat-mini-value']}>{overall}</span>
                    </div>
                    <div className={styles['stat-mini']}>
                      <span className={styles['stat-mini-label']}>Potential</span>
                      <span className={styles['stat-mini-value']}>{player.potential ? formatToOneDecimal(player.potential) : '?'}</span>
                    </div>
                    <div className={styles['stat-mini']}>
                      <span className={styles['stat-mini-label']}>Morale</span>
                      <span className={`${styles['stat-mini-value']} ${styles['morale']} ${styles[getMoraleClass(player.morale || 70)]}`}>
                        {formatToOneDecimal(player.morale || 70)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Training Options */}
        <div className={styles['training-options']}>
          {selectedPlayer ? (
            <>
              <div className={styles['selected-player-header']}>
                <h3>Training for {selectedPlayer.name}</h3>
                <div className={styles['player-dev-info']}>
                  <div className={styles['dev-stat']}>
                    <span>Development:</span>
                    <div className={styles['dev-bar']}>
                      <div
                        className={styles['dev-bar-fill']}
                        style={{ width: `${selectedPlayer.development || 0}%` }}
                      />
                    </div>
                    <span>{formatToOneDecimal(selectedPlayer.development || 0)}%</span>
                  </div>
                  <div className={styles['dev-stat']}>
                    <span>Form:</span>
                    <div className={styles['form-indicator']} style={{
                      backgroundColor: getFormColor(selectedPlayer.form || 70)
                    }}>
                      {formatToOneDecimal(selectedPlayer.form || 70)}
                    </div>
                  </div>
                </div>
              </div>

              <h4>Select Training Focus</h4>
              <div className={styles['training-options-grid']}>
                {trainingOptions.map(option => (
                  <div
                    key={option.focus}
                    className={`${styles['training-option']} ${selectedFocus === option.focus ? styles['selected'] : ''}`}
                    onClick={() => setSelectedFocus(option.focus)}
                  >
                    <div className={styles['option-header']}>
                      <span className={styles['option-icon']}>{option.label}</span>
                    </div>
                    <p className={styles['option-description']}>{option.description}</p>
                    <div className={styles['option-stats']}>
                      <span className={styles['stats-label']}>Improves:</span>
                      <span className={styles['stats-list']}>{option.stats}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className={styles['training-actions']}>
                <button className={styles['train-button']} onClick={handleTrain}>
                  Begin Training
                </button>
              </div>

              {/* Development Tips */}
              <div className={styles['training-tips']}>
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
            <div className={styles['no-player-selected']}>
              <p>Select a player to begin training</p>
            </div>
          )}
        </div>
      </div>

      {/* Training Result Modal */}
      {showResult && playerBefore && playerAfter && (
        <TrainingResultModal
          playerBefore={playerBefore}
          playerAfter={playerAfter}
          trainingFocus={getFocusLabel(selectedFocus)}
          onClose={handleCloseResult}
        />
      )}
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
