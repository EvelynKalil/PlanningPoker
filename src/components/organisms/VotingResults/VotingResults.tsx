import React from 'react'
import './VotingResults.css'

interface Player {
  name: string
  selectedCard: number | string | null
  isNew?: boolean
}

interface VotingResultsProps {
  players: Player[]
}

const VotingResults: React.FC<VotingResultsProps> = ({ players }) => {
  const votesOnly = players
    .filter(p => !p.isNew)
    .map(p => p.selectedCard)
    .filter((card): card is number => typeof card === 'number');

  const voteMap = new Map<number, number>();
  votesOnly.forEach(card => {
    voteMap.set(card, (voteMap.get(card) || 0) + 1);
  });

  const promedio =
    votesOnly.length > 0
      ? (votesOnly.reduce((acc, val) => acc + val, 0) / votesOnly.length).toFixed(1)
      : '0';

  return (
    <div className="voting-results-wrapper">
      <div className="result-cards">
        {[...voteMap.entries()].sort((a, b) => a[0] - b[0]).map(([value, count]) => (
          <div key={value} className="result-card">
            <div className="carta">{value}</div>
            <div className="card-count">{count} Voto{count > 1 ? 's' : ''}</div>
          </div>
        ))}
      </div>
      <div className="average-box">
        <span>Promedio:</span>
        <strong>{promedio}</strong>
      </div>
    </div>
  );
};

export default VotingResults;
