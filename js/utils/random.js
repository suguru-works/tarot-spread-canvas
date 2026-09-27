const UINT32_RANGE = 0x100000000;

export function getSecureRandomInt(maxExclusive) {
  if (!Number.isInteger(maxExclusive) || maxExclusive <= 0) {
    throw new RangeError("maxExclusive must be a positive integer");
  }
  const limit = Math.floor(UINT32_RANGE / maxExclusive) * maxExclusive;
  const buffer = new Uint32Array(1);
  let value;
  do {
    crypto.getRandomValues(buffer);
    value = buffer[0];
  } while (value >= limit);
  return value % maxExclusive;
}

export function shuffleCards(cards, randomInt = getSecureRandomInt) {
  const shuffled = [...cards];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = randomInt(index + 1);
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

export function createRandomCardLayout(cards, slotIds, {
  includeReversed = true,
  randomInt = getSecureRandomInt,
} = {}) {
  if (slotIds.length > cards.length) throw new RangeError("Not enough cards for the active spread");
  const shuffled = shuffleCards(cards, randomInt);
  return Object.fromEntries(slotIds.map((slotId, index) => [slotId, {
    cardId: shuffled[index].id,
    reversed: includeReversed ? randomInt(2) === 1 : false,
  }]));
}
