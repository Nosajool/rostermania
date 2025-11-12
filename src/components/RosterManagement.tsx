import { useState } from 'react';
import type { Player, Region, Role, PlayerContract } from '../types/types';
import { useGame } from '../hooks/useGame';
import { generateTier2FreeAgents } from '../utils/freeAgentGenerator';
import { formatSalary, calculateTeamSalary, getRemainingBudget } from '../utils/contractUtils';
import ContractNegotiation from './ContractNegotiation';
import './RosterManagement.css';

interface RosterManagementProps {
  teamName: string;
  region: Region;
  onBack?: () => void;
}

type FilterRole = Role | 'All';

export default function RosterManagement({ teamName, onBack }: RosterManagementProps) {
  const { playerTeam, signFreeAgent, releasePlayer } = useGame();
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [selectedFreeAgent, setSelectedFreeAgent] = useState<Player | null>(null);
  const [filterRole, setFilterRole] = useState<FilterRole>('All');
  const [view, setView] = useState<'current' | 'free-agents'>('current');
  const [showNegotiation, setShowNegotiation] = useState(false);

  if (!playerTeam) return <div>Team not found</div>;

  // Generate free agents (this would be cached in a real implementation)
  const freeAgents = generateTier2FreeAgents(playerTeam.region);

  // Filter free agents by role
  const filteredFreeAgents = filterRole === 'All' 
    ? freeAgents 
    : freeAgents.filter(fa => fa.role === filterRole);

  const teamSalary = calculateTeamSalary(playerTeam.roster);
  const remainingBudget = getRemainingBudget(playerTeam.budget, playerTeam.roster);

  const handleSignPlayer = (contract: PlayerContract) => {
    if (!selectedFreeAgent) return;
    
    if (playerTeam.roster.length >= 5) {
      alert('Roster is full! Release a player first.');
      return;
    }
    
    const playerWithContract = {
      ...selectedFreeAgent,
      contract,
    };
    
    signFreeAgent(playerWithContract);
    setSelectedFreeAgent(null);
    setShowNegotiation(false);
    alert(`${selectedFreeAgent.name} has been signed to your roster!`);
  };

  const handleOpenNegotiation = () => {
    if (selectedFreeAgent) {
      setShowNegotiation(true);
    }
  };

  const handleReleasePlayer = (player: Player) => {
    if (playerTeam.roster.length <= 5) {
      alert('You must maintain at least 5 players on your roster!');
      return;
    }
    
    const confirm = window.confirm(`Are you sure you want to release ${player.name}?`);
    if (confirm) {
      releasePlayer(player.id);
      setSelectedPlayer(null);
      alert(`${player.name} has been released from your roster.`);
    }
  };

  const roles: FilterRole[] = ['All', 'Duelist', 'Initiator', 'Controller', 'Sentinel', 'Flex'];

  return (
    <div className="roster-management">
      <div className="management-header">
        <div>
          <h2>Roster Management</h2>
          <p className="roster-count">
            Current Roster: {playerTeam.roster.length}/5 players • 
            Salary: {formatSalary(teamSalary)} / {formatSalary(playerTeam.budget)} •
            Available: {formatSalary(remainingBudget)}
          </p>
        </div>
        {onBack && (
          <button className="back-button" onClick={onBack}>
            ← Back to Roster
          </button>
        )}
      </div>

      {/* View Toggle */}
      <div className="view-toggle">
        <button 
          className={`toggle-button ${view === 'current' ? 'active' : ''}`}
          onClick={() => setView('current')}
        >
          Current Roster ({playerTeam.roster.length})
        </button>
        <button 
          className={`toggle-button ${view === 'free-agents' ? 'active' : ''}`}
          onClick={() => setView('free-agents')}
        >
          Free Agents ({freeAgents.length})
        </button>
      </div>

      {/* Role Filter (for free agents view) */}
      {view === 'free-agents' && (
        <div className="role-filter">
          <span className="filter-label">Filter by Role:</span>
          <div className="role-buttons">
            {roles.map(role => (
              <button
                key={role}
                className={`role-button ${filterRole === role ? 'active' : ''}`}
                onClick={() => setFilterRole(role)}
              >
                {role}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="management-layout">
        {/* Player List */}
        <div className="player-list">
          {view === 'current' ? (
            <>
              <h3>Your Roster</h3>
              {playerTeam.roster.map(player => (
                <div
                  key={player.id}
                  className={`player-card ${selectedPlayer?.id === player.id ? 'selected' : ''}`}
                  onClick={() => setSelectedPlayer(player)}
                >
                  <div className="player-card-header">
                    <div className="player-basic-info">
                      <h4>{player.name}</h4>
                      <span className="player-age">Age: {player.age}</span>
                    </div>
                    <span className="player-role-badge">{player.role}</span>
                  </div>
                  <div className="player-quick-stats">
                    <div className="quick-stat">
                      <span className="stat-label">Overall</span>
                      <span className="stat-value">
                        {Math.round(Object.values(player.stats).reduce((a, b) => a + b, 0) / 9)}
                      </span>
                    </div>
                    <div className="quick-stat">
                      <span className="stat-label">Salary</span>
                      <span className="stat-value">
                        {player.contract ? formatSalary(player.contract.salary) : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </>
          ) : (
            <>
              <h3>Available Free Agents</h3>
              {filteredFreeAgents.length === 0 ? (
                <p className="no-agents">No free agents match your filter</p>
              ) : (
                filteredFreeAgents.map(agent => (
                  <div
                    key={agent.id}
                    className={`player-card free-agent ${selectedFreeAgent?.id === agent.id ? 'selected' : ''}`}
                    onClick={() => setSelectedFreeAgent(agent)}
                  >
                    <div className="player-card-header">
                      <div className="player-basic-info">
                        <h4>{agent.name}</h4>
                        <span className="player-age">Age: {agent.age}</span>
                        <span className="tier-badge">Tier 2</span>
                      </div>
                      <span className="player-role-badge">{agent.role}</span>
                    </div>
                    <div className="player-quick-stats">
                      <div className="quick-stat">
                        <span className="stat-label">Overall</span>
                        <span className="stat-value">
                          {Math.round(Object.values(agent.stats).reduce((a, b) => a + b, 0) / 9)}
                        </span>
                      </div>
                      <div className="quick-stat">
                        <span className="stat-label">Asking Salary</span>
                        <span className="stat-value">$200K</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </>
          )}
        </div>

        {/* Player Details */}
        <div className="player-details-panel">
          {(selectedPlayer || selectedFreeAgent) ? (
            <>
              {selectedPlayer && (
                <>
                  <div className="details-header">
                    <h2>{selectedPlayer.name}</h2>
                    <button 
                      className="release-button"
                      onClick={() => handleReleasePlayer(selectedPlayer)}
                    >
                      Release Player
                    </button>
                  </div>
                  <PlayerDetailsView player={selectedPlayer} />
                </>
              )}

              {selectedFreeAgent && (
                <>
                  <div className="details-header">
                    <h2>{selectedFreeAgent.name}</h2>
                    <button 
                      className="sign-button"
                      onClick={handleOpenNegotiation}
                    >
                      Negotiate Contract
                    </button>
                  </div>
                  <PlayerDetailsView player={selectedFreeAgent} isFreeAgent />
                </>
              )}
            </>
          ) : (
            <div className="no-selection">
              <p>Select a player to view details</p>
            </div>
          )}
        </div>
      </div>

      {/* Contract Negotiation Modal */}
      {showNegotiation && selectedFreeAgent && (
        <ContractNegotiation
          player={selectedFreeAgent}
          currentRoster={playerTeam.roster}
          teamBudget={playerTeam.budget}
          onSign={handleSignPlayer}
          onCancel={() => setShowNegotiation(false)}
        />
      )}
    </div>
  );
}

// Player details component
function PlayerDetailsView({ player, isFreeAgent = false }: { player: Player; isFreeAgent?: boolean }) {
  const overallRating = Math.round(Object.values(player.stats).reduce((a, b) => a + b, 0) / 9);

  return (
    <div className="player-details-content">
      <div className="player-meta-info">
        <div className="meta-item">
          <span className="meta-label">Age</span>
          <span className="meta-value">{player.age}</span>
        </div>
        <div className="meta-item">
          <span className="meta-label">Role</span>
          <span className="meta-value">{player.role}</span>
        </div>
        <div className="meta-item">
          <span className="meta-label">Overall</span>
          <span className="meta-value rating">{overallRating}</span>
        </div>
        {isFreeAgent && (
          <div className="meta-item">
            <span className="meta-label">Source</span>
            <span className="meta-value">Ascension</span>
          </div>
        )}
      </div>

      {/* Contract Info */}
      {player.contract && (
        <div className="contract-info-section">
          <h3>Contract Details</h3>
          <div className="contract-info-grid">
            <div className="contract-info-item">
              <span className="contract-label">Salary</span>
              <span className="contract-value">{formatSalary(player.contract.salary)}/yr</span>
            </div>
            <div className="contract-info-item">
              <span className="contract-label">Years Remaining</span>
              <span className="contract-value">{player.contract.yearsRemaining} years</span>
            </div>
            <div className="contract-info-item">
              <span className="contract-label">Total Value</span>
              <span className="contract-value">
                {formatSalary(player.contract.salary * player.contract.yearsRemaining)}
              </span>
            </div>
            <div className="contract-info-item">
              <span className="contract-label">Buyout Clause</span>
              <span className="contract-value">{formatSalary(player.contract.buyoutClause)}</span>
            </div>
          </div>
        </div>
      )}

      <div className="stats-section">
        <h3>Player Attributes</h3>
        <div className="stats-grid">
          {Object.entries(player.stats).map(([stat, value]) => (
            <div key={stat} className="stat-row">
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

      <div className="agent-pool-section">
        <h3>Agent Pool</h3>
        <div className="agent-pool-grid">
          {Object.entries(player.agentPool).map(([agent, prof]) => (
            <div key={agent} className="agent-chip">
              <span className="agent-name">{agent}</span>
              <span className="agent-prof">{prof}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function formatStatName(stat: string): string {
  return stat.charAt(0).toUpperCase() + stat.slice(1);
}

function getStatColor(value: number): string {
  if (value >= 85) return '#4ade80';
  if (value >= 70) return '#60a5fa';
  if (value >= 55) return '#fbbf24';
  return '#f87171';
}