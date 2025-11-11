import type { MapResult } from '../types/types';
import './MapResultDetails.css';

interface MapResultDetailsProps {
  mapResult: MapResult;
  teamAName: string;
  teamBName: string;
}

export default function MapResultDetails({ mapResult, teamAName, teamBName }: MapResultDetailsProps) {
  return (
    <div className="map-result-details">
      <div className="map-details-header">
        <h4>{mapResult.map} - Detailed Statistics</h4>
        <div className="map-score-display">
          <span className="score-large">{mapResult.teamAScore}</span>
          <span className="score-separator">-</span>
          <span className="score-large">{mapResult.teamBScore}</span>
        </div>
      </div>
      
      {/* Team A Stats */}
      <div className="team-performance-section">
        <div className="team-performance-header">
          <h5>{teamAName}</h5>
          <div className="team-rounds">
            <span className="round-label">ATK: {mapResult.teamAAttackRounds}</span>
            <span className="round-label">DEF: {mapResult.teamADefenseRounds}</span>
          </div>
        </div>
        
        <div className="performance-table">
          <div className="table-header">
            <div className="header-cell player-cell">Player</div>
            <div className="header-cell agent-cell">Agent</div>
            <div className="header-cell stat-cell">ACS</div>
            <div className="header-cell stat-cell">K</div>
            <div className="header-cell stat-cell">D</div>
            <div className="header-cell stat-cell">A</div>
            <div className="header-cell stat-cell">±</div>
            <div className="header-cell stat-cell">K/D</div>
            <div className="header-cell stat-cell">ADR</div>
            <div className="header-cell stat-cell-small">FK</div>
            <div className="header-cell stat-cell-small">FD</div>
            <div className="header-cell stat-cell">KAST%</div>
          </div>
          
          {mapResult.teamAPerformances
            .sort((a, b) => b.acs - a.acs) // Sort by ACS descending
            .map(perf => {
              const kda = perf.kills - perf.deaths;
              return (
                <div key={perf.playerId} className="table-row">
                  <div className="cell player-cell">
                    <span className="player-name">{perf.playerName}</span>
                  </div>
                  <div className="cell agent-cell">
                    <span className="agent-badge">{perf.agent}</span>
                  </div>
                  <div className="cell stat-cell">
                    <span className="stat-value highlight">{perf.acs}</span>
                  </div>
                  <div className="cell stat-cell">
                    <span className="stat-value">{perf.kills}</span>
                  </div>
                  <div className="cell stat-cell">
                    <span className="stat-value">{perf.deaths}</span>
                  </div>
                  <div className="cell stat-cell">
                    <span className="stat-value">{perf.assists}</span>
                  </div>
                  <div className="cell stat-cell">
                    <span className={`stat-value kda ${kda > 0 ? 'positive' : kda < 0 ? 'negative' : 'neutral'}`}>
                      {kda > 0 ? '+' : ''}{kda}
                    </span>
                  </div>
                  <div className="cell stat-cell">
                    <span className="stat-value">{perf.kd.toFixed(2)}</span>
                  </div>
                  <div className="cell stat-cell">
                    <span className="stat-value">{perf.adr}</span>
                  </div>
                  <div className="cell stat-cell-small">
                    <span className="stat-value-small">{perf.firstKills}</span>
                  </div>
                  <div className="cell stat-cell-small">
                    <span className="stat-value-small">{perf.firstDeaths}</span>
                  </div>
                  <div className="cell stat-cell">
                    <span className="stat-value">{perf.kast}%</span>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Team B Stats */}
      <div className="team-performance-section">
        <div className="team-performance-header team-b">
          <h5>{teamBName}</h5>
          <div className="team-rounds">
            <span className="round-label">ATK: {mapResult.teamBAttackRounds}</span>
            <span className="round-label">DEF: {mapResult.teamBDefenseRounds}</span>
          </div>
        </div>
        
        <div className="performance-table">
          <div className="table-header">
            <div className="header-cell player-cell">Player</div>
            <div className="header-cell agent-cell">Agent</div>
            <div className="header-cell stat-cell">ACS</div>
            <div className="header-cell stat-cell">K</div>
            <div className="header-cell stat-cell">D</div>
            <div className="header-cell stat-cell">A</div>
            <div className="header-cell stat-cell">±</div>
            <div className="header-cell stat-cell">K/D</div>
            <div className="header-cell stat-cell">ADR</div>
            <div className="header-cell stat-cell-small">FK</div>
            <div className="header-cell stat-cell-small">FD</div>
            <div className="header-cell stat-cell">KAST%</div>
          </div>
          
          {mapResult.teamBPerformances
            .sort((a, b) => b.acs - a.acs)
            .map(perf => {
              const kda = perf.kills - perf.deaths;
              return (
                <div key={perf.playerId} className="table-row">
                  <div className="cell player-cell">
                    <span className="player-name">{perf.playerName}</span>
                  </div>
                  <div className="cell agent-cell">
                    <span className="agent-badge">{perf.agent}</span>
                  </div>
                  <div className="cell stat-cell">
                    <span className="stat-value highlight">{perf.acs}</span>
                  </div>
                  <div className="cell stat-cell">
                    <span className="stat-value">{perf.kills}</span>
                  </div>
                  <div className="cell stat-cell">
                    <span className="stat-value">{perf.deaths}</span>
                  </div>
                  <div className="cell stat-cell">
                    <span className="stat-value">{perf.assists}</span>
                  </div>
                  <div className="cell stat-cell">
                    <span className={`stat-value kda ${kda > 0 ? 'positive' : kda < 0 ? 'negative' : 'neutral'}`}>
                      {kda > 0 ? '+' : ''}{kda}
                    </span>
                  </div>
                  <div className="cell stat-cell">
                    <span className="stat-value">{perf.kd.toFixed(2)}</span>
                  </div>
                  <div className="cell stat-cell">
                    <span className="stat-value">{perf.adr}</span>
                  </div>
                  <div className="cell stat-cell-small">
                    <span className="stat-value-small">{perf.firstKills}</span>
                  </div>
                  <div className="cell stat-cell-small">
                    <span className="stat-value-small">{perf.firstDeaths}</span>
                  </div>
                  <div className="cell stat-cell">
                    <span className="stat-value">{perf.kast}%</span>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}