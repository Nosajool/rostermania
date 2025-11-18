import { useState } from 'react';
import type { Player, Region, Role, PlayerContract } from '../types/types';
import { useGame } from '../hooks/useGame';
import { generateTier2FreeAgents } from '../utils/freeAgentGenerator';
import { formatSalary, calculateTeamSalary, getRemainingBudget } from '../utils/contractUtils';
import ContractNegotiation from './ContractNegotiation';
import styles from './RosterManagement.module.css';

interface RosterManagementProps {
  teamName: string;
  region: Region;
  onBack?: () => void;
}

type FilterRole = Role | 'All';

export default function RosterManagement({ teamName, onBack }: RosterManagementProps) {
  const { playerTeam, signFreeAgent, releasePlayer, moveToReserve, moveToActive } = useGame();
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [selectedFreeAgent, setSelectedFreeAgent] = useState<Player | null>(null);
  const [filterRole, setFilterRole] = useState<FilterRole>('All');
  const [view, setView] = useState<'current' | 'free-agents'>('current');
  const [showNegotiation, setShowNegotiation] = useState(false);

  if (!playerTeam) return <div>Team not found</div>;

  // Separate active and reserve players
  const activePlayers = playerTeam.roster.filter(p => p.status !== 'reserve');
  const reservePlayers = playerTeam.roster.filter(p => p.status === 'reserve');

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
    
    if (playerTeam.roster.length >= 8) {
      alert('Roster is full (8 players maximum)! Release a player first.');
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

  const handleMoveToReserve = (player: Player) => {
    const reservePlayers = playerTeam.roster.filter(p => p.status === 'reserve');
    
    if (reservePlayers.length >= 3) {
      alert('Reserve is full! You need to move a reserve player to active or release them first.');
      return;
    }
    
    moveToReserve(player.id);
    setSelectedPlayer(null);
  };

  const handleMoveToActive = (player: Player) => {
    const activePlayers = playerTeam.roster.filter(p => p.status !== 'reserve');
    
    if (activePlayers.length >= 5) {
      alert('Active roster is full! You need to move a player to reserve first.');
      return;
    }
    
    moveToActive(player.id);
    setSelectedPlayer(null);
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
    <div className={styles['roster-management']}>
      <div className={styles['management-header']}>
        <div>
          <h2>Roster Management</h2>
          <p className={styles['roster-count']}>
            Active: {activePlayers.length}/5 • Reserve: {reservePlayers.length}/3 •
            Salary: {formatSalary(teamSalary)} / {formatSalary(playerTeam.budget)} •
            Available: {formatSalary(remainingBudget)}
          </p>
        </div>
        {onBack && (
          <button className={styles['back-button']} onClick={onBack}>
            ← Back to Roster
          </button>
        )}
      </div>

      {/* View Toggle */}
      <div className={styles['view-toggle']}>
        <button
          className={`${styles['toggle-button']} ${view === 'current' ? styles['active'] : ''}`}
          onClick={() => setView('current')}
        >
          Current Roster ({playerTeam.roster.length})
        </button>
        <button
          className={`${styles['toggle-button']} ${view === 'free-agents' ? styles['active'] : ''}`}
          onClick={() => setView('free-agents')}
        >
          Free Agents ({freeAgents.length})
        </button>
      </div>

      {/* Role Filter (for free agents view) */}
      {view === 'free-agents' && (
        <div className={styles['role-filter']}>
          <span className={styles['filter-label']}>Filter by Role:</span>
          <div className={styles['role-buttons']}>
            {roles.map(role => (
              <button
                key={role}
                className={`${styles['role-button']} ${filterRole === role ? styles['active'] : ''}`}
                onClick={() => setFilterRole(role)}
              >
                {role}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className={styles['management-layout']}>
        {/* Player List */}
        <div className={styles['player-list']}>
          {view === 'current' ? (
            <>
              <h3>Active Roster ({activePlayers.length}/5)</h3>
              {activePlayers.map(player => (
                <div
                  key={player.id}
                  className={`${styles['player-card']} ${selectedPlayer?.id === player.id ? styles['selected'] : ''}`}
                  onClick={() => setSelectedPlayer(player)}
                >
                  <div className={styles['player-card-header']}>
                    <div className={styles['player-basic-info']}>
                      <h4>{player.name}</h4>
                      <span className={styles['player-age']}>Age: {player.age}</span>
                    </div>
                    <span className={styles['player-role-badge']}>{player.role}</span>
                  </div>
                  <div className={styles['player-quick-stats']}>
                    <div className={styles['quick-stat']}>
                      <span className={styles['stat-label']}>Overall</span>
                      <span className={styles['stat-value']}>
                        {Math.round(Object.values(player.stats).reduce((a, b) => a + b, 0) / 9)}
                      </span>
                    </div>
                    <div className={styles['quick-stat']}>
                      <span className={styles['stat-label']}>Salary</span>
                      <span className={styles['stat-value']}>
                        {player.contract ? formatSalary(player.contract.salary) : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              <h3 className={styles['reserve-header']}>Reserve ({reservePlayers.length}/3)</h3>
              {reservePlayers.length === 0 ? (
                <p className={styles['no-reserves']}>No reserve players</p>
              ) : (
                reservePlayers.map(player => (
                  <div
                    key={player.id}
                    className={`${styles['player-card']} ${styles['reserve']} ${selectedPlayer?.id === player.id ? styles['selected'] : ''}`}
                    onClick={() => setSelectedPlayer(player)}
                  >
                    <div className={styles['player-card-header']}>
                      <div className={styles['player-basic-info']}>
                        <h4>{player.name}</h4>
                        <span className={styles['player-age']}>Age: {player.age}</span>
                        <span className={styles['reserve-badge']}>RESERVE</span>
                      </div>
                      <span className={styles['player-role-badge']}>{player.role}</span>
                    </div>
                    <div className={styles['player-quick-stats']}>
                      <div className={styles['quick-stat']}>
                        <span className={styles['stat-label']}>Overall</span>
                        <span className={styles['stat-value']}>
                          {Math.round(Object.values(player.stats).reduce((a, b) => a + b, 0) / 9)}
                        </span>
                      </div>
                      <div className={styles['quick-stat']}>
                        <span className={styles['stat-label']}>Salary</span>
                        <span className={styles['stat-value']}>
                          {player.contract ? formatSalary(player.contract.salary) : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </>
          ) : (
            <>
              <h3>Available Free Agents</h3>
              {filteredFreeAgents.length === 0 ? (
                <p className={styles['no-agents']}>No free agents match your filter</p>
              ) : (
                filteredFreeAgents.map(agent => (
                  <div
                    key={agent.id}
                    className={`${styles['player-card']} ${styles['free-agent']} ${selectedFreeAgent?.id === agent.id ? styles['selected'] : ''}`}
                    onClick={() => setSelectedFreeAgent(agent)}
                  >
                    <div className={styles['player-card-header']}>
                      <div className={styles['player-basic-info']}>
                        <h4>{agent.name}</h4>
                        <span className={styles['player-age']}>Age: {agent.age}</span>
                        <span className={styles['tier-badge']}>Tier 2</span>
                      </div>
                      <span className={styles['player-role-badge']}>{agent.role}</span>
                    </div>
                    <div className={styles['player-quick-stats']}>
                      <div className={styles['quick-stat']}>
                        <span className={styles['stat-label']}>Overall</span>
                        <span className={styles['stat-value']}>
                          {Math.round(Object.values(agent.stats).reduce((a, b) => a + b, 0) / 9)}
                        </span>
                      </div>
                      <div className={styles['quick-stat']}>
                        <span className={styles['stat-label']}>Asking Salary</span>
                        <span className={styles['stat-value']}>$200K</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </>
          )}
        </div>

        {/* Player Details */}
        <div className={styles['player-details-panel']}>
          {(selectedPlayer || selectedFreeAgent) ? (
            <>
              {selectedPlayer && (
                <>
                  <div className={styles['details-header']}>
                    <h2>{selectedPlayer.name}</h2>
                    <div className={styles['action-buttons']}>
                      {selectedPlayer.status !== 'reserve' ? (
                        <button
                          className={styles['reserve-button']}
                          onClick={() => handleMoveToReserve(selectedPlayer)}
                        >
                          Move to Reserve
                        </button>
                      ) : (
                        <>
                          <button
                            className={styles['activate-button']}
                            onClick={() => handleMoveToActive(selectedPlayer)}
                          >
                            Move to Active
                          </button>
                          <button
                            className={styles['release-button']}
                            onClick={() => handleReleasePlayer(selectedPlayer)}
                          >
                            Release Player
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  <PlayerDetailsView player={selectedPlayer} />
                </>
              )}

              {selectedFreeAgent && (
                <>
                  <div className={styles['details-header']}>
                    <h2>{selectedFreeAgent.name}</h2>
                    <button
                      className={styles['sign-button']}
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
            <div className={styles['no-selection']}>
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
    <div className={styles['player-details-content']}>
      <div className={styles['player-meta-info']}>
        <div className={styles['meta-item']}>
          <span className={styles['meta-label']}>Age</span>
          <span className={styles['meta-value']}>{player.age}</span>
        </div>
        <div className={styles['meta-item']}>
          <span className={styles['meta-label']}>Role</span>
          <span className={styles['meta-value']}>{player.role}</span>
        </div>
        <div className={styles['meta-item']}>
          <span className={styles['meta-label']}>Overall</span>
          <span className={`${styles['meta-value']} ${styles['rating']}`}>{overallRating}</span>
        </div>
        {isFreeAgent && (
          <div className={styles['meta-item']}>
            <span className={styles['meta-label']}>Source</span>
            <span className={styles['meta-value']}>Ascension</span>
          </div>
        )}
      </div>

      {/* Contract Info */}
      {player.contract && (
        <div className={styles['contract-info-section']}>
          <h3>Contract Details</h3>
          <div className={styles['contract-info-grid']}>
            <div className={styles['contract-info-item']}>
              <span className={styles['contract-label']}>Salary</span>
              <span className={styles['contract-value']}>{formatSalary(player.contract.salary)}/yr</span>
            </div>
            <div className={styles['contract-info-item']}>
              <span className={styles['contract-label']}>Years Remaining</span>
              <span className={styles['contract-value']}>{player.contract.yearsRemaining} years</span>
            </div>
            <div className={styles['contract-info-item']}>
              <span className={styles['contract-label']}>Total Value</span>
              <span className={styles['contract-value']}>
                {formatSalary(player.contract.salary * player.contract.yearsRemaining)}
              </span>
            </div>
            <div className={styles['contract-info-item']}>
              <span className={styles['contract-label']}>Buyout Clause</span>
              <span className={styles['contract-value']}>{formatSalary(player.contract.buyoutClause)}</span>
            </div>
          </div>
        </div>
      )}

      <div className={styles['stats-section']}>
        <h3>Player Attributes</h3>
        <div className={styles['stats-grid']}>
          {Object.entries(player.stats).map(([stat, value]) => (
            <div key={stat} className={styles['stat-row']}>
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

      <div className={styles['agent-pool-section']}>
        <h3>Agent Pool</h3>
        <div className={styles['agent-pool-grid']}>
          {Object.entries(player.agentPool).map(([agent, prof]) => (
            <div key={agent} className={styles['agent-chip']}>
              <span className={styles['agent-name']}>{agent}</span>
              <span className={styles['agent-prof']}>{prof}</span>
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
