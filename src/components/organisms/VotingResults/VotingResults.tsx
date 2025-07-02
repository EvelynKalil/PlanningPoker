import React from 'react';
import './VotingResults.css';

interface Player {
  name: string;
  selectedCard: number | string | null;
  isNew?: boolean;
}

interface VotingResultsProps {
  players: Player[];
}

const VotingResults: React.FC<VotingResultsProps> = ({ players }) => {
  // 🔹 Filtramos los jugadores que no son nuevos
  const activePlayers = players.filter(p => !p.isNew);

  // 🔹 Extraemos las cartas seleccionadas
  const selectedCards = activePlayers.map(p => p.selectedCard);

  // 🔸 Promedio solo con números
  const numericVotes = selectedCards.filter(
    (card): card is number => typeof card === 'number'
  );

  const promedio =
    numericVotes.length > 0
      ? (
          numericVotes.reduce((acc, val) => acc + val, 0) /
          numericVotes.length
        ).toFixed(1)
      : '0';

  // 🧮 Contamos los votos numéricos
  const numericVoteMap = new Map<number, number>();
  numericVotes.forEach(card => {
    numericVoteMap.set(card, (numericVoteMap.get(card) || 0) + 1);
  });

  // 🤖 Contamos los votos no numéricos (emojis, letras...)
  const nonNumericVotes = selectedCards.filter(
    (card): card is string =>
      typeof card === 'string' && card.trim().length > 0
  );

  const nonNumericVoteMap = new Map<string, number>();
  nonNumericVotes.forEach(card => {
    nonNumericVoteMap.set(card, (nonNumericVoteMap.get(card) || 0) + 1);
  });

  return (
    <div className="voting-results-wrapper">
      <div className="result-cards">

        {/* 🔢 Mostrar resultados numéricos */}
        {[...numericVoteMap.entries()]
          .sort((a, b) => a[0] - b[0])
          .map(([value, count]) => (
            <div key={value} className="result-card">
              <div className="carta">{value}</div>
              <div className="card-count">{count} voto{count > 1 ? 's' : ''}</div>
            </div>
          ))}

        {/* 😄 Mostrar resultados no numéricos */}
        {[...nonNumericVoteMap.entries()].map(([value, count]) => (
          <div key={value} className="result-card">
            <div className="carta">{value}</div>
            <div className="card-count">{count} voto{count > 1 ? 's' : ''}</div>
          </div>
        ))}

      </div>

      {/* 📊 Mostrar promedio */}
      <div className="average-box">
        <span>Promedio:</span>
        <strong>{promedio}</strong>
      </div>
    </div>
  );
};

export default VotingResults;
