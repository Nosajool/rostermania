import { useState } from 'react';
import type { Region } from '../types/types';
import { getTeamsByRegion } from '../data/gameData';
import './TeamSelection.css';

interface TeamSelectionProps {
  onTeamSelected: (teamName: string, region: Region) => void;
}

export default function TeamSelection({ onTeamSelected }: TeamSelectionProps) {
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);

  const regions: Region[] = ['Americas', 'EMEA', 'Pacific', 'China'];

  const handleRegionSelect = (region: Region) => {
    setSelectedRegion(region);
    setSelectedTeam(null); // Reset team selection when region changes
  };

  const handleTeamSelect = (teamName: string) => {
    setSelectedTeam(teamName);
  };

  const handleConfirm = () => {
    if (selectedRegion && selectedTeam) {
      onTeamSelected(selectedTeam, selectedRegion);
    }
  };

  const teams = selectedRegion ? getTeamsByRegion(selectedRegion) : [];

  return (
    <div className="team-selection">
      <div className="selection-container">
        <header className="selection-header">
          <h1>Rostermania</h1>
          <p>Choose your region and team to begin your journey</p>
        </header>

        {/* Region Selection */}
        <section className="region-section">
          <h2>Select Your Region</h2>
          <div className="region-grid">
            {regions.map((region) => (
              <button
                key={region}
                className={`region-card ${selectedRegion === region ? 'selected' : ''}`}
                onClick={() => handleRegionSelect(region)}
              >
                <div className="region-icon">{getRegionIcon(region)}</div>
                <h3>{region}</h3>
                <p className="region-info">12 Teams • International League</p>
              </button>
            ))}
          </div>
        </section>

        {/* Team Selection */}
        {selectedRegion && (
          <section className="team-section">
            <h2>Select Your Team</h2>
            <div className="team-grid">
              {teams.map((team) => (
                <button
                  key={team.name}
                  className={`team-card ${selectedTeam === team.name ? 'selected' : ''}`}
                  onClick={() => handleTeamSelect(team.name)}
                >
                  <div className="team-header">
                    <span className="team-tag">{team.shortName}</span>
                    <h3>{team.name}</h3>
                  </div>
                  <div className="team-roster">
                    {team.roster.map((player) => (
                      <div key={player.name} className="player-item">
                        <span className="player-name">{player.name}</span>
                        <span className="player-role">{player.role}</span>
                      </div>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Confirm Button */}
        {selectedTeam && (
          <div className="confirm-section">
            <button className="confirm-button" onClick={handleConfirm}>
              Start Managing {selectedTeam}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function getRegionIcon(region: Region): string {
  const icons: Record<Region, string> = {
    Americas: '🌎',
    EMEA: '🌍',
    Pacific: '🌏',
    China: '🇨🇳',
  };
  return icons[region];
}