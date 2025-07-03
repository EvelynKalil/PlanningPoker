import React from 'react';
import { render, screen } from '@testing-library/react';
import VotingResults from '../../src/components/organisms/VotingResults/VotingResults';

describe('VotingResults', () => {
  it('muestra los votos y el promedio correctamente', () => {
  const players = [
    { name: 'Alice', selectedCard: 5 },
    { name: 'Bob', selectedCard: 8 },
    { name: 'Carl', selectedCard: '☕' },
    { name: 'Dana', selectedCard: '?', isNew: true }, // no debe contarse
  ];

  render(<VotingResults players={players} />);

  // Cartas específicas
  expect(screen.getByText('5')).toBeInTheDocument();
  expect(screen.getByText('8')).toBeInTheDocument();
  expect(screen.getByText('☕')).toBeInTheDocument();

  // Recuento
  expect(screen.getAllByText('1 voto')).toHaveLength(3);

  // Promedio
  expect(screen.getByText('Promedio:')).toBeInTheDocument();
  expect(screen.getByText('6.5')).toBeInTheDocument(); // (5 + 8) / 2
});


  it('muestra promedio 0 si no hay votos numéricos', () => {
    const players = [
      { name: 'Foo', selectedCard: '?' },
      { name: 'Bar', selectedCard: '☕' },
    ];

    render(<VotingResults players={players} />);

    expect(screen.getByText('Promedio:')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
  });
});
