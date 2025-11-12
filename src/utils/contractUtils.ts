import type { Player, PlayerContract } from '../types/types';

// Calculate suggested salary based on player overall rating
export function calculateSuggestedSalary(player: Player): number {
  const overallRating = calculateOverallRating(player);
  
  // Salary tiers based on rating
  if (overallRating >= 90) return 1500000;  // Elite: $1.5M
  if (overallRating >= 85) return 1200000;  // Star: $1.2M
  if (overallRating >= 80) return 900000;   // Great: $900K
  if (overallRating >= 75) return 700000;   // Good: $700K
  if (overallRating >= 70) return 500000;   // Solid: $500K
  if (overallRating >= 65) return 350000;   // Average: $350K
  if (overallRating >= 60) return 250000;   // Below Average: $250K
  return 200000;                             // Tier 2/Prospect: $200K
}

// Calculate player overall rating (0-100)
export function calculateOverallRating(player: Player): number {
  const stats = Object.values(player.stats);
  const sum = stats.reduce((acc, val) => acc + val, 0);
  return Math.round(sum / stats.length);
}

// Calculate buyout clause (usually 50-100% of remaining contract value)
export function calculateBuyoutClause(salary: number, yearsRemaining: number): number {
  const remainingValue = salary * yearsRemaining;
  const multiplier = 0.75; // 75% of remaining value
  return Math.round(remainingValue * multiplier);
}

// Generate a contract offer for a free agent
export function generateContractOffer(player: Player, years: number = 2): PlayerContract {
  const salary = calculateSuggestedSalary(player);
  const buyout = calculateBuyoutClause(salary, years);
  
  return {
    salary,
    yearsRemaining: years,
    totalYears: years,
    buyoutClause: buyout,
    signedDate: new Date(),
  };
}

// Check if team can afford a contract
export function canAffordContract(
  teamBudget: number,
  currentSalaries: number,
  newContract: PlayerContract
): boolean {
  const totalSalaries = currentSalaries + newContract.salary;
  return totalSalaries <= teamBudget;
}

// Calculate total team salary
export function calculateTeamSalary(roster: Player[]): number {
  return roster.reduce((total, player) => {
    return total + (player.contract?.salary || 0);
  }, 0);
}

// Get remaining budget after salaries
export function getRemainingBudget(teamBudget: number, roster: Player[]): number {
  const totalSalaries = calculateTeamSalary(roster);
  return teamBudget - totalSalaries;
}

// Format currency
export function formatSalary(amount: number): string {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(2)}M`;
  }
  if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(0)}K`;
  }
  return `$${amount}`;
}

// Get contract status color
export function getContractStatusColor(yearsRemaining: number): string {
  if (yearsRemaining <= 0.5) return '#ef4444'; // Red - expiring soon
  if (yearsRemaining <= 1) return '#fbbf24';   // Yellow - 1 year left
  return '#4ade80';                             // Green - secure
}

// Contract negotiation - adjust offer based on player preference
export interface NegotiationResult {
  accepted: boolean;
  counterOffer?: PlayerContract;
  reason?: string;
}

export function negotiateContract(
  player: Player,
  offer: PlayerContract,
  teamReputation: number = 50 // 0-100 scale
): NegotiationResult {
  const suggestedSalary = calculateSuggestedSalary(player);
  const overallRating = calculateOverallRating(player);
  
  // Young prospects are easier to sign
  const ageModifier = player.age <= 21 ? 0.9 : 1.0;
  
  // Better teams can offer lower salaries
  const reputationModifier = 1 - (teamReputation / 200); // Max 50% discount
  
  const minimumAcceptable = suggestedSalary * ageModifier * (1 - reputationModifier);
  
  // Accept if offer is within 10% of minimum
  if (offer.salary >= minimumAcceptable * 0.9) {
    return { accepted: true };
  }
  
  // Counter with higher salary
  const counterSalary = Math.round(minimumAcceptable * 1.1);
  const counterOffer: PlayerContract = {
    ...offer,
    salary: counterSalary,
    buyoutClause: calculateBuyoutClause(counterSalary, offer.yearsRemaining),
  };
  
  return {
    accepted: false,
    counterOffer,
    reason: `${player.name} wants at least ${formatSalary(counterSalary)} per year.`,
  };
}

// Advance contracts by one year (for season progression)
export function advanceContracts(roster: Player[]): Player[] {
  return roster.map(player => {
    if (!player.contract) return player;
    
    return {
      ...player,
      contract: {
        ...player.contract,
        yearsRemaining: Math.max(0, player.contract.yearsRemaining - 1),
      },
    };
  });
}

// Get players with expiring contracts
export function getExpiringContracts(roster: Player[], threshold: number = 1): Player[] {
  return roster.filter(player => {
    if (!player.contract) return false;
    return player.contract.yearsRemaining <= threshold && player.contract.yearsRemaining > 0;
  });
}

// Get players with expired contracts (free agents)
export function getExpiredContracts(roster: Player[]): Player[] {
  return roster.filter(player => {
    if (!player.contract) return false;
    return player.contract.yearsRemaining <= 0;
  });
}