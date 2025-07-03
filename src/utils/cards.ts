export function reorderCards(cards: (string | number)[], fromIndex: number, toIndex: number): (string | number)[] {
  const updated = [...cards];
  const [moved] = updated.splice(fromIndex, 1);
  updated.splice(toIndex, 0, moved);
  return updated;
}
