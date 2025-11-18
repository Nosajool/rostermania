import type { Player, PlayerStats } from '../types/types';
import { calculateOverallRating } from '../utils/contractUtils';
import styles from './TrainingResultModal.module.css';

interface TrainingResultModalProps {
  playerBefore: Player;
  playerAfter: Player;
  trainingFocus: string;
  onClose: () => void;
}

interface StatChange {
  stat: keyof PlayerStats;
  before: number;
  after: number;
  change: number;
}

export default function TrainingResultModal({
  playerBefore,
  playerAfter,
  trainingFocus,
  onClose,
}: TrainingResultModalProps) {
  // Calculate stat changes
  const statChanges: StatChange[] = [];
  const statsKeys = Object.keys(playerBefore.stats) as (keyof PlayerStats)[];
  
  statsKeys.forEach(stat => {
    const before = playerBefore.stats[stat];
    const after = playerAfter.stats[stat];
    const change = after - before;
    
    if (change !== 0) {
      statChanges.push({ stat, before, after, change });
    }
  });

  // Calculate agent pool changes
  const agentChanges: { agent: string; before: number; after: number; change: number }[] = [];
  const allAgents = new Set([
    ...Object.keys(playerBefore.agentPool),
    ...Object.keys(playerAfter.agentPool),
  ]);

  allAgents.forEach(agent => {
    const before = playerBefore.agentPool[agent] || 0;
    const after = playerAfter.agentPool[agent] || 0;
    const change = after - before;

    if (change !== 0) {
      agentChanges.push({ agent, before, after, change });
    }
  });

  const overallBefore = calculateOverallRating(playerBefore);
  const overallAfter = calculateOverallRating(playerAfter);
  const overallChange = overallAfter - overallBefore;

  const developmentChange = (playerAfter.development || 0) - (playerBefore.development || 0);
  const moraleAfter = playerAfter.morale || 70;

  const hasChanges = statChanges.length > 0 || agentChanges.length > 0;
  const effectiveness = calculateEffectiveness(statChanges.length + agentChanges.length, moraleAfter);

  return (
    <div className={styles['training-result-overlay']} onClick={onClose}>
      <div className={styles['training-result-modal']} onClick={(e) => e.stopPropagation()}>
        <div className={styles['result-header']}>
          <div>
            <h2>Training Complete</h2>
            <p className={styles['training-type']}>{trainingFocus}</p>
          </div>
          <button className={styles['close-btn']} onClick={onClose}>×</button>
        </div>

        <div className={styles['result-content']}>
          {/* Player Summary */}
          <div className={styles['player-summary-result']}>
            <div className={styles['player-name-large']}>{playerAfter.name}</div>
            <div className={styles['overall-change']}>
              <div className={styles['overall-stat']}>
                <span className={styles['label']}>Overall Rating</span>
                <div className={styles['rating-comparison']}>
                  <span className={styles['old-rating']}>{overallBefore}</span>
                  <span className={styles['arrow']}>→</span>
                  <span className={styles['new-rating']}>{overallAfter}</span>
                  {overallChange > 0 && (
                    <span className={`${styles['rating-change']} ${styles['positive']}`}>+{overallChange}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Effectiveness Badge */}
          <div className={`${styles['effectiveness-badge']} ${styles[effectiveness.class]}`}>
            <span className={styles['effectiveness-icon']}>{effectiveness.icon}</span>
            <div className={styles['effectiveness-info']}>
              <span className={styles['effectiveness-label']}>Training Effectiveness</span>
              <span className={styles['effectiveness-rating']}>{effectiveness.label}</span>
            </div>
          </div>

          {hasChanges ? (
            <>
              {/* Stat Changes */}
              {statChanges.length > 0 && (
                <div className={styles['changes-section']}>
                  <h3>Stat Improvements</h3>
                  <div className={styles['stat-changes-grid']}>
                    {statChanges.map(({ stat, before, after, change }) => (
                      <div key={stat} className={styles['stat-change-item']}>
                        <div className={styles['stat-change-header']}>
                          <span className={styles['stat-name-result']}>{formatStatName(stat)}</span>
                          <span className={`${styles['stat-change-value']} ${styles['positive']}`}>+{change}</span>
                        </div>
                        <div className={styles['stat-progress']}>
                          <div className={styles['stat-bar-container']}>
                            <div
                              className={styles['stat-bar-before']}
                              style={{ width: `${before}%` }}
                            />
                            <div
                              className={styles['stat-bar-after']}
                              style={{ width: `${after}%` }}
                            />
                          </div>
                          <div className={styles['stat-values']}>
                            <span className={styles['stat-value-old']}>{before}</span>
                            <span className={styles['stat-value-arrow']}>→</span>
                            <span className={styles['stat-value-new']}>{after}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Agent Pool Changes */}
              {agentChanges.length > 0 && (
                <div className={styles['changes-section']}>
                  <h3>Agent Proficiency</h3>
                  <div className={styles['agent-changes-grid']}>
                    {agentChanges.map(({ agent, before, after, change }) => (
                      <div key={agent} className={styles['agent-change-item']}>
                        <span className={styles['agent-name-result']}>{agent}</span>
                        <div className={styles['agent-change-bar']}>
                          <div className={styles['agent-bar-bg']}>
                            <div
                              className={styles['agent-bar-fill']}
                              style={{ width: `${after}%` }}
                            />
                          </div>
                          <span className={styles['agent-change-text']}>
                            {before} → {after} <span className={styles['change-plus']}>+{change}</span>
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Development Progress */}
              <div className={styles['development-section']}>
                <div className={styles['dev-row']}>
                  <span className={styles['dev-label']}>Development Progress</span>
                  <div className={styles['dev-progress-bar']}>
                    <div
                      className={styles['dev-progress-fill']}
                      style={{ width: `${playerAfter.development || 0}%` }}
                    />
                  </div>
                  <span className={styles['dev-value']}>
                    {playerAfter.development?.toFixed(1) || 0}%
                    {developmentChange > 0 && (
                      <span className={styles['dev-change']}> (+{developmentChange.toFixed(1)}%)</span>
                    )}
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div className={styles['no-changes']}>
              <div className={styles['no-changes-icon']}>😐</div>
              <h3>No Stat Improvements</h3>
              <p>Training didn't result in any stat changes this time.</p>
              <div className={styles['no-changes-tips']}>
                <strong>Tips for better results:</strong>
                <ul>
                  <li>Higher morale increases success rate</li>
                  <li>Younger players improve more consistently</li>
                  <li>Players closer to their potential improve slower</li>
                  <li>Try training different focus areas</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        <div className={styles['result-footer']}>
          <button className={styles['continue-button']} onClick={onClose}>
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}

function formatStatName(stat: string): string {
  return stat.charAt(0).toUpperCase() + stat.slice(1);
}

function calculateEffectiveness(
  improvements: number,
  morale: number
): { label: string; class: string; icon: string } {
  if (improvements >= 4) {
    return { label: 'Excellent', class: 'excellent', icon: '🌟' };
  } else if (improvements >= 2) {
    return { label: 'Good', class: 'good', icon: '✓' };
  } else if (improvements === 1) {
    return { label: 'Fair', class: 'fair', icon: '→' };
  } else {
    if (morale < 50) {
      return { label: 'Poor (Low Morale)', class: 'poor', icon: '⚠️' };
    }
    return { label: 'Minimal', class: 'minimal', icon: '○' };
  }
}
