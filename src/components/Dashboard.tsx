import { useState } from 'react';
import type { Region } from '../types/types';
import RosterView from './RosterView';
import ScheduleView from './ScheduleView';
import StandingsView from './StandingsView';
import TrainingCenter from './TrainingCenter';
import { useGame } from '../hooks/useGame';
import './Dashboard.css';

interface DashboardProps {
  teamName: string;
  region: Region;
}

type DashboardTab = 'overview' | 'roster' | 'schedule' | 'standings' | 'training';

export default function Dashboard({ teamName, region }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<DashboardTab>('roster');
  const { schedule } = useGame();
  
  // Calculate wins and losses from actual match results
  const wins = schedule.filter(m => m.winner?.name === teamName).length;
  const losses = schedule.filter(m => 
    m.winner && 
    m.winner.name !== teamName && 
    (m.teamA.name === teamName || m.teamB.name === teamName)
  ).length;

  // Calculate map and round differentials
  let mapDifferential = 0;
  let roundDifferential = 0;

  schedule.forEach(match => {
    if (!match.maps || !match.winner) return;
    
    const isTeamA = match.teamA.name === teamName;
    const isTeamB = match.teamB.name === teamName;
    
    if (!isTeamA && !isTeamB) return;

    // Calculate map differential
    const teamMaps = match.maps.filter(m => 
      (isTeamA && m.winner === 'teamA') || (isTeamB && m.winner === 'teamB')
    ).length;
    const opponentMaps = match.maps.length - teamMaps;
    mapDifferential += teamMaps - opponentMaps;

    // Calculate round differential
    match.maps.forEach(map => {
      if (isTeamA) {
        roundDifferential += map.teamAScore - map.teamBScore;
      } else if (isTeamB) {
        roundDifferential += map.teamBScore - map.teamAScore;
      }
    });
  });

  return (
    <div className="dashboard">
      {/* Top Navigation Bar */}
      <nav className="dashboard-nav">
        <div className="nav-content">
          <div className="team-info">
            <h1 className="team-name">{teamName}</h1>
            <span className="region-badge">{region}</span>
          </div>
          
          <div className="season-info">
            <span className="season-label">Season 2025</span>
            <span className="stage-label">Stage 1 - Week 1</span>
          </div>
        </div>
      </nav>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`tab-button ${activeTab === 'roster' ? 'active' : ''}`}
          onClick={() => setActiveTab('roster')}
        >
          Roster
        </button>
        <button
          className={`tab-button ${activeTab === 'schedule' ? 'active' : ''}`}
          onClick={() => setActiveTab('schedule')}
        >
          Schedule
        </button>
        <button
          className={`tab-button ${activeTab === 'standings' ? 'active' : ''}`}
          onClick={() => setActiveTab('standings')}
        >
          Standings
        </button>
        <button
          className={`tab-button ${activeTab === 'training' ? 'active' : ''}`}
          onClick={() => setActiveTab('training')}
        >
          Training
        </button>
      </div>

      {/* Content Area */}
      <div className="dashboard-content">
        {activeTab === 'overview' && (
          <div className="overview-tab">
            <h2>Team Overview</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <span className="stat-label">Record</span>
                <span className="stat-value">{wins}-{losses}</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Map Differential</span>
                <span className="stat-value">{mapDifferential > 0 ? '+' : ''}{mapDifferential}</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Round Differential</span>
                <span className="stat-value">{roundDifferential > 0 ? '+' : ''}{roundDifferential}</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Budget</span>
                <span className="stat-value">$2.5M</span>
              </div>
            </div>

            <div className="next-match">
              <h3>Next Match</h3>
              <p className="coming-soon">Match schedule coming soon...</p>
            </div>
          </div>
        )}

        {activeTab === 'roster' && (
          <RosterView teamName={teamName} region={region} />
        )}

        {activeTab === 'schedule' && (
          <ScheduleView teamName={teamName} region={region} />
        )}

        {activeTab === 'standings' && (
          <StandingsView teamName={teamName} region={region} />
        )}

        {activeTab === 'training' && (
          <TrainingCenter />
        )}
      </div>
    </div>
  );
}