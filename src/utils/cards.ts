// mueve un elemento dentro de un array de tarjetas
export function reorderCards(
  cards: (string | number)[], // array original de valores (números o strings)
  fromIndex: number,          // posición inicial del elemento a mover
  toIndex: number             // posición destino donde colocarlo
): (string | number)[] {
  // Clonamos el array para no mutar el original
  const updated = [...cards];

  // Sacamos (splice) el elemento desde fromIndex; queda en [moved]
  const [moved] = updated.splice(fromIndex, 1);

  // Insertamos ese elemento en la posición toIndex
  updated.splice(toIndex, 0, moved);

  // Devolvemos el nuevo array reordenado
  return updated;
}