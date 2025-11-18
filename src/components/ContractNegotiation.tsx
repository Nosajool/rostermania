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
import styles from './ContractNegotiation.module.css';

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
    <div className={styles['contract-modal-overlay']} onClick={onCancel}>
      <div className={styles['contract-modal']} onClick={(e) => e.stopPropagation()}>
        <div className={styles['modal-header']}>
          <h2>Contract Negotiation</h2>
          <button className={styles['close-button']} onClick={onCancel}>×</button>
        </div>

        <div className={styles['modal-content']}>
          {/* Player Info */}
          <div className={styles['player-summary']}>
            <div className={styles['player-info-card']}>
              <h3>{player.name}</h3>
              <div className={styles['player-quick-info']}>
                <span className={styles['info-item']}>{player.role}</span>
                <span className={styles['info-item']}>Age {player.age}</span>
                <span className={`${styles['info-item']} ${styles['rating']}`}>Overall: {overallRating}</span>
              </div>
            </div>
          </div>

          {negotiationStatus === 'initial' && (
            <>
              {/* Contract Terms */}
              <div className={styles['contract-terms']}>
                <h4>Offer Terms</h4>

                <div className={styles['term-row']}>
                  <label>Contract Length</label>
                  <div className={styles['year-selector']}>
                    {[1, 2, 3, 4].map(years => (
                      <button
                        key={years}
                        className={`${styles['year-button']} ${contractYears === years ? styles['active'] : ''}`}
                        onClick={() => setContractYears(years)}
                      >
                        {years} {years === 1 ? 'Year' : 'Years'}
                      </button>


                    ))}
                  </div>
                </div>

                <div className={styles['term-row']}>
                  <label>Annual Salary</label>
                  <div className={styles['salary-input-container']}>
                    <input
                      type="range"
                      min={100000}
                      max={2000000}
                      step={50000}
                      value={salary}
                      onChange={(e) => setSalary(Number(e.target.value))}
                      className={styles['salary-slider']}
                    />
                    <input
                      type="number"
                      value={salary}
                      onChange={(e) => setSalary(Number(e.target.value))}
                      className={styles['salary-number-input']}
                    />
                  </div>
                  <div className={styles['salary-display']}>{formatSalary(salary)} per year</div>
                  <div className={styles['suggested-salary']}>
                    Suggested: {formatSalary(suggestedSalary)}
                  </div>
                </div>

                <div className={styles['contract-summary']}>
                  <div className={styles['summary-row']}>
                    <span>Total Contract Value</span>
                    <span className={styles['summary-value']}>{formatSalary(salary * contractYears)}</span>
                  </div>
                  <div className={styles['summary-row']}>
                    <span>Buyout Clause</span>
                    <span className={styles['summary-value']}>{formatSalary(salary * contractYears * 0.75)}</span>
                  </div>
                  <div className={styles['summary-row']}>
                    <span>Current Team Salaries</span>
                    <span className={styles['summary-value']}>{formatSalary(currentSalaries)}</span>
                  </div>
                  <div className={`${styles['summary-row']} ${styles['important']}`}>
                    <span>Remaining Budget</span>
                    <span className={`${styles['summary-value']} ${remainingBudget - salary < 0 ? styles['negative'] : ''}`}>
                      {formatSalary(remainingBudget - salary)}
                    </span>
                  </div>
                </div>
              </div>

              <div className={styles['modal-actions']}>
                <button className={styles['cancel-button']} onClick={onCancel}>
                  Cancel
                </button>
                <button
                  className={styles['propose-button']}
                  onClick={handlePropose}
                  disabled={remainingBudget - salary < 0}
                >
                  Propose Contract
                </button>
              </div>
            </>
          )}

          {negotiationStatus === 'counter' && counterOffer && (
            <div className={styles['negotiation-result']}>
              <div className={`${styles['result-icon']} ${styles['counter']}`}>⚠️</div>
              <h3>Counter Offer Received</h3>
              <p className={styles['result-message']}>
                {player.name} has countered your offer with the following terms:
              </p>

              <div className={styles['counter-details']}>
                <div className={styles['detail-row']}>
                  <span>Salary per Year</span>
                  <span className={styles['detail-value']}>{formatSalary(counterOffer.salary)}</span>
                </div>
                <div className={styles['detail-row']}>
                  <span>Contract Length</span>
                  <span className={styles['detail-value']}>{counterOffer.yearsRemaining} years</span>
                </div>
                <div className={styles['detail-row']}>
                  <span>Total Value</span>
                  <span className={styles['detail-value']}>{formatSalary(counterOffer.salary * counterOffer.yearsRemaining)}</span>
                </div>
                <div className={`${styles['detail-row']} ${styles['highlight']}`}>
                  <span>Remaining Budget After</span>
                  <span className={`${styles['detail-value']} ${remainingBudget - counterOffer.salary < 0 ? styles['negative'] : styles['positive']}`}>
                    {formatSalary(remainingBudget - counterOffer.salary)}
                  </span>
                </div>
              </div>

              <div className={styles['modal-actions']}>
                <button className={styles['reject-button']} onClick={handleRejectCounter}>
                  Reject Offer
                </button>
                <button
                  className={styles['accept-button']}
                  onClick={handleAcceptCounter}
                  disabled={remainingBudget - counterOffer.salary < 0}
                >
                  Accept Counter Offer
                </button>
              </div>
            </div>
          )}

          {negotiationStatus === 'accepted' && (
            <div className={styles['negotiation-result']}>
              <div className={`${styles['result-icon']} ${styles['success']}`}>✓</div>
              <h3>Offer Accepted!</h3>
              <p className={styles['result-message']}>
                {player.name} has accepted your contract offer!
              </p>

              <div className={styles['final-terms']}>
                <div className={styles['detail-row']}>
                  <span>Annual Salary</span>
                  <span className={styles['detail-value']}>{formatSalary(salary)}</span>
                </div>
                <div className={styles['detail-row']}>
                  <span>Contract Length</span>
                  <span className={styles['detail-value']}>{contractYears} years</span>
                </div>
              </div>

              <div className={styles['modal-actions']}>
                <button className={styles['finalize-button']} onClick={handleFinalSign}>
                  Sign Player
                </button>
              </div>
            </div>
          )}

          {negotiationStatus === 'rejected' && (
            <div className={styles['negotiation-result']}>
              <div className={`${styles['result-icon']} ${styles['failure']}`}>✗</div>
              <h3>Negotiation Failed</h3>
              <p className={styles['result-message']}>
                {player.name} has rejected your offer. You may try again with a better offer.
              </p>

              <div className={styles['modal-actions']}>
                <button className={styles['back-button']} onClick={() => setNegotiationStatus('initial')}>
                  Make New Offer
                </button>
                <button className={styles['cancel-button']} onClick={onCancel}>
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
