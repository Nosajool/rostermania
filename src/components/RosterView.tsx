import { useState } from 'react';
import type { Region } from '../types/types';
import { getCachedTeam } from '../utils/teamUtils';
import './RosterView.css';

interface RosterViewProps {
  teamName: string;
  region: Region;
}

export default function RosterView({ teamName, region }: RosterViewProps) {
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);

  // Get the full team with all player stats
  const team = getCachedTeam(teamName, region);
  const playersWithStats = team.roster;

  const selectedPlayerData = selectedPlayer 
    ? playersWithStats.find(p => p.id === selectedPlayer)
    : null;

  return (
    <div className="roster-view">
      <div className="roster-header">
        <h2>Team Roster</h2>
        <button className="manage-button">Manage Roster</button>
      </div>

      <div className="roster-layout">
        {/* Player List */}
        <div className="player-list">
          {playersWithStats.map((player) => (
            <div
              key={player.id}
              className={`player-card ${selectedPlayer === player.id ? 'selected' : ''}`}
              onClick={() => setSelectedPlayer(player.id)}
            >
              <div className="player-card-header">
                <div className="player-basic-info">
                  <h3 className="player-card-name">{player.name}</h3>
                  <span className="player-age">Age: {player.age}</span>
                </div>
                <span className="player-card-role">{player.role}</span>
              </div>
              
              <div className="player-card-stats">
                <div className="mini-stat">
                  <span className="mini-stat-label">Mechanics</span>
                  <span className="mini-stat-value">{player.stats.mechanics}</span>
                </div>
                <div className="mini-stat">
                  <span className="mini-stat-label">IGL</span>
                  <span className="mini-stat-value">{player.stats.igl}</span>
                </div>
                <div className="mini-stat">
                  <span className="mini-stat-label">Clutch</span>
                  <span className="mini-stat-value">{player.stats.clutch}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Player Details Panel */}
        <div className="player-details">
          {selectedPlayerData ? (
            <>
              <div className="details-header">
                <div>
                  <h2>{selectedPlayerData.name}</h2>
                  <div className="player-meta">
                    <span className="meta-item">Age: {selectedPlayerData.age}</span>
                    <span className="meta-item">Role: {selectedPlayerData.role}</span>
                    <span className="meta-item">Region: {selectedPlayerData.region}</span>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="stats-section">
                <h3>Player Stats</h3>
                <div className="stats-grid-detailed">
                  {Object.entries(selectedPlayerData.stats).map(([stat, value]) => (
                    <div key={stat} className="stat-item">
                      <div className="stat-info">
                        <span className="stat-name">{formatStatName(stat)}</span>
                        <span className="stat-number">{value}</span>
                      </div>
                      <div className="stat-bar">
                        <div 
                          className="stat-bar-fill" 
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
              <div className="agent-section">
                <h3>Agent Pool</h3>
                <div className="agent-grid">
                  {Object.entries(selectedPlayerData.agentPool).map(([agent, proficiency]) => (
                    <div key={agent} className="agent-item">
                      <span className="agent-name">{agent}</span>
                      <div className="agent-proficiency">
                        <div className="agent-bar">
                          <div 
                            className="agent-bar-fill"
                            style={{ 
                              width: `${proficiency}%`,
                              backgroundColor: getStatColor(proficiency)
                            }}
                          />
                        </div>
                        <span className="agent-value">{proficiency}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="no-selection">
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