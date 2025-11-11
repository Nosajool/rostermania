import { useMemo } from 'react';
import type { Region, Team } from '../types/types';
import { useGame } from '../hooks/useGame';
import './StandingsView.css';

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
    <div className="standings-view">
      <div className="standings-header">
        <div>
          <h2>League Standings - Stage 1</h2>
          {playerTeamStanding && (
            <p className="team-position">
              Your team is currently <span className="rank-highlight">#{playerTeamStanding.rank}</span> in the standings
            </p>
          )}
        </div>
        <div className="qualification-info">
          <div className="qual-item playoff">
            <span className="qual-dot"></span>
            <span>Top 8 - Playoff Qualification</span>
          </div>
          <div className="qual-item eliminated">
            <span className="qual-dot"></span>
            <span>Bottom 4 - Eliminated</span>
          </div>
        </div>
      </div>

      <div className="standings-table">
        <div className="table-header">
          <div className="header-cell rank-cell">#</div>
          <div className="header-cell team-cell">Team</div>
          <div className="header-cell stat-cell">W</div>
          <div className="header-cell stat-cell">L</div>
          <div className="header-cell stat-cell">Win%</div>
          <div className="header-cell stat-cell">Maps</div>
          <div className="header-cell stat-cell">MD</div>
          <div className="header-cell stat-cell">RD</div>
        </div>

        {standings.map(standing => {
          const isPlayerTeam = standing.team.name === teamName;
          const isPlayoffTeam = standing.rank <= 8;
          const isEliminated = standing.rank > 8;

          return (
            <div
              key={standing.team.id}
              className={`table-row ${isPlayerTeam ? 'player-team' : ''} ${isPlayoffTeam ? 'playoff' : ''} ${isEliminated ? 'eliminated' : ''}`}
            >
              <div className="cell rank-cell">
                <span className={`rank-number ${standing.rank <= 3 ? 'top-3' : ''}`}>
                  {standing.rank}
                </span>
              </div>
              <div className="cell team-cell">
                <div className="team-info">
                  <span className="team-tag">{standing.team.shortName}</span>
                  <span className="team-name">{standing.team.name}</span>
                  {isPlayerTeam && <span className="you-badge">YOU</span>}
                </div>
              </div>
              <div className="cell stat-cell">
                <span className="stat-value wins">{standing.wins}</span>
              </div>
              <div className="cell stat-cell">
                <span className="stat-value losses">{standing.losses}</span>
              </div>
              <div className="cell stat-cell">
                <span className="stat-value">{standing.winRate.toFixed(0)}%</span>
              </div>
              <div className="cell stat-cell">
                <span className="stat-value">{standing.wins * 2 + standing.losses}</span>
              </div>
              <div className="cell stat-cell">
                <span className={`stat-value differential ${standing.mapDifferential > 0 ? 'positive' : standing.mapDifferential < 0 ? 'negative' : ''}`}>
                  {standing.mapDifferential > 0 ? '+' : ''}{standing.mapDifferential}
                </span>
              </div>
              <div className="cell stat-cell">
                <span className={`stat-value differential ${standing.roundDifferential > 0 ? 'positive' : standing.roundDifferential < 0 ? 'negative' : ''}`}>
                  {standing.roundDifferential > 0 ? '+' : ''}{standing.roundDifferential}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="standings-legend">
        <h3>Column Explanations</h3>
        <div className="legend-grid">
          <div className="legend-item">
            <span className="legend-label">W / L</span>
            <span className="legend-desc">Match wins and losses</span>
          </div>
          <div className="legend-item">
            <span className="legend-label">Win%</span>
            <span className="legend-desc">Win percentage</span>
          </div>
          <div className="legend-item">
            <span className="legend-label">Maps</span>
            <span className="legend-desc">Total maps played</span>
          </div>
          <div className="legend-item">
            <span className="legend-label">MD</span>
            <span className="legend-desc">Map differential (maps won - maps lost)</span>
          </div>
          <div className="legend-item">
            <span className="legend-label">RD</span>
            <span className="legend-desc">Round differential (rounds won - rounds lost)</span>
          </div>
        </div>
        
        <div className="tiebreaker-info">
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