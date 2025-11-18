import { useMemo } from 'react';
import type { Region, Team } from '../types/types';
import { useGame } from '../hooks/useGame';
import styles from './StandingsView.module.css';

interface StandingsViewProps {
  teamName: string;
  region: Region;
}

interface TeamStanding {
  rank: number;
  team: Team;
  wins: number;
  losses: number;
  matchesPlayed: number;
  mapDifferential: number;
  roundDifferential: number;
  winRate: number;
}

export default function StandingsView({ teamName }: StandingsViewProps) {
  const { schedule, allTeams } = useGame();

  // Calculate standings from match results
  const standings = useMemo(() => {
    const teamStats = new Map<string, TeamStanding>();

    // Initialize all teams
    allTeams.forEach(team => {
      teamStats.set(team.name, {
        rank: 0,
        team,
        wins: 0,
        losses: 0,
        matchesPlayed: 0,
        mapDifferential: 0,
        roundDifferential: 0,
        winRate: 0,
      });
    });

    // Calculate stats from completed matches
    schedule.forEach(match => {
      if (!match.winner || !match.maps) return;

      const teamAStats = teamStats.get(match.teamA.name);
      const teamBStats = teamStats.get(match.teamB.name);

      if (!teamAStats || !teamBStats) return;

      // Update matches played
      teamAStats.matchesPlayed++;
      teamBStats.matchesPlayed++;

      // Update wins/losses
      if (match.winner.name === match.teamA.name) {
        teamAStats.wins++;
        teamBStats.losses++;
      } else {
        teamBStats.wins++;
        teamAStats.losses++;
      }

      // Calculate map and round differentials
      const teamAMaps = match.maps.filter(m => m.winner === 'teamA').length;
      const teamBMaps = match.maps.filter(m => m.winner === 'teamB').length;

      teamAStats.mapDifferential += teamAMaps - teamBMaps;
      teamBStats.mapDifferential += teamBMaps - teamAMaps;

      // Round differential
      match.maps.forEach(map => {
        const teamARounds = map.teamAScore - map.teamBScore;
        const teamBRounds = map.teamBScore - map.teamAScore;

        teamAStats.roundDifferential += teamARounds;
        teamBStats.roundDifferential += teamBRounds;
      });
    });

    // Calculate win rates and sort
    const sortedStandings = Array.from(teamStats.values())
      .map(stat => ({
        ...stat,
        winRate: stat.matchesPlayed > 0 ? (stat.wins / stat.matchesPlayed) * 100 : 0,
      }))
      .sort((a, b) => {
        // Primary: Wins (descending)
        if (b.wins !== a.wins) return b.wins - a.wins;
        // Secondary: Win rate
        if (b.winRate !== a.winRate) return b.winRate - a.winRate;
        // Tertiary: Map differential
        if (b.mapDifferential !== a.mapDifferential) return b.mapDifferential - a.mapDifferential;
        // Quaternary: Round differential
        return b.roundDifferential - a.roundDifferential;
      })
      .map((stat, index) => ({
        ...stat,
        rank: index + 1,
      }));

    return sortedStandings;
  }, [schedule, allTeams]);

  const playerTeamStanding = standings.find(s => s.team.name === teamName);

  // Categorize teams
  const playoffTeams = standings.slice(0, 8); // Top 8 make playoffs
  const eliminatedTeams = standings.slice(8);

  return (
    <div className={styles['standings-view']}>
      <div className={styles['standings-header']}>
        <div>
          <h2>League Standings - Stage 1</h2>
          {playerTeamStanding && (
            <p className={styles['team-position']}>
              Your team is currently <span className={styles['rank-highlight']}>#{playerTeamStanding.rank}</span> in the standings
            </p>
          )}
        </div>
        <div className={styles['qualification-info']}>
          <div className={`${styles['qual-item']} ${styles['playoff']}`}>
            <span className={styles['qual-dot']}></span>
            <span>Top 8 - Playoff Qualification</span>
          </div>
          <div className={`${styles['qual-item']} ${styles['eliminated']}`}>
            <span className={styles['qual-dot']}></span>
            <span>Bottom 4 - Eliminated</span>
          </div>
        </div>
      </div>

      <div className={styles['standings-table']}>
        <div className={styles['standings-table-header']}>
          <div className={`${styles['standings-header-cell']} ${styles['rank-cell']}`}>#</div>
          <div className={`${styles['standings-header-cell']} ${styles['team-cell']}`}>Team</div>
          <div className={`${styles['standings-header-cell']} ${styles['stat-cell']}`}>W</div>
          <div className={`${styles['standings-header-cell']} ${styles['stat-cell']}`}>L</div>
          <div className={`${styles['standings-header-cell']} ${styles['stat-cell']}`}>Win%</div>
          <div className={`${styles['standings-header-cell']} ${styles['stat-cell']}`}>Maps</div>
          <div className={`${styles['standings-header-cell']} ${styles['stat-cell']}`}>MD</div>
          <div className={`${styles['standings-header-cell']} ${styles['stat-cell']}`}>RD</div>
        </div>

        {standings.map(standing => {
          const isPlayerTeam = standing.team.name === teamName;
          const isPlayoffTeam = standing.rank <= 8;
          const isEliminated = standing.rank > 8;

          return (
            <div
              key={standing.team.id}
              className={`${styles['standings-table-row']} ${isPlayerTeam ? styles['player-team'] : ''} ${isPlayoffTeam ? styles['playoff'] : ''} ${isEliminated ? styles['eliminated'] : ''}`}
            >
              <div className={`${styles['standings-cell']} ${styles['rank-cell']}`}>
                <span className={`${styles['rank-number']} ${standing.rank <= 3 ? styles['top-3'] : ''}`}>
                  {standing.rank}
                </span>
              </div>
              <div className={`${styles['standings-cell']} ${styles['team-cell']}`}>
                <div className={styles['team-info']}>
                  <span className={styles['team-tag']}>{standing.team.shortName}</span>
                  <span className={styles['team-name']}>{standing.team.name}</span>
                  {isPlayerTeam && <span className={styles['you-badge']}>YOU</span>}
                </div>
              </div>
              <div className={`${styles['standings-cell']} ${styles['stat-cell']}`}>
                <span className={`${styles['stat-value']} ${styles['wins']}`}>{standing.wins}</span>
              </div>
              <div className={`${styles['standings-cell']} ${styles['stat-cell']}`}>
                <span className={`${styles['stat-value']} ${styles['losses']}`}>{standing.losses}</span>
              </div>
              <div className={`${styles['standings-cell']} ${styles['stat-cell']}`}>
                <span className={styles['stat-value']}>{standing.winRate.toFixed(0)}%</span>
              </div>
              <div className={`${styles['standings-cell']} ${styles['stat-cell']}`}>
                <span className={styles['stat-value']}>{standing.wins * 2 + standing.losses}</span>
              </div>
              <div className={`${styles['standings-cell']} ${styles['stat-cell']}`}>
                <span className={`${styles['stat-value']} ${styles['differential']} ${standing.mapDifferential > 0 ? styles['positive'] : standing.mapDifferential < 0 ? styles['negative'] : ''}`}>
                  {standing.mapDifferential > 0 ? '+' : ''}{standing.mapDifferential}
                </span>
              </div>
              <div className={`${styles['cell']} ${styles['stat-cell']}`}>
                <span className={`${styles['stat-value']} ${styles['differential']} ${standing.roundDifferential > 0 ? styles['positive'] : standing.roundDifferential < 0 ? styles['negative'] : ''}`}>
                  {standing.roundDifferential > 0 ? '+' : ''}{standing.roundDifferential}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className={styles['standings-legend']}>
        <h3>Column Explanations</h3>
        <div className={styles['legend-grid']}>
          <div className={styles['legend-item']}>
            <span className={styles['legend-label']}>W / L</span>
            <span className={styles['legend-desc']}>Match wins and losses</span>
          </div>
          <div className={styles['legend-item']}>
            <span className={styles['legend-label']}>Win%</span>
            <span className={styles['legend-desc']}>Win percentage</span>
          </div>
          <div className={styles['legend-item']}>
            <span className={styles['legend-label']}>Maps</span>
            <span className={styles['legend-desc']}>Total maps played</span>
          </div>
          <div className={styles['legend-item']}>
            <span className={styles['legend-label']}>MD</span>
            <span className={styles['legend-desc']}>Map differential (maps won - maps lost)</span>
          </div>
          <div className={styles['legend-item']}>
            <span className={styles['legend-label']}>RD</span>
            <span className={styles['legend-desc']}>Round differential (rounds won - rounds lost)</span>
          </div>
        </div>

        <div className={styles['tiebreaker-info']}>
          <h4>Tiebreaker Order</h4>
          <ol>
            <li>Head-to-head record</li>
            <li>Map differential</li>
            <li>Round differential</li>
            <li>Head-to-head map differential</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
