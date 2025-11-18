import type { MapResult } from '../types/types';
import styles from './MapResultDetails.module.css';

interface MapResultDetailsProps {
  mapResult: MapResult;
  teamAName: string;
  teamBName: string;
}

export default function MapResultDetails({ mapResult, teamAName, teamBName }: MapResultDetailsProps) {
  return (
    <div className={styles['map-result-details']}>
      <div className={styles['map-details-header']}>
        <h4>{mapResult.map} - Detailed Statistics</h4>
        <div className={styles['map-score-display']}>
          <span className={styles['score-large']}>{mapResult.teamAScore}</span>
          <span className={styles['score-separator']}>-</span>
          <span className={styles['score-large']}>{mapResult.teamBScore}</span>
        </div>
      </div>
      
      {/* Team A Stats */}
      <div className={styles['team-performance-section']}>
        <div className={styles['team-performance-header']}>
          <h5>{teamAName}</h5>
          <div className={styles['team-rounds']}>
            <span className={styles['round-label']}>ATK: {mapResult.teamAAttackRounds}</span>
            <span className={styles['round-label']}>DEF: {mapResult.teamADefenseRounds}</span>
          </div>
        </div>
        
        <div className={styles['performance-table']}>
          <div className={styles['table-header']}>
            <div className={`${styles['header-cell']} ${styles['player-cell']}`}>Player</div>
            <div className={`${styles['header-cell']} ${styles['agent-cell']}`}>Agent</div>
            <div className={`${styles['header-cell']} ${styles['stat-cell']}`}>ACS</div>
            <div className={`${styles['header-cell']} ${styles['stat-cell']}`}>K</div>
            <div className={`${styles['header-cell']} ${styles['stat-cell']}`}>D</div>
            <div className={`${styles['header-cell']} ${styles['stat-cell']}`}>A</div>
            <div className={`${styles['header-cell']} ${styles['stat-cell']}`}>±</div>
            <div className={`${styles['header-cell']} ${styles['stat-cell']}`}>K/D</div>
            <div className={`${styles['header-cell']} ${styles['stat-cell']}`}>ADR</div>
            <div className={`${styles['header-cell']} ${styles['stat-cell-small']}`}>FK</div>
            <div className={`${styles['header-cell']} ${styles['stat-cell-small']}`}>FD</div>
            <div className={`${styles['header-cell']} ${styles['stat-cell']}`}>KAST%</div>
          </div>
          
          {mapResult.teamAPerformances
            .sort((a, b) => b.acs - a.acs) // Sort by ACS descending
            .map(perf => {
              const kda = perf.kills - perf.deaths;
              return (
                <div key={perf.playerId} className={styles['table-row']}>
                  <div className={`${styles['cell']} ${styles['player-cell']}`}>
                    <span className={styles['player-name']}>{perf.playerName}</span>
                  </div>
                  <div className={`${styles['cell']} ${styles['agent-cell']}`}>
                    <span className={styles['agent-badge']}>{perf.agent}</span>
                  </div>
                  <div className={`${styles['cell']} ${styles['stat-cell']}`}>
                    <span className={`${styles['stat-value']} ${styles['highlight']}`}>{perf.acs}</span>
                  </div>
                  <div className={`${styles['cell']} ${styles['stat-cell']}`}>
                    <span className={styles['stat-value']}>{perf.kills}</span>
                  </div>
                  <div className={`${styles['cell']} ${styles['stat-cell']}`}>
                    <span className={styles['stat-value']}>{perf.deaths}</span>
                  </div>
                  <div className={`${styles['cell']} ${styles['stat-cell']}`}>
                    <span className={styles['stat-value']}>{perf.assists}</span>
                  </div>
                  <div className={`${styles['cell']} ${styles['stat-cell']}`}>
                    <span className={`${styles['stat-value']} ${styles['kda']} ${kda > 0 ? styles['positive'] : kda < 0 ? styles['negative'] : styles['neutral']}`}>
                      {kda > 0 ? '+' : ''}{kda}
                    </span>
                  </div>
                  <div className={`${styles['cell']} ${styles['stat-cell']}`}>
                    <span className={styles['stat-value']}>{perf.kd.toFixed(2)}</span>
                  </div>
                  <div className={`${styles['cell']} ${styles['stat-cell']}`}>
                    <span className={styles['stat-value']}>{perf.adr}</span>
                  </div>
                  <div className={`${styles['cell']} ${styles['stat-cell-small']}`}>
                    <span className={styles['stat-value-small']}>{perf.firstKills}</span>
                  </div>
                  <div className={`${styles['cell']} ${styles['stat-cell-small']}`}>
                    <span className={styles['stat-value-small']}>{perf.firstDeaths}</span>
                  </div>
                  <div className={`${styles['cell']} ${styles['stat-cell']}`}>
                    <span className={styles['stat-value']}>{perf.kast}%</span>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Team B Stats */}
      <div className={styles['team-performance-section']}>
        <div className={`${styles['team-performance-header']} ${styles['team-b']}`}>
          <h5>{teamBName}</h5>
          <div className={styles['team-rounds']}>
            <span className={styles['round-label']}>ATK: {mapResult.teamBAttackRounds}</span>
            <span className={styles['round-label']}>DEF: {mapResult.teamBDefenseRounds}</span>
          </div>
        </div>
        
        <div className={styles['performance-table']}>
          <div className={styles['table-header']}>
            <div className={`${styles['header-cell']} ${styles['player-cell']}`}>Player</div>
            <div className={`${styles['header-cell']} ${styles['agent-cell']}`}>Agent</div>
            <div className={`${styles['header-cell']} ${styles['stat-cell']}`}>ACS</div>
            <div className={`${styles['header-cell']} ${styles['stat-cell']}`}>K</div>
            <div className={`${styles['header-cell']} ${styles['stat-cell']}`}>D</div>
            <div className={`${styles['header-cell']} ${styles['stat-cell']}`}>A</div>
            <div className={`${styles['header-cell']} ${styles['stat-cell']}`}>±</div>
            <div className={`${styles['header-cell']} ${styles['stat-cell']}`}>K/D</div>
            <div className={`${styles['header-cell']} ${styles['stat-cell']}`}>ADR</div>
            <div className={`${styles['header-cell']} ${styles['stat-cell-small']}`}>FK</div>
            <div className={`${styles['header-cell']} ${styles['stat-cell-small']}`}>FD</div>
            <div className={`${styles['header-cell']} ${styles['stat-cell']}`}>KAST%</div>
          </div>
          
          {mapResult.teamBPerformances
            .sort((a, b) => b.acs - a.acs)
            .map(perf => {
              const kda = perf.kills - perf.deaths;
              return (
                <div key={perf.playerId} className={styles['table-row']}>
                  <div className={`${styles['cell']} ${styles['player-cell']}`}>
                    <span className={styles['player-name']}>{perf.playerName}</span>
                  </div>
                  <div className={`${styles['cell']} ${styles['agent-cell']}`}>
                    <span className={styles['agent-badge']}>{perf.agent}</span>
                  </div>
                  <div className={`${styles['cell']} ${styles['stat-cell']}`}>
                    <span className={`${styles['stat-value']} ${styles['highlight']}`}>{perf.acs}</span>
                  </div>
                  <div className={`${styles['cell']} ${styles['stat-cell']}`}>
                    <span className={styles['stat-value']}>{perf.kills}</span>
                  </div>
                  <div className={`${styles['cell']} ${styles['stat-cell']}`}>
                    <span className={styles['stat-value']}>{perf.deaths}</span>
                  </div>
                  <div className={`${styles['cell']} ${styles['stat-cell']}`}>
                    <span className={styles['stat-value']}>{perf.assists}</span>
                  </div>
                  <div className={`${styles['cell']} ${styles['stat-cell']}`}>
                    <span className={`${styles['stat-value']} ${styles['kda']} ${kda > 0 ? styles['positive'] : kda < 0 ? styles['negative'] : styles['neutral']}`}>
                      {kda > 0 ? '+' : ''}{kda}
                    </span>
                  </div>
                  <div className={`${styles['cell']} ${styles['stat-cell']}`}>
                    <span className={styles['stat-value']}>{perf.kd.toFixed(2)}</span>
                  </div>
                  <div className={`${styles['cell']} ${styles['stat-cell']}`}>
                    <span className={styles['stat-value']}>{perf.adr}</span>
                  </div>
                  <div className={`${styles['cell']} ${styles['stat-cell-small']}`}>
                    <span className={styles['stat-value-small']}>{perf.firstKills}</span>
                  </div>
                  <div className={`${styles['cell']} ${styles['stat-cell-small']}`}>
                    <span className={styles['stat-value-small']}>{perf.firstDeaths}</span>
                  </div>
                  <div className={`${styles['cell']} ${styles['stat-cell']}`}>
                    <span className={styles['stat-value']}>{perf.kast}%</span>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
