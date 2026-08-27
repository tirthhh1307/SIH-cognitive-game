export const STAGES = ['mild', 'moderate', 'severe'];

export const GAME_CATEGORIES = [
  'working-memory',
  'long-term-memory',
  'episodic-memory',
  'semantic-memory',
  'procedural-memory',
  'recognition-memory',
  'cultural-memory',
  'attention',
  'language',
  'sensory'
];

export const CATEGORY_LABELS = {
  'working-memory': 'Working Memory',
  'long-term-memory': 'Long-Term Memory',
  'episodic-memory': 'Recent Memories',
  'semantic-memory': 'Words & Knowledge',
  'procedural-memory': 'Daily Routines',
  'recognition-memory': 'Faces & Recognition',
  'cultural-memory': 'Culture & Heritage',
  attention: 'Attention & Focus',
  language: 'Language',
  sensory: 'Sensory Stimulation'
};

const ENGINES = ['match', 'sequence', 'recall', 'choice', 'sorting', 'audio', 'action'];
const standardDifficulty = {
  mild: { min: 2, max: 3, initial: 2 },
  moderate: { min: 1, max: 2, initial: 1 },
  severe: { min: 1, max: 1, initial: 1 }
};

const pair = (id, label, symbol) => ({ id, label, symbol });
const step = (id, label, symbol) => ({ id, label, symbol });
const option = (id, label, symbol = '') => ({ id, label, symbol });
const choice = (prompt, options, correct, explanation, sound) => ({
  prompt,
  options,
  correct,
  explanation,
  ...(sound ? { sound } : {})
});
const game = (id, name, category, stages, engine, description, instructions, content) => ({
  id,
  name,
  category,
  stages,
  engine,
  description,
  instructions,
  content,
  difficulty: standardDifficulty
});

export const GAMES = [
  game('card-match', 'Card Match / Memory Flip', 'working-memory', ['mild'], 'match',
    'Match familiar North East objects and symbols.', 'Turn over two cards and find every matching pair.', {
      pairs: [pair('japi', 'Japi', '👒'), pair('tea', 'Tea', '🍵'), pair('dhol', 'Dhol', '🪘'), pair('lotus', 'Lotus', '🪷'), pair('bamboo', 'Bamboo', '🎋'), pair('rhino', 'Rhino', '🦏')]
    }),
  game('sequence-repeat', 'Sequence Repeat', 'working-memory', ['mild'], 'sequence',
    'Remember a short pattern of sights and sounds.', 'Watch the pattern, then tap the same symbols in order.', {
      mode: 'repeat',
      items: [step('tea', 'Tea Leaf', '🌿'), step('dhol', 'Dhol', '🪘'), step('lotus', 'Lotus', '🪷'), step('bird', 'Hornbill', '🐦'), step('sun', 'Sun', '☀️')]
    }),
  game('item-recall', 'Number / Item Recall', 'working-memory', ['mild', 'moderate'], 'recall',
    'Study a few familiar items, then recall what appeared.', 'Look at the items. Continue when ready and choose the remembered item.', {
      rounds: [
        { shown: ['🍵 Tea', '🪘 Dhol', '🪷 Lotus'], prompt: 'Which item did you see?', choices: ['🪷 Lotus', '🚲 Bicycle', '✈️ Plane'], correct: 0 },
        { shown: ['2', '7', '4'], prompt: 'Which number was shown?', choices: ['9', '7', '5'], correct: 1 },
        { shown: ['🧺 Basket', '🌾 Rice', '🎋 Bamboo'], prompt: 'Which item did you see?', choices: ['📱 Phone', '🎋 Bamboo', '🚗 Car'], correct: 1 }
      ]
    }),
  game('route-puzzle', 'Familiar Route Puzzle', 'long-term-memory', ['mild'], 'choice',
    'Choose safe, familiar paths through a village day.', 'Read each destination and choose the matching route.', {
      rounds: [
        choice('From home, which path reaches the tea garden?', [option('river', 'River bank', '🌊'), option('tea', 'Green hill path', '🌿'), option('market', 'Market lane', '🛍️')], 'tea', 'Tea gardens cover the green hill path.'),
        choice('Which path reaches the community market?', [option('market', 'Busy lane with stalls', '🛍️'), option('forest', 'Forest trail', '🌲'), option('field', 'Quiet paddy field', '🌾')], 'market', 'Market stalls line the busy lane.'),
        choice('Which landmark helps you find home?', [option('bridge', 'Bamboo bridge', '🌉'), option('cloud', 'A passing cloud', '☁️'), option('bird', 'A flying bird', '🐦')], 'bridge', 'A bridge stays in place and is a useful landmark.')
      ]
    }),
  game('childhood-trivia', 'Childhood Memory Trivia', 'long-term-memory', ['mild', 'moderate'], 'choice',
    'Recognize objects familiar from earlier years.', 'Choose the object described in each memory prompt.', {
      rounds: [
        choice('What played family news and songs before television was common?', [option('radio', 'Radio', '📻'), option('torch', 'Torch', '🔦'), option('clock', 'Clock', '🕰️')], 'radio', 'Families gathered around radios for news and music.'),
        choice('What is used to weave cloth by hand?', [option('loom', 'Handloom', '🧶'), option('kettle', 'Kettle', '🫖'), option('plough', 'Plough', '🧑‍🌾')], 'loom', 'A handloom weaves threads into cloth.'),
        choice('What carried letters across long distances?', [option('post', 'Postcard', '💌'), option('spoon', 'Spoon', '🥄'), option('bell', 'Bell', '🔔')], 'post', 'Postcards carried written family messages.')
      ]
    }),
  game('family-tree', 'Family Tree Builder', 'long-term-memory', ['mild'], 'sorting',
    'Place family members with their relationships.', 'Choose a person, then choose the correct relationship group.', {
      source: 'anchors',
      targets: [{ id: 'parent', label: 'Parents' }, { id: 'child', label: 'Children' }, { id: 'grandchild', label: 'Grandchildren' }],
      items: [
        { id: 'mina', label: 'Mina', symbol: '👩', target: 'child' }, { id: 'raju', label: 'Raju', symbol: '👦', target: 'grandchild' },
        { id: 'tara', label: 'Tara', symbol: '👧', target: 'grandchild' }, { id: 'anil', label: 'Anil', symbol: '👨', target: 'child' },
        { id: 'maa', label: 'Maa', symbol: '👵', target: 'parent' }, { id: 'deuta', label: 'Deuta', symbol: '👴', target: 'parent' }
      ]
    }),
  game('today-recall', 'What Happened Today?', 'episodic-memory', ['mild', 'moderate'], 'recall',
    'Gently revisit today’s activities.', 'Read today’s note, then answer one simple question.', {
      source: 'check-ins',
      rounds: [
        { shown: ['Breakfast: warm porridge', 'Morning medicine', 'Garden walk'], prompt: 'What happened after breakfast?', choices: ['Morning medicine', 'Train journey', 'Movie'], correct: 0 },
        { shown: ['Lunch: rice and dal', 'Afternoon rest', 'Tea with family'], prompt: 'What drink was shared?', choices: ['Tea', 'Juice', 'Soda'], correct: 0 },
        { shown: ['Watered flowers', 'Called Mina', 'Listened to music'], prompt: 'Who was called?', choices: ['Mina', 'Doctor', 'Shopkeeper'], correct: 0 }
      ]
    }),
  game('photo-diary', 'Photo Diary Recall', 'episodic-memory', ['mild'], 'recall',
    'Connect a recent photo with its moment.', 'Study the photo card and choose when or where it happened.', {
      source: 'anchors',
      rounds: [
        { shown: ['🌅 Morning tea photo'], prompt: 'When was this photo taken?', choices: ['Morning', 'Midnight', 'Next week'], correct: 0 },
        { shown: ['🌳 Family garden photo'], prompt: 'Where was this photo taken?', choices: ['Garden', 'Airport', 'Office'], correct: 0 },
        { shown: ['🎂 Birthday photo'], prompt: 'What was happening?', choices: ['Birthday', 'Shopping', 'Sleeping'], correct: 0 }
      ]
    }),
  game('odd-one-out', 'Odd One Out', 'semantic-memory', ['mild', 'moderate'], 'choice',
    'Find which familiar item belongs to a different group.', 'Choose the one item that is different.', {
      rounds: [
        choice('Which one is not a flower?', [option('hibiscus', 'Hibiscus', '🌺'), option('tea', 'Tea cup', '🍵'), option('lotus', 'Lotus', '🪷')], 'tea', 'Hibiscus and lotus are flowers.'),
        choice('Which one does not fly?', [option('hornbill', 'Hornbill', '🐦'), option('rhino', 'Rhino', '🦏'), option('dove', 'Dove', '🕊️')], 'rhino', 'A rhino walks on land.'),
        choice('Which one makes music?', [option('dhol', 'Dhol', '🪘'), option('basket', 'Basket', '🧺'), option('pot', 'Pot', '🏺')], 'dhol', 'A dhol is a drum.')
      ]
    }),
  game('naming-game', 'Naming Game', 'semantic-memory', ['moderate'], 'choice',
    'Name common objects, colours, and days.', 'Look at the picture and choose its name.', {
      rounds: [
        choice('What is this? 🍵', [option('tea', 'Tea', '🍵'), option('rice', 'Rice', '🍚')], 'tea', 'This is a cup of tea.'),
        choice('What colour is this leaf? 🌿', [option('green', 'Green', '🟢'), option('red', 'Red', '🔴')], 'green', 'Healthy leaves are green.'),
        choice('Which day follows Monday?', [option('tuesday', 'Tuesday'), option('friday', 'Friday')], 'tuesday', 'Tuesday follows Monday.')
      ]
    }),
  game('category-sorting', 'Category Sorting', 'semantic-memory', ['mild', 'moderate'], 'sorting',
    'Sort familiar things into simple groups.', 'Choose an item, then choose its group.', {
      targets: [{ id: 'fruit', label: 'Fruits' }, { id: 'vegetable', label: 'Vegetables' }],
      items: [
        { id: 'banana', label: 'Banana', symbol: '🍌', target: 'fruit' }, { id: 'orange', label: 'Orange', symbol: '🍊', target: 'fruit' },
        { id: 'mango', label: 'Mango', symbol: '🥭', target: 'fruit' }, { id: 'carrot', label: 'Carrot', symbol: '🥕', target: 'vegetable' },
        { id: 'eggplant', label: 'Eggplant', symbol: '🍆', target: 'vegetable' }, { id: 'greens', label: 'Leafy greens', symbol: '🥬', target: 'vegetable' }
      ]
    }),
  game('routine-sequence', 'Daily Routine Sequencing', 'procedural-memory', ['moderate'], 'sequence',
    'Arrange familiar daily activities.', 'Tap the steps in the order they usually happen.', {
      mode: 'order',
      rounds: [
        { prompt: 'Morning routine', steps: [step('wake', 'Wake up', '🌅'), step('brush', 'Brush teeth', '🪥'), step('bathe', 'Bathe', '🛁'), step('breakfast', 'Breakfast', '🍚')] },
        { prompt: 'Bedtime routine', steps: [step('dinner', 'Dinner', '🍲'), step('medicine', 'Medicine', '💊'), step('brush', 'Brush teeth', '🪥'), step('sleep', 'Sleep', '🛏️')] },
        { prompt: 'Garden routine', steps: [step('can', 'Fill watering can', '🚿'), step('water', 'Water plants', '💧'), step('tools', 'Put tools away', '🧰')] }
      ]
    }),
  game('task-simulation', 'Task Simulation', 'procedural-memory', ['moderate'], 'sequence',
    'Put steps of safe, familiar tasks in order.', 'Tap each step from first to last.', {
      mode: 'order',
      rounds: [
        { prompt: 'Make tea', steps: [step('water', 'Boil water', '💧'), step('tea', 'Add tea leaves', '🌿'), step('pour', 'Pour into cup', '🍵')] },
        { prompt: 'Get dressed', steps: [step('choose', 'Choose clothes', '👕'), step('dress', 'Put them on', '🧥'), step('shoes', 'Wear shoes', '👟')] },
        { prompt: 'Wash hands', steps: [step('wet', 'Wet hands', '💧'), step('soap', 'Use soap', '🧼'), step('rinse', 'Rinse and dry', '👐')] }
      ]
    }),
  game('family-face-match', 'Family Face Match', 'recognition-memory', ['mild', 'moderate', 'severe'], 'match',
    'Match familiar family faces and names.', 'Turn over two cards and match each family member.', {
      source: 'anchors',
      pairs: [pair('mina', 'Mina — Daughter', '👩'), pair('raju', 'Raju — Grandson', '👦'), pair('tara', 'Tara — Granddaughter', '👧'), pair('anil', 'Anil — Son', '👨'), pair('lila', 'Lila — Sister', '👩‍🦳'), pair('biren', 'Biren — Friend', '👨‍🦳')]
    }),
  game('voice-recognition', 'Voice Recognition', 'recognition-memory', ['mild', 'moderate'], 'audio',
    'Listen and identify a familiar speaker.', 'Play the voice, then choose who is speaking.', {
      source: 'anchors',
      rounds: [
        { prompt: 'Who says “Hello Apoi, it is Mina” ?', sound: 'voice-mina', choices: ['Mina — Daughter', 'Raju — Grandson', 'Biren — Friend'], correct: 0 },
        { prompt: 'Who says “Deuta, shall we have tea?”', sound: 'voice-anil', choices: ['Tara — Granddaughter', 'Anil — Son', 'Lila — Sister'], correct: 1 },
        { prompt: 'Who says “Aita, I drew a flower for you” ?', sound: 'voice-tara', choices: ['Tara — Granddaughter', 'Mina — Daughter', 'Biren — Friend'], correct: 0 }
      ]
    }),
  game('emotion-recognition', 'Emotion Recognition', 'recognition-memory', ['mild', 'moderate'], 'choice',
    'Recognize feelings from clear expressions.', 'Choose the feeling shown by each face.', {
      rounds: [
        choice('How does this face feel? 😊', [option('happy', 'Happy'), option('sad', 'Sad'), option('angry', 'Angry')], 'happy', 'The smile shows happiness.'),
        choice('How does this face feel? 😢', [option('surprised', 'Surprised'), option('sad', 'Sad'), option('calm', 'Calm')], 'sad', 'Tears and a downturned mouth show sadness.'),
        choice('How does this face feel? 😮', [option('surprised', 'Surprised'), option('sleepy', 'Sleepy'), option('happy', 'Happy')], 'surprised', 'Wide eyes and an open mouth show surprise.')
      ]
    }),
  game('festival-match', 'Festival Memory Match', 'cultural-memory', ['mild', 'moderate'], 'match',
    'Match festivals with familiar regional symbols.', 'Find every matching festival pair.', {
      pairs: [pair('bihu', 'Bihu', '🪘'), pair('hornbill', 'Hornbill Festival', '🐦'), pair('losar', 'Losar', '🏔️'), pair('chapchar', 'Chapchar Kut', '🎋'), pair('wangala', 'Wangala', '🥁'), pair('kharchi', 'Kharchi Puja', '🛕')]
    }),
  game('folk-story-sequence', 'Folk Story Sequencing', 'cultural-memory', ['moderate'], 'sequence',
    'Arrange gentle regional story moments.', 'Tap the story panels from beginning to end.', {
      mode: 'order',
      rounds: [
        { prompt: 'River journey', steps: [step('launch', 'Boat leaves the bank', '🛶'), step('island', 'Family reaches the island', '🏝️'), step('home', 'Everyone returns at sunset', '🌇')] },
        { prompt: 'Festival morning', steps: [step('prepare', 'Prepare pitha', '🥮'), step('dress', 'Wear festive clothes', '🥻'), step('dance', 'Join the dance', '💃')] },
        { prompt: 'Bamboo tale', steps: [step('plant', 'Young bamboo is planted', '🌱'), step('grow', 'Bamboo grows tall', '🎋'), step('basket', 'Artisan weaves a basket', '🧺')] }
      ]
    }),
  game('local-music-recall', 'Local Music Recall', 'cultural-memory', ['moderate', 'severe'], 'choice',
    'Connect traditional sounds with familiar instruments and actions.', 'Play the sound and choose what matches it.', {
      rounds: [
        choice('Which instrument made this deep festival beat?', [option('dhol', 'Dhol', '🪘'), option('flute', 'Flute', '🪈')], 'dhol', 'The dhol makes a strong drum beat.', 'dhol-low'),
        choice('Which action fits this quick rhythm?', [option('dance', 'Festival dance', '💃'), option('sleep', 'Sleep', '🛏️')], 'dance', 'A quick rhythm invites dancing.', 'dhol-high'),
        choice('Which instrument sounds like these clear notes?', [option('xylophone', 'Bamboo xylophone', '🎋'), option('bell', 'Temple bell', '🔔')], 'xylophone', 'The rising notes come from the bamboo xylophone.', 'xylophone')
      ]
    }),
  game('spot-difference', 'Spot the Difference', 'attention', ['mild', 'moderate'], 'action',
    'Notice one small change between familiar scenes.', 'Compare the rows and tap the changed symbol.', {
      mode: 'difference',
      rounds: [
        { prompt: 'Find the different item in the second row.', sceneA: ['🌿', '🍵', '🪷'], sceneB: ['🌿', '🫖', '🪷'], target: 1 },
        { prompt: 'Find the different animal.', sceneA: ['🐦', '🦏', '🐘'], sceneB: ['🐦', '🐃', '🐘'], target: 1 },
        { prompt: 'Find the changed flower.', sceneA: ['🌺', '🌸', '🌻'], sceneB: ['🌺', '🌹', '🌻'], target: 1 }
      ]
    }),
  game('tap-target', 'Tap the Target', 'attention', ['mild', 'moderate'], 'action',
    'Practice attention with calm, large targets.', 'Tap the requested symbol as it moves across the grid.', {
      mode: 'target',
      rounds: [
        { prompt: 'Tap the lotus', target: '🪷', distractors: ['🌿', '🍵', '🪘'] },
        { prompt: 'Tap the hornbill', target: '🐦', distractors: ['🦏', '🐘', '🐃'] },
        { prompt: 'Tap the cup of tea', target: '🍵', distractors: ['🫖', '🍚', '🥭'] }
      ]
    }),
  game('word-association', 'Word Association', 'language', ['mild'], 'choice',
    'Connect familiar words with related meanings.', 'Choose the word most closely connected to the prompt.', {
      rounds: [
        choice('Tea', [option('cup', 'Cup'), option('shoe', 'Shoe'), option('road', 'Road')], 'cup', 'Tea is served in a cup.'),
        choice('Rain', [option('umbrella', 'Umbrella'), option('pillow', 'Pillow'), option('plate', 'Plate')], 'umbrella', 'An umbrella helps in rain.'),
        choice('Garden', [option('flower', 'Flower'), option('train', 'Train'), option('radio', 'Radio')], 'flower', 'Flowers grow in a garden.')
      ]
    }),
  game('proverb-completion', 'Fill in the Blank Proverbs', 'language', ['mild', 'moderate'], 'choice',
    'Complete familiar sayings with a missing word.', 'Choose the word that completes each saying.', {
      rounds: [
        choice('Where there is a will, there is a ___.', [option('way', 'way'), option('cup', 'cup'), option('bell', 'bell')], 'way', 'Where there is a will, there is a way.'),
        choice('Many hands make light ___.', [option('work', 'work'), option('rain', 'rain'), option('rice', 'rice')], 'work', 'Many hands make light work.'),
        choice('A friend in need is a friend ___.', [option('indeed', 'indeed'), option('outside', 'outside'), option('asleep', 'asleep')], 'indeed', 'A friend in need is a friend indeed.')
      ]
    }),
  game('color-tap', 'Color Tap', 'sensory', ['severe'], 'action',
    'Enjoy simple colour recognition with large buttons.', 'Tap the colour named on the screen.', {
      mode: 'color',
      rounds: [
        { prompt: 'Tap red', target: 'red', colors: [{ id: 'red', label: 'Red', value: '#d32f2f' }, { id: 'blue', label: 'Blue', value: '#1565c0' }] },
        { prompt: 'Tap yellow', target: 'yellow', colors: [{ id: 'yellow', label: 'Yellow', value: '#f9a825' }, { id: 'green', label: 'Green', value: '#2e7d32' }] },
        { prompt: 'Tap blue', target: 'blue', colors: [{ id: 'blue', label: 'Blue', value: '#1565c0' }, { id: 'orange', label: 'Orange', value: '#ef6c00' }] }
      ]
    }),
  game('sound-match', 'Music / Sound Matching', 'sensory', ['severe'], 'audio',
    'Match identical, clear sounds.', 'Play the first sound, then choose the matching sound.', {
      rounds: [
        { prompt: 'Which choice matches the deep drum?', sound: 'dhol-low', choices: ['Deep drum', 'High drum'], correct: 0 },
        { prompt: 'Which choice matches the high drum?', sound: 'dhol-high', choices: ['Low note', 'High drum'], correct: 1 },
        { prompt: 'Which choice matches the clear bamboo notes?', sound: 'xylophone', choices: ['Bamboo notes', 'Deep drum'], correct: 0 }
      ]
    }),
  game('yes-no-recognition', 'Yes / No Recognition', 'sensory', ['severe'], 'choice',
    'Answer gentle recognition questions with two large choices.', 'Look at the picture and choose Yes or No.', {
      rounds: [
        choice('Is this a house? 🏠', [option('yes', 'Yes'), option('no', 'No')], 'yes', 'Yes, this is a house.'),
        choice('Is this a cup of tea? 🍵', [option('yes', 'Yes'), option('no', 'No')], 'yes', 'Yes, this is tea.'),
        choice('Is this a bird? 🦏', [option('yes', 'Yes'), option('no', 'No')], 'no', 'No, this is a rhinoceros.')
      ]
    })
];

export function getGame(gameId) {
  return GAMES.find(({ id }) => id === gameId) ?? null;
}

export function validateGameCatalog(games) {
  const errors = [];
  if (games.length !== 26) errors.push('catalog must contain 26 games');
  for (const entry of games) {
    for (const key of ['id', 'name', 'category', 'engine', 'description', 'instructions', 'content', 'difficulty']) {
      if (!entry[key]) errors.push(`${entry.id || 'unknown'} missing ${key}`);
    }
    if (!GAME_CATEGORIES.includes(entry.category)) errors.push(`${entry.id} has invalid category`);
    if (!ENGINES.includes(entry.engine)) errors.push(`${entry.id} has invalid engine`);
    if (!Array.isArray(entry.stages) || !entry.stages.length || !entry.stages.every(stageName => STAGES.includes(stageName))) {
      errors.push(`${entry.id} has invalid stages`);
    }
  }
  return errors;
}
