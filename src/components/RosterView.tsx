import { useState } from 'react';
import type { Region } from '../types/types';
import { useGame } from '../hooks/useGame';
import RosterManagement from './RosterManagement';
import styles from './RosterView.module.css';

interface RosterViewProps {
  teamName: string;
  region: Region;
}

export default function RosterView({ teamName, region }: RosterViewProps) {
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [showManagement, setShowManagement] = useState(false);
  const { playerTeam } = useGame();

  if (!playerTeam) return <div>Team not found</div>;

  // Use active players only for display
  const playersWithStats = playerTeam.roster.filter(p => p.status !== 'reserve');

  const selectedPlayerData = selectedPlayer 
    ? playersWithStats.find(p => p.id === selectedPlayer)
    : null;

  // If management view is active, show that instead
  if (showManagement) {
    return <RosterManagement teamName={teamName} region={region} onBack={() => setShowManagement(false)} />;
  }

  return (
    <div className={styles['roster-view']}>
      <div className={styles['roster-header']}>
        <h2>Team Roster</h2>
        <button className={styles['manage-button']} onClick={() => setShowManagement(true)}>
          Manage Roster
        </button>
      </div>

      <div className={styles['roster-layout']}>
        {/* Player List */}
        <div className={styles['player-list']}>
          {playersWithStats.map((player) => (
            <div
              key={player.id}
              className={`${styles['player-card']} ${selectedPlayer === player.id ? styles['selected'] : ''}`}
              onClick={() => setSelectedPlayer(player.id)}
            >
              <div className={styles['player-card-header']}>
                <div className={styles['player-basic-info']}>
                  <h3 className={styles['player-card-name']}>{player.name}</h3>
                  <span className={styles['player-age']}>Age: {player.age}</span>
                </div>
                <span className={styles['player-card-role']}>{player.role}</span>
              </div>

              <div className={styles['player-card-stats']}>
                <div className={styles['mini-stat']}>
                  <span className={styles['mini-stat-label']}>Mechanics</span>
                  <span className={styles['mini-stat-value']}>{player.stats.mechanics}</span>
                </div>
                <div className={styles['mini-stat']}>
                  <span className={styles['mini-stat-label']}>IGL</span>
                  <span className={styles['mini-stat-value']}>{player.stats.igl}</span>
                </div>
                <div className={styles['mini-stat']}>
                  <span className={styles['mini-stat-label']}>Clutch</span>
                  <span className={styles['mini-stat-value']}>{player.stats.clutch}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Player Details Panel */}
        <div className={styles['player-details']}>
          {selectedPlayerData ? (
            <>
              <div className={styles['details-header']}>
                <div>
                  <h2>{selectedPlayerData.name}</h2>
                  <div className={styles['player-meta']}>
                    <span className={styles['meta-item']}>Age: {selectedPlayerData.age}</span>
                    <span className={styles['meta-item']}>Role: {selectedPlayerData.role}</span>
                    <span className={styles['meta-item']}>Region: {selectedPlayerData.region}</span>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className={styles['stats-section']}>
                <h3>Player Stats</h3>
                <div className={styles['stats-grid-detailed']}>
                  {Object.entries(selectedPlayerData.stats).map(([stat, value]) => (
                    <div key={stat} className={styles['stat-item']}>
                      <div className={styles['stat-info']}>
                        <span className={styles['stat-name']}>{formatStatName(stat)}</span>
                        <span className={styles['stat-number']}>{value}</span>
                      </div>
                      <div className={styles['stat-bar']}>
                        <div
                          className={styles['stat-bar-fill']}
                          style={{
                            width: `${value}%`,
                            backgroundColor: getStatColor(value)
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Agent Pool */}
              <div className={styles['agent-section']}>
                <h3>Agent Pool</h3>
                <div className={styles['agent-grid']}>
                  {Object.entries(selectedPlayerData.agentPool).map(([agent, proficiency]) => (
                    <div key={agent} className={styles['agent-item']}>
                      <span className={styles['agent-name']}>{agent}</span>
                      <div className={styles['agent-proficiency']}>
                        <div className={styles['agent-bar']}>
                          <div
                            className={styles['agent-bar-fill']}
                            style={{
                              width: `${proficiency}%`,
                              backgroundColor: getStatColor(proficiency)
                            }}
                          />
                        </div>
                        <span className={styles['agent-value']}>{proficiency}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className={styles['no-selection']}>
              <p>Select a player to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function formatStatName(stat: string): string {
  return stat.charAt(0).toUpperCase() + stat.slice(1);
}

function getStatColor(value: number): string {
  if (value >= 85) return '#4ade80'; // Green
  if (value >= 70) return '#60a5fa'; // Blue
  if (value >= 55) return '#fbbf24'; // Yellow
  return '#f87171'; // Red
}
