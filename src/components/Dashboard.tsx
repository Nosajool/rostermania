import { useState } from 'react';
import type { Region } from '../types/types';
import { useGame } from '../hooks/useGame';
import RosterView from './RosterView';
import ScheduleView from './ScheduleView';
import StandingsView from './StandingsView';
import './Dashboard.css';

interface DashboardProps {
  teamName: string;
  region: Region;
}

type DashboardTab = 'overview' | 'roster' | 'schedule' | 'standings';

export default function Dashboard({ teamName, region }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<DashboardTab>('roster');
  const { schedule } = useGame();

  const wins = schedule.filter(m => m.winner?.name === teamName).length;
  const losses = schedule.filter(m => m.winner && m.winner.name !== teamName && (m.teamA.name === teamName || m.teamB.name === teamName)).length;

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
                <span className="stat-value">0</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Round Differential</span>
                <span className="stat-value">0</span>
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
      </div>
    </div>
  );
}
