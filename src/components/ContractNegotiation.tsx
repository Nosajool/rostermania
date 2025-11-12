import { useState } from 'react';
import type { Player, PlayerContract } from '../types/types';
import {
  calculateSuggestedSalary,
  calculateOverallRating,
  generateContractOffer,
  formatSalary,
  negotiateContract,
  canAffordContract,
  calculateTeamSalary,
} from '../utils/contractUtils';
import './ContractNegotiation.css';

interface ContractNegotiationProps {
  player: Player;
  currentRoster: Player[];
  teamBudget: number;
  onSign: (contract: PlayerContract) => void;
  onCancel: () => void;
}

export default function ContractNegotiation({
  player,
  currentRoster,
  teamBudget,
  onSign,
  onCancel,
}: ContractNegotiationProps) {
  const suggestedSalary = calculateSuggestedSalary(player);
  const [contractYears, setContractYears] = useState(2);
  const [salary, setSalary] = useState(suggestedSalary);
  const [negotiationStatus, setNegotiationStatus] = useState<'initial' | 'counter' | 'accepted' | 'rejected'>('initial');
  const [counterOffer, setCounterOffer] = useState<PlayerContract | null>(null);

  const currentSalaries = calculateTeamSalary(currentRoster);
  const remainingBudget = teamBudget - currentSalaries;
  const overallRating = calculateOverallRating(player);

  const handlePropose = () => {
    const offer = generateContractOffer(player, contractYears);
    offer.salary = salary;

    // Check if team can afford
    if (!canAffordContract(teamBudget, currentSalaries, offer)) {
      alert('Your team cannot afford this contract!');
      return;
    }

    // Negotiate with player
    const result = negotiateContract(player, offer, 60); // 60 team reputation for now

    if (result.accepted) {
      setNegotiationStatus('accepted');
    } else {
      setNegotiationStatus('counter');
      setCounterOffer(result.counterOffer!);
    }
  };

  const handleAcceptCounter = () => {
    if (counterOffer) {
      if (canAffordContract(teamBudget, currentSalaries, counterOffer)) {
        onSign(counterOffer);
      } else {
        alert('Your team cannot afford this counter offer!');
      }
    }
  };

  const handleRejectCounter = () => {
    setNegotiationStatus('rejected');
  };

  const handleFinalSign = () => {
    const finalContract = generateContractOffer(player, contractYears);
    finalContract.salary = salary;
    onSign(finalContract);
  };

  return (
    <div className="contract-modal-overlay" onClick={onCancel}>
      <div className="contract-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Contract Negotiation</h2>
          <button className="close-button" onClick={onCancel}>×</button>
        </div>

        <div className="modal-content">
          {/* Player Info */}
          <div className="player-summary">
            <div className="player-info-card">
              <h3>{player.name}</h3>
              <div className="player-quick-info">
                <span className="info-item">{player.role}</span>
                <span className="info-item">Age {player.age}</span>
                <span className="info-item rating">Overall: {overallRating}</span>
              </div>
            </div>
          </div>

          {negotiationStatus === 'initial' && (
            <>
              {/* Contract Terms */}
              <div className="contract-terms">
                <h4>Offer Terms</h4>
                
                <div className="term-row">
                  <label>Contract Length</label>
                  <div className="year-selector">
                    {[1, 2, 3, 4].map(years => (
                      <button
                        key={years}
                        className={`year-button ${contractYears === years ? 'active' : ''}`}
                        onClick={() => setContractYears(years)}
                      >
                        {years} {years === 1 ? 'Year' : 'Years'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="term-row">
                  <label>Annual Salary</label>
                  <div className="salary-input-container">
                    <input
                      type="range"
                      min={100000}
                      max={2000000}
                      step={50000}
                      value={salary}
                      onChange={(e) => setSalary(Number(e.target.value))}
                      className="salary-slider"
                    />
                    <input
                      type="number"
                      value={salary}
                      onChange={(e) => setSalary(Number(e.target.value))}
                      className="salary-number-input"
                    />
                  </div>
                  <div className="salary-display">{formatSalary(salary)} per year</div>
                  <div className="suggested-salary">
                    Suggested: {formatSalary(suggestedSalary)}
                  </div>
                </div>

                <div className="contract-summary">
                  <div className="summary-row">
                    <span>Total Contract Value</span>
                    <span className="summary-value">{formatSalary(salary * contractYears)}</span>
                  </div>
                  <div className="summary-row">
                    <span>Buyout Clause</span>
                    <span className="summary-value">{formatSalary(salary * contractYears * 0.75)}</span>
                  </div>
                  <div className="summary-row">
                    <span>Current Team Salaries</span>
                    <span className="summary-value">{formatSalary(currentSalaries)}</span>
                  </div>
                  <div className="summary-row important">
                    <span>Remaining Budget</span>
                    <span className={`summary-value ${remainingBudget - salary < 0 ? 'negative' : ''}`}>
                      {formatSalary(remainingBudget - salary)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <button className="cancel-button" onClick={onCancel}>
                  Cancel
                </button>
                <button 
                  className="propose-button"
                  onClick={handlePropose}
                  disabled={remainingBudget - salary < 0}
                >
                  Propose Contract
                </button>
              </div>
            </>
          )}

          {negotiationStatus === 'counter' && counterOffer && (
            <div className="negotiation-result">
              <div className="result-icon counter">⚠️</div>
              <h3>Counter Offer Received</h3>
              <p className="result-message">
                {player.name} has countered your offer with the following terms:
              </p>
              
              <div className="counter-details">
                <div className="detail-row">
                  <span>Salary per Year</span>
                  <span className="detail-value">{formatSalary(counterOffer.salary)}</span>
                </div>
                <div className="detail-row">
                  <span>Contract Length</span>
                  <span className="detail-value">{counterOffer.yearsRemaining} years</span>
                </div>
                <div className="detail-row">
                  <span>Total Value</span>
                  <span className="detail-value">{formatSalary(counterOffer.salary * counterOffer.yearsRemaining)}</span>
                </div>
                <div className="detail-row highlight">
                  <span>Remaining Budget After</span>
                  <span className={`detail-value ${remainingBudget - counterOffer.salary < 0 ? 'negative' : 'positive'}`}>
                    {formatSalary(remainingBudget - counterOffer.salary)}
                  </span>
                </div>
              </div>

              <div className="modal-actions">
                <button className="reject-button" onClick={handleRejectCounter}>
                  Reject Offer
                </button>
                <button 
                  className="accept-button"
                  onClick={handleAcceptCounter}
                  disabled={remainingBudget - counterOffer.salary < 0}
                >
                  Accept Counter Offer
                </button>
              </div>
            </div>
          )}

          {negotiationStatus === 'accepted' && (
            <div className="negotiation-result">
              <div className="result-icon success">✓</div>
              <h3>Offer Accepted!</h3>
              <p className="result-message">
                {player.name} has accepted your contract offer!
              </p>
              
              <div className="final-terms">
                <div className="detail-row">
                  <span>Annual Salary</span>
                  <span className="detail-value">{formatSalary(salary)}</span>
                </div>
                <div className="detail-row">
                  <span>Contract Length</span>
                  <span className="detail-value">{contractYears} years</span>
                </div>
              </div>

              <div className="modal-actions">
                <button className="finalize-button" onClick={handleFinalSign}>
                  Sign Player
                </button>
              </div>
            </div>
          )}

          {negotiationStatus === 'rejected' && (
            <div className="negotiation-result">
              <div className="result-icon failure">✗</div>
              <h3>Negotiation Failed</h3>
              <p className="result-message">
                {player.name} has rejected your offer. You may try again with a better offer.
              </p>

              <div className="modal-actions">
                <button className="back-button" onClick={() => setNegotiationStatus('initial')}>
                  Make New Offer
                </button>
                <button className="cancel-button" onClick={onCancel}>
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}