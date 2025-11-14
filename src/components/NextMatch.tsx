import { useState } from 'react';
import type { Match, Player, Team } from '../types/types';
import { useGame } from '../hooks/useGame';
import { calculateOverallRating } from '../utils/contractUtils';
import MatchSimulator from './MatchSimulator';
import styles from './NextMatch.module.css';

interface NextMatchProps {
  teamName: string;
}

export default function NextMatch({ teamName }: NextMatchProps) {
  const { schedule, playerTeam, currentWeek } = useGame();
  const [showSimulator, setShowSimulator] = useState(false);
  const [compareMode, setCompareMode] = useState<'overview' | 'detailed'>('overview');
  
  // Find next unplayed match for player's team
  const nextMatch = schedule.find(match => 
    !match.winner && 
    (match.teamA.name === teamName || match.teamB.name === teamName)
  );

  if (!nextMatch || !playerTeam) {
    return (
      <div className={styles['next-match']}>
        <h3>Next Match</h3>
        <p className={styles['no-match']}>No upcoming matches scheduled</p>
      </div>
    );
  }

  const isTeamA = nextMatch.teamA.name === teamName;
  const yourTeam = isTeamA ? nextMatch.teamA : nextMatch.teamB;
  const opponentTeam = isTeamA ? nextMatch.teamB : nextMatch.teamA;

  // Get active rosters
  const yourRoster = yourTeam.roster.filter(p => p.status !== 'reserve');
  const opponentRoster = opponentTeam.roster.filter(p => p.status !== 'reserve');

  // Calculate team averages
  const calculateTeamAverage = (team: Team) => {
    const activePlayers = team.roster.filter(p => p.status !== 'reserve');
    if (activePlayers.length === 0) return 0;
    
    const sum = activePlayers.reduce((acc, player) => {
      return acc + calculateOverallRating(player);
    }, 0);
    
    return Math.round(sum / activePlayers.length);
  };

  const yourTeamRating = calculateTeamAverage(yourTeam);
  const opponentTeamRating = calculateTeamAverage(opponentTeam);

  if (showSimulator) {
    return (
      <div className={styles['next-match']}>
        <button 
          className={styles['back-button']}
          onClick={() => setShowSimulator(false)}
        >
          ← Back to Match Preview
        </button>
        <MatchSimulator 
          match={nextMatch} 
          onClose={() => setShowSimulator(false)} 
        />
      </div>
    );
  }

  return (
    <div className={styles['next-match']}>
      <div className={styles['match-header']}>
        <h3>Next Match - Week {nextMatch.week}</h3>
        <div className={styles['view-toggle']}>
          <button 
            className={`${styles['toggle-btn']} ${compareMode === 'overview' ? styles.active : ''}`}
            onClick={() => setCompareMode('overview')}
          >
            Overview
          </button>
          <button 
            className={`${styles['toggle-btn']} ${compareMode === 'detailed' ? styles.active : ''}`}
            onClick={() => setCompareMode('detailed')}
          >
            Detailed Stats
          </button>
        </div>
      </div>

      {/* Team Matchup Header */}
      <div className={styles['matchup-header']}>
        <div className={styles['team-card']}>
          <h4 className={styles['team-name']}>{yourTeam.name}</h4>
          <span className={styles['team-short']}>{yourTeam.shortName}</span>
          <div className={styles['team-rating']}>
            <span className={styles['rating-label']}>Team Rating</span>
            <span className={styles['rating-value']}>{yourTeamRating}</span>
          </div>
          <div className={styles['team-record']}>
            {yourTeam.wins}W - {yourTeam.losses}L
          </div>
        </div>

        <div className={styles['vs-badge']}>VS</div>

        <div className={styles['team-card']}>
          <h4 className={styles['team-name']}>{opponentTeam.name}</h4>
          <span className={styles['team-short']}>{opponentTeam.shortName}</span>
          <div className={styles['team-rating']}>
            <span className={styles['rating-label']}>Team Rating</span>
            <span className={styles['rating-value']}>{opponentTeamRating}</span>
          </div>
          <div className={styles['team-record']}>
            {opponentTeam.wins}W - {opponentTeam.losses}L
          </div>
        </div>
      </div>

      {/* Overview Mode - Quick Stats */}
      {compareMode === 'overview' && (
        <div className={styles['overview-section']}>
          <h4>Team Comparison</h4>
          <div className={styles['comparison-grid']}>
            {/* Mechanics */}
            <div className={styles['stat-comparison']}>
              <span className={styles['stat-name']}>Mechanics</span>
              <div className={styles['stat-bars']}>
                <div className={styles['stat-bar-container']}>
                  <div 
                    className={`${styles['stat-bar']} ${styles.yours}`}
                    style={{ width: `${getTeamStatAverage(yourRoster, 'mechanics')}%` }}
                  />
                  <span className={styles['stat-value']}>{getTeamStatAverage(yourRoster, 'mechanics')}</span>
                </div>
                <div className={styles['stat-bar-container']}>
                  <div 
                    className={`${styles['stat-bar']} ${styles.opponent}`}
                    style={{ width: `${getTeamStatAverage(opponentRoster, 'mechanics')}%` }}
                  />
                  <span className={styles['stat-value']}>{getTeamStatAverage(opponentRoster, 'mechanics')}</span>
                </div>
              </div>
            </div>

            {/* IGL */}
            <div className={styles['stat-comparison']}>
              <span className={styles['stat-name']}>IGL</span>
              <div className={styles['stat-bars']}>
                <div className={styles['stat-bar-container']}>
                  <div 
                    className={`${styles['stat-bar']} ${styles.yours}`}
                    style={{ width: `${getTeamStatAverage(yourRoster, 'igl')}%` }}
                  />
                  <span className={styles['stat-value']}>{getTeamStatAverage(yourRoster, 'igl')}</span>
                </div>
                <div className={styles['stat-bar-container']}>
                  <div 
                    className={`${styles['stat-bar']} ${styles.opponent}`}
                    style={{ width: `${getTeamStatAverage(opponentRoster, 'igl')}%` }}
                  />
                  <span className={styles['stat-value']}>{getTeamStatAverage(opponentRoster, 'igl')}</span>
                </div>
              </div>
            </div>

            {/* Mental */}
            <div className={styles['stat-comparison']}>
              <span className={styles['stat-name']}>Mental</span>
              <div className={styles['stat-bars']}>
                <div className={styles['stat-bar-container']}>
                  <div 
                    className={`${styles['stat-bar']} ${styles.yours}`}
                    style={{ width: `${getTeamStatAverage(yourRoster, 'mental')}%` }}
                  />
                  <span className={styles['stat-value']}>{getTeamStatAverage(yourRoster, 'mental')}</span>
                </div>
                <div className={styles['stat-bar-container']}>
                  <div 
                    className={`${styles['stat-bar']} ${styles.opponent}`}
                    style={{ width: `${getTeamStatAverage(opponentRoster, 'mental')}%` }}
                  />
                  <span className={styles['stat-value']}>{getTeamStatAverage(opponentRoster, 'mental')}</span>
                </div>
              </div>
            </div>

            {/* Clutch */}
            <div className={styles['stat-comparison']}>
              <span className={styles['stat-name']}>Clutch</span>
              <div className={styles['stat-bars']}>
                <div className={styles['stat-bar-container']}>
                  <div 
                    className={`${styles['stat-bar']} ${styles.yours}`}
                    style={{ width: `${getTeamStatAverage(yourRoster, 'clutch')}%` }}
                  />
                  <span className={styles['stat-value']}>{getTeamStatAverage(yourRoster, 'clutch')}</span>
                </div>
                <div className={styles['stat-bar-container']}>
                  <div 
                    className={`${styles['stat-bar']} ${styles.opponent}`}
                    style={{ width: `${getTeamStatAverage(opponentRoster, 'clutch')}%` }}
                  />
                  <span className={styles['stat-value']}>{getTeamStatAverage(opponentRoster, 'clutch')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Mode - Player by Player */}
      {compareMode === 'detailed' && (
        <div className={styles['detailed-section']}>
          <h4>Player Comparison</h4>
          <div className={styles['player-comparison-grid']}>
            {/* Headers */}
            <div className={styles['comparison-header']}>
              <div className={styles['your-header']}>Your Team</div>
              <div className={styles['stat-header']}>Stats</div>
              <div className={styles['opponent-header']}>Opponent</div>
            </div>

            {/* Player rows */}
            {[0, 1, 2, 3, 4].map(index => {
              const yourPlayer = yourRoster[index];
              const opponentPlayer = opponentRoster[index];

              return (
                <div key={index} className={styles['player-row']}>
                  {/* Your Player */}
                  <div className={styles['player-cell']}>
                    {yourPlayer ? (
                      <>
                        <span className={styles['player-name']}>{yourPlayer.name}</span>
                        <span className={styles['player-role']}>{yourPlayer.role}</span>
                        <span className={styles['player-overall']}>{calculateOverallRating(yourPlayer)}</span>
                      </>
                    ) : (
                      <span className={styles['no-player']}>-</span>
                    )}
                  </div>

                  {/* Stats */}
                  <div className={styles['stats-cell']}>
                    {yourPlayer && opponentPlayer && (
                      <div className={styles['mini-stats']}>
                        <div className={styles['mini-stat']}>
                          <span className={styles['mini-stat-label']}>Mechanics</span>
                          <span className={`${styles['mini-stat-value']} ${yourPlayer.stats.mechanics > opponentPlayer.stats.mechanics ? styles.better : styles.worse}`}>
                            {yourPlayer.stats.mechanics}
                          </span>
                          <span className={styles['mini-stat-vs']}>vs</span>
                          <span className={`${styles['mini-stat-value']} ${opponentPlayer.stats.mechanics > yourPlayer.stats.mechanics ? styles.better : styles.worse}`}>
                            {opponentPlayer.stats.mechanics}
                          </span>
                        </div>
                        <div className={styles['mini-stat']}>
                          <span className={styles['mini-stat-label']}>IGL</span>
                          <span className={`${styles['mini-stat-value']} ${yourPlayer.stats.igl > opponentPlayer.stats.igl ? styles.better : styles.worse}`}>
                            {yourPlayer.stats.igl}
                          </span>
                          <span className={styles['mini-stat-vs']}>vs</span>
                          <span className={`${styles['mini-stat-value']} ${opponentPlayer.stats.igl > yourPlayer.stats.igl ? styles.better : styles.worse}`}>
                            {opponentPlayer.stats.igl}
                          </span>
                        </div>
                        <div className={styles['mini-stat']}>
                          <span className={styles['mini-stat-label']}>Clutch</span>
                          <span className={`${styles['mini-stat-value']} ${yourPlayer.stats.clutch > opponentPlayer.stats.clutch ? styles.better : styles.worse}`}>
                            {yourPlayer.stats.clutch}
                          </span>
                          <span className={styles['mini-stat-vs']}>vs</span>
                          <span className={`${styles['mini-stat-value']} ${opponentPlayer.stats.clutch > yourPlayer.stats.clutch ? styles.better : styles.worse}`}>
                            {opponentPlayer.stats.clutch}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Opponent Player */}
                  <div className={styles['player-cell']}>
                    {opponentPlayer ? (
                      <>
                        <span className={styles['player-name']}>{opponentPlayer.name}</span>
                        <span className={styles['player-role']}>{opponentPlayer.role}</span>
                        <span className={styles['player-overall']}>{calculateOverallRating(opponentPlayer)}</span>
                      </>
                    ) : (
                      <span className={styles['no-player']}>-</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Simulate Match Button */}
      <div className={styles['match-actions']}>
        <button 
          className={styles['simulate-button']}
          onClick={() => setShowSimulator(true)}
        >
          Simulate Match
        </button>
      </div>
    </div>
  );
}

// Helper function to calculate team average for a specific stat
function getTeamStatAverage(roster: Player[], stat: keyof Player['stats']): number {
  if (roster.length === 0) return 0;
  const sum = roster.reduce((acc, player) => acc + player.stats[stat], 0);
  return Math.round(sum / roster.length);
}