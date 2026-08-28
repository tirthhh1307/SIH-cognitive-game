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

export const MOTIVATIONAL_QUOTES = [
  "Every step forward is a victory for the heart and mind! 🌟",
  "Your memory is like a blooming garden, growing stronger every day! 🌸",
  "Brilliant focus and determination! You did wonderfully! ✨",
  "A happy mind brings a joyful day. Fantastic achievement! 💖",
  "You are making outstanding progress, keep smiling and shining! ☀️",
  "Celebrating your sharp memory and wonderful effort! 🎉"
];

export const RETRY_ENCOURAGEMENT_QUOTES = [
  "Take your time and take a deep breath. You can do this! 🌿",
  "Every attempt makes your memory sharper. Let's try again with joy! 💫",
  "Mistakes are just gentle steps on our path of learning. You've got this! 🌼",
  "Believe in yourself! Take another look and give it another try. 🌈",
  "Practice brings confidence and peace. Let's try one more time! 🌻"
];

export function getRandomQuote(quotes) {
  return quotes[Math.floor(Math.random() * quotes.length)];
}

export function createJigsawGrid(rows, cols) {
  const pieces = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const index = r * cols + c;
      pieces.push({ id: index, row: r, col: c, currentPos: index });
    }
  }
  return pieces;
}

