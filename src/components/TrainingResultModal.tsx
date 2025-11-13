import type { Player, PlayerStats } from '../types/types';
import { calculateOverallRating } from '../utils/contractUtils';
import './TrainingResultModal.css';

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
    <div className="training-result-overlay" onClick={onClose}>
      <div className="training-result-modal" onClick={(e) => e.stopPropagation()}>
        <div className="result-header">
          <div>
            <h2>Training Complete</h2>
            <p className="training-type">{trainingFocus}</p>
          </div>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="result-content">
          {/* Player Summary */}
          <div className="player-summary-result">
            <div className="player-name-large">{playerAfter.name}</div>
            <div className="overall-change">
              <div className="overall-stat">
                <span className="label">Overall Rating</span>
                <div className="rating-comparison">
                  <span className="old-rating">{overallBefore}</span>
                  <span className="arrow">→</span>
                  <span className="new-rating">{overallAfter}</span>
                  {overallChange > 0 && (
                    <span className="rating-change positive">+{overallChange}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Effectiveness Badge */}
          <div className={`effectiveness-badge ${effectiveness.class}`}>
            <span className="effectiveness-icon">{effectiveness.icon}</span>
            <div className="effectiveness-info">
              <span className="effectiveness-label">Training Effectiveness</span>
              <span className="effectiveness-rating">{effectiveness.label}</span>
            </div>
          </div>

          {hasChanges ? (
            <>
              {/* Stat Changes */}
              {statChanges.length > 0 && (
                <div className="changes-section">
                  <h3>Stat Improvements</h3>
                  <div className="stat-changes-grid">
                    {statChanges.map(({ stat, before, after, change }) => (
                      <div key={stat} className="stat-change-item">
                        <div className="stat-change-header">
                          <span className="stat-name-result">{formatStatName(stat)}</span>
                          <span className="stat-change-value positive">+{change}</span>
                        </div>
                        <div className="stat-progress">
                          <div className="stat-bar-container">
                            <div 
                              className="stat-bar-before"
                              style={{ width: `${before}%` }}
                            />
                            <div 
                              className="stat-bar-after"
                              style={{ width: `${after}%` }}
                            />
                          </div>
                          <div className="stat-values">
                            <span className="stat-value-old">{before}</span>
                            <span className="stat-value-arrow">→</span>
                            <span className="stat-value-new">{after}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Agent Pool Changes */}
              {agentChanges.length > 0 && (
                <div className="changes-section">
                  <h3>Agent Proficiency</h3>
                  <div className="agent-changes-grid">
                    {agentChanges.map(({ agent, before, after, change }) => (
                      <div key={agent} className="agent-change-item">
                        <span className="agent-name-result">{agent}</span>
                        <div className="agent-change-bar">
                          <div className="agent-bar-bg">
                            <div 
                              className="agent-bar-fill"
                              style={{ width: `${after}%` }}
                            />
                          </div>
                          <span className="agent-change-text">
                            {before} → {after} <span className="change-plus">+{change}</span>
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Development Progress */}
              <div className="development-section">
                <div className="dev-row">
                  <span className="dev-label">Development Progress</span>
                  <div className="dev-progress-bar">
                    <div 
                      className="dev-progress-fill"
                      style={{ width: `${playerAfter.development || 0}%` }}
                    />
                  </div>
                  <span className="dev-value">
                    {playerAfter.development?.toFixed(1) || 0}%
                    {developmentChange > 0 && (
                      <span className="dev-change"> (+{developmentChange.toFixed(1)}%)</span>
                    )}
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div className="no-changes">
              <div className="no-changes-icon">😐</div>
              <h3>No Stat Improvements</h3>
              <p>Training didn't result in any stat changes this time.</p>
              <div className="no-changes-tips">
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

        <div className="result-footer">
          <button className="continue-button" onClick={onClose}>
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