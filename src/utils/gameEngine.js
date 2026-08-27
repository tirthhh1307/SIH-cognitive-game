export function shuffle(items, random = Math.random) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

export function createMatchDeck(pairs, limit, random = Math.random) {
  const selected = pairs.slice(0, limit);
  return shuffle(selected.flatMap(item => [
    { ...item, key: `${item.id}-a` },
    { ...item, key: `${item.id}-b` }
  ]), random);
}

export function createSequence(items, length, random = Math.random) {
  if (!items.length || length <= 0) return [];
  return Array.from({ length }, () => items[Math.floor(random() * items.length)].id);
}

export function evaluateOrder(answerIds, expectedIds) {
  return answerIds.length === expectedIds.length && answerIds.every((id, index) => id === expectedIds[index]);
}

export function getStageLimit(stage, difficulty, available) {
  if (stage === 'severe') return Math.min(2, available);
  if (stage === 'moderate') return Math.min(3 + difficulty, available);
  return Math.min(5 + difficulty, available);
}

export function scoreRound(correct, total) {
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
  return { accuracy, score: accuracy };
}
