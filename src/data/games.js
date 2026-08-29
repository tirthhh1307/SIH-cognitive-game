export const STAGES = ['mild', 'moderate', 'severe'];

export const GAME_CATEGORIES = [
  'working-memory',
  'long-term-memory',
  'semantic-memory',
  'recognition-memory',
  'cultural-long-term',
  'cultural-episodic',
  'sensory',
  'language-memory',
  'attention-focus'
];

export const CATEGORY_LABELS = {
  'working-memory': 'Short-Term / Working Memory',
  'long-term-memory': 'Long-Term Memory',
  'semantic-memory': 'Semantic Memory',
  'recognition-memory': 'Facial / Recognition Memory',
  'cultural-long-term': 'Cultural / Long-Term Memory',
  'cultural-episodic': 'Cultural / Episodic-Semantic',
  'sensory': 'Sensory Stimulation',
  'language-memory': 'Language / Long-Term Memory',
  'attention-focus': 'Attention / Focus'
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
    'Match familiar North East objects, crafts, and festive symbols.', 'Turn over two cards and find every matching pair.', {
      pairs: [
        pair('japi', 'Japi Hat', '👒'),
        pair('tea', 'Assam Tea', '🍵'),
        pair('dhol', 'Dhol Drum', '🪘'),
        pair('lotus', 'Lotus Flower', '🪷'),
        pair('rhino', 'Kaziranga Rhino', '🦏'),
        pair('bamboo', 'Bamboo Grove', '🎋'),
        pair('gamusa', 'Gamusa Weave', '🧣'),
        pair('bihu', 'Bihu Dance', '💃'),
        pair('pitha', 'Pitha Sweet', '🥮'),
        pair('muga', 'Muga Silk', '🧵'),
        pair('hornbill', 'Hornbill Bird', '🐦'),
        pair('bell', 'Temple Bell', '🔔')
      ]
    }),
  game('sequence-repeat', 'Sequence Repeat', 'working-memory', ['mild'], 'sequence',
    'Remember a sequence of colorful tones and regional sights.', 'Watch the pattern, then tap the same symbols in order.', {
      mode: 'repeat',
      items: [
        { id: 'red', label: 'Ruby Lotus', symbol: '🔴', color: '#E53935', freq: 261.63 },
        { id: 'green', label: 'Tea Leaf', symbol: '🟢', color: '#43A047', freq: 329.63 },
        { id: 'blue', label: 'River Wave', symbol: '🔵', color: '#1E88E5', freq: 392.00 },
        { id: 'yellow', label: 'Golden Sun', symbol: '🟡', color: '#FDD835', freq: 523.25 },
        { id: 'purple', label: 'Bihu Dhol', symbol: '🟣', color: '#8E24AA', freq: 587.33 },
        { id: 'orange', label: 'Amber Flame', symbol: '🟠', color: '#FB8C00', freq: 659.25 }
      ]
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
    'Solve jigsaw puzzles of famous North East landmarks or family photos.', 'Reassemble the pieces to reveal the beautiful destination.', {
      landmarks: [
        {
          id: 'kaziranga',
          title: 'Kaziranga National Park',
          location: 'Assam',
          description: 'Home of the mighty one-horned rhinoceros and lush grasslands.',
          imageUrl: 'https://images.unsplash.com/photo-1575550959106-5a7defe28b56?w=700&auto=format&fit=crop&q=80'
        },
        {
          id: 'root-bridge',
          title: 'Living Root Bridge',
          location: 'Meghalaya',
          description: 'Woven naturally across rainforest streams by Khasi elders.',
          imageUrl: 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=700&auto=format&fit=crop&q=80'
        },
        {
          id: 'majuli',
          title: 'Majuli Island Sunset',
          location: 'Brahmaputra, Assam',
          description: 'Serene river island of satras, arts, and peaceful waters.',
          imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=700&auto=format&fit=crop&q=80'
        },
        {
          id: 'tea-gardens',
          title: 'Upper Assam Tea Estate',
          location: 'Assam',
          description: 'Gentle green rolling hills with fresh fragrant morning tea leaves.',
          imageUrl: 'https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=700&auto=format&fit=crop&q=80'
        },
        {
          id: 'kamakhya',
          title: 'Kamakhya Temple Hill',
          location: 'Guwahati, Assam',
          description: 'Ancient sacred hill overlooking the mighty river Brahmaputra.',
          imageUrl: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=700&auto=format&fit=crop&q=80'
        },
        {
          id: 'loktak',
          title: 'Loktak Floating Lake',
          location: 'Manipur',
          description: 'Spectacular lake filled with floating circular phumdis.',
          imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=700&auto=format&fit=crop&q=80'
        }
      ],
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
    'Arrange family members into their loving branches.', 'Look at the family tree, then reconstruct it with love and memory.', {
      source: 'anchors',
      targets: [
        { id: 'grandparent', label: 'Grandparents (ককা / আইতা)', level: 0 },
        { id: 'parent', label: 'Parents (দেউতা / মা)', level: 1 },
        { id: 'child', label: 'Children (ল’ৰা / ছোৱালী)', level: 2 },
        { id: 'grandchild', label: 'Grandchildren (নাতি / নাতিনী)', level: 3 }
      ],
      items: [
        { id: 'koka', label: 'Biren Koka', role: 'Grandfather', relation: 'grandparent', target: 'grandparent', symbol: '👴' },
        { id: 'aita', label: 'Lila Aita', role: 'Grandmother', relation: 'grandparent', target: 'grandparent', symbol: '👵' },
        { id: 'deuta', label: 'Anil Deuta', role: 'Father', relation: 'parent', target: 'parent', symbol: '👨' },
        { id: 'maa', label: 'Mina Maa', role: 'Mother', relation: 'parent', target: 'parent', symbol: '👩' },
        { id: 'anita', label: 'Anita', role: 'Daughter', relation: 'child', target: 'child', symbol: '👧' },
        { id: 'raju', label: 'Raju', role: 'Son', relation: 'child', target: 'child', symbol: '👦' },
        { id: 'tara', label: 'Tara', role: 'Granddaughter', relation: 'grandchild', target: 'grandchild', symbol: '👶' }
      ]
    }),
  game('today-recall', 'What Happened Today?', 'cultural-episodic', ['mild', 'moderate'], 'recall',
    'Gently revisit today’s activities.', 'Read today’s note, then answer one simple question.', {
      source: 'check-ins',
      rounds: [
        { shown: ['Breakfast: warm porridge', 'Morning medicine', 'Garden walk'], prompt: 'What happened after breakfast?', choices: ['Morning medicine', 'Train journey', 'Movie'], correct: 0 },
        { shown: ['Lunch: rice and dal', 'Afternoon rest', 'Tea with family'], prompt: 'What drink was shared?', choices: ['Tea', 'Juice', 'Soda'], correct: 0 },
        { shown: ['Watered flowers', 'Called Mina', 'Listened to music'], prompt: 'Who was called?', choices: ['Mina', 'Doctor', 'Shopkeeper'], correct: 0 }
      ]
    }),
  game('photo-diary', 'Photo Diary Recall', 'cultural-episodic', ['mild'], 'recall',
    'Connect photos and journal entries with their beautiful moments.', 'Look at the photo, write what you love, and enjoy cherished memories.', {
      source: 'anchors',
      diaryMoments: [
        {
          id: 'tea-morning',
          title: 'Morning Assam Tea on the Verandah',
          timeOfDay: 'Morning (8:00 AM)',
          location: 'Home Verandah',
          imageUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=80',
          whatILove: 'The fresh morning mountain breeze and the warm aroma of cardamom tea with family.',
          whatItMakesMeThink: 'Reminds me of quiet peaceful mornings watching birds on the guava tree.',
          date: 'Today'
        },
        {
          id: 'garden-flowers',
          title: 'Watering the Garden Orchids & Marigolds',
          timeOfDay: 'Afternoon (3:30 PM)',
          location: 'Front Garden',
          imageUrl: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=600&auto=format&fit=crop&q=80',
          whatILove: 'Seeing the bright yellow marigold buds opening up after a gentle rainfall.',
          whatItMakesMeThink: 'Reminds me of planting seeds together during spring festivals.',
          date: 'Yesterday'
        },
        {
          id: 'family-evening',
          title: 'Evening Storytelling with Grandchildren',
          timeOfDay: 'Evening (6:45 PM)',
          location: 'Living Room',
          imageUrl: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=600&auto=format&fit=crop&q=80',
          whatILove: 'The laughter and twinkling eyes of little ones listening to folk tales.',
          whatItMakesMeThink: 'Love and warmth grow deeper with every story we pass on.',
          date: '2 days ago'
        }
      ],
      rounds: [
        { shown: ['🌅 Morning tea on the verandah'], prompt: 'When was this photo taken?', choices: ['Morning (8:00 AM)', 'Midnight', 'Next week'], correct: 0 },
        { shown: ['🌸 Garden orchids & marigolds'], prompt: 'Where was this photo taken?', choices: ['Front Garden', 'Airport Terminal', 'Busy Highway'], correct: 0 },
        { shown: ['📖 Evening storytelling session'], prompt: 'What happy moment was taking place?', choices: ['Storytelling with children', 'Working in the factory', 'Waiting for a bus'], correct: 0 }
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
  game('routine-sequence', 'Daily Routine Sequencing', 'semantic-memory', ['moderate'], 'sequence',
    'Arrange familiar daily activities.', 'Tap the steps in the order they usually happen.', {
      mode: 'order',
      rounds: [
        { prompt: 'Morning routine', steps: [step('wake', 'Wake up', '🌅'), step('brush', 'Brush teeth', '🪥'), step('bathe', 'Bathe', '🛁'), step('breakfast', 'Breakfast', '🍚')] },
        { prompt: 'Bedtime routine', steps: [step('dinner', 'Dinner', '🍲'), step('medicine', 'Medicine', '💊'), step('brush', 'Brush teeth', '🪥'), step('sleep', 'Sleep', '🛏️')] },
        { prompt: 'Garden routine', steps: [step('can', 'Fill watering can', '🚿'), step('water', 'Water plants', '💧'), step('tools', 'Put tools away', '🧰')] }
      ]
    }),
  game('task-simulation', 'Task Simulation', 'semantic-memory', ['moderate'], 'sequence',
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
  game('festival-match', 'Festival Memory Match', 'cultural-long-term', ['mild', 'moderate'], 'match',
    'Match festivals with familiar regional symbols across all 8 North Eastern sister states.', 'Find every matching festival pair.', {
      pairs: [
        pair('bihu', 'Bihu (Assam)', '🪘'),
        pair('hornbill', 'Hornbill (Nagaland)', '🐦'),
        pair('losar', 'Losar (Sikkim)', '🏔️'),
        pair('chapchar', 'Chapchar Kut (Mizoram)', '🎋'),
        pair('wangala', 'Wangala (Meghalaya)', '🥁'),
        pair('kharchi', 'Kharchi Puja (Tripura)', '🛕'),
        pair('rasleela', 'Ras Leela (Manipur)', '🌸'),
        pair('torgya', 'Torgya (Arunachal)', '🎭')
      ]
    }),
  game('folk-story-sequence', 'Folk Story Sequencing', 'cultural-long-term', ['moderate'], 'sequence',
    'Arrange gentle regional story moments.', 'Tap the story panels from beginning to end.', {
      mode: 'order',
      rounds: [
        { prompt: 'River journey', steps: [step('launch', 'Boat leaves the bank', '🛶'), step('island', 'Family reaches the island', '🏝️'), step('home', 'Everyone returns at sunset', '🌇')] },
        { prompt: 'Festival morning', steps: [step('prepare', 'Prepare pitha', '🥮'), step('dress', 'Wear festive clothes', '🥻'), step('dance', 'Join the dance', '💃')] },
        { prompt: 'Bamboo tale', steps: [step('plant', 'Young bamboo is planted', '🌱'), step('grow', 'Bamboo grows tall', '🎋'), step('basket', 'Artisan weaves a basket', '🧺')] }
      ]
    }),
  game('local-music-recall', 'Local Music Recall', 'cultural-long-term', ['moderate', 'severe'], 'choice',
    'Connect traditional sounds with familiar instruments and actions.', 'Play the sound and choose what matches it.', {
      rounds: [
        choice('Which instrument made this deep festival beat?', [option('dhol', 'Dhol', '🪘'), option('flute', 'Flute', '🪈')], 'dhol', 'The dhol makes a strong drum beat.', 'dhol-low'),
        choice('Which action fits this quick rhythm?', [option('dance', 'Festival dance', '💃'), option('sleep', 'Sleep', '🛏️')], 'dance', 'A quick rhythm invites dancing.', 'dhol-high'),
        choice('Which instrument sounds like these clear notes?', [option('xylophone', 'Bamboo xylophone', '🎋'), option('bell', 'Temple bell', '🔔')], 'xylophone', 'The rising notes come from the bamboo xylophone.', 'xylophone')
      ]
    }),
  game('spot-difference', 'Spot the Difference', 'attention-focus', ['mild', 'moderate'], 'action',
    'Notice one small change between familiar scenes.', 'Compare the rows and tap the changed symbol.', {
      mode: 'difference',
      rounds: [
        { prompt: 'Find the different item in the second row.', sceneA: ['🌿', '🍵', '🪷'], sceneB: ['🌿', '🫖', '🪷'], target: 1 },
        { prompt: 'Find the different animal.', sceneA: ['🐦', '🦏', '🐘'], sceneB: ['🐦', '🐃', '🐘'], target: 1 },
        { prompt: 'Find the changed flower.', sceneA: ['🌺', '🌸', '🌻'], sceneB: ['🌺', '🌹', '🌻'], target: 1 }
      ]
    }),
  game('tap-target', 'Tap the Target', 'attention-focus', ['mild', 'moderate'], 'action',
    'Practice attention with calm, large targets.', 'Tap the requested symbol as it moves across the grid.', {
      mode: 'target',
      rounds: [
        { prompt: 'Tap the lotus', target: '🪷', distractors: ['🌿', '🍵', '🪘'] },
        { prompt: 'Tap the hornbill', target: '🐦', distractors: ['🦏', '🐘', '🐃'] },
        { prompt: 'Tap the cup of tea', target: '🍵', distractors: ['🫖', '🍚', '🥭'] }
      ]
    }),
  game('table-object-pickup', 'Tabletop Object Pickup', 'attention-focus', ['mild', 'moderate'], 'action',
    'Find and collect everyday objects scattered across the table.', 'Look at the prompt on screen and tap the matching items on the table.', {
      rounds: [
        {
          prompt: 'Pick up 3 Yellow Bananas 🍌',
          targetId: 'banana',
          targetCount: 3,
          targetSymbol: '🍌',
          targetName: 'Yellow Banana',
          items: [
            { id: 'b1', type: 'banana', symbol: '🍌', label: 'Banana', size: 1.1, x: 22, y: 30, rot: -15 },
            { id: 'b2', type: 'banana', symbol: '🍌', label: 'Banana', size: 0.9, x: 74, y: 25, rot: 25 },
            { id: 'b3', type: 'banana', symbol: '🍌', label: 'Banana', size: 1.0, x: 45, y: 65, rot: 8 },
            { id: 'd1', type: 'cup', symbol: '🍵', label: 'Tea Cup', size: 1.0, x: 18, y: 70, rot: 0 },
            { id: 'd2', type: 'glasses', symbol: '👓', label: 'Glasses', size: 0.85, x: 80, y: 68, rot: -10 },
            { id: 'd3', type: 'key', symbol: '🔑', label: 'Brass Key', size: 0.9, x: 48, y: 22, rot: 45 }
          ]
        },
        {
          prompt: 'Pick up 2 Reading Glasses 👓',
          targetId: 'glasses',
          targetCount: 2,
          targetSymbol: '👓',
          targetName: 'Reading Glasses',
          items: [
            { id: 'g1', type: 'glasses', symbol: '👓', label: 'Glasses', size: 1.0, x: 30, y: 35, rot: 15 },
            { id: 'g2', type: 'glasses', symbol: '👓', label: 'Glasses', size: 1.1, x: 68, y: 60, rot: -20 },
            { id: 'd4', type: 'apple', symbol: '🍎', label: 'Red Apple', size: 0.9, x: 15, y: 25, rot: 0 },
            { id: 'd5', type: 'book', symbol: '📖', label: 'Story Book', size: 1.2, x: 78, y: 25, rot: 10 },
            { id: 'd6', type: 'clock', symbol: '⏰', label: 'Alarm Clock', size: 0.95, x: 45, y: 72, rot: -5 }
          ]
        },
        {
          prompt: 'Pick up 3 Tea Cups 🍵',
          targetId: 'cup',
          targetCount: 3,
          targetSymbol: '🍵',
          targetName: 'Assam Tea Cup',
          items: [
            { id: 'c1', type: 'cup', symbol: '🍵', label: 'Tea Cup', size: 1.0, x: 25, y: 28, rot: 0 },
            { id: 'c2', type: 'cup', symbol: '🍵', label: 'Tea Cup', size: 0.9, x: 52, y: 55, rot: 12 },
            { id: 'c3', type: 'cup', symbol: '🍵', label: 'Tea Cup', size: 1.1, x: 80, y: 40, rot: -8 },
            { id: 'd7', type: 'bell', symbol: '🔔', label: 'Brass Bell', size: 0.9, x: 20, y: 68, rot: 18 },
            { id: 'd8', type: 'spoon', symbol: '🥄', label: 'Wooden Spoon', size: 1.0, x: 70, y: 75, rot: -30 }
          ]
        }
      ]
    }),
  game('sticky-number-order', 'Sticky Note Number Order', 'working-memory', ['mild', 'moderate'], 'sequence',
    'Remove sticky notes from the wall in ascending order from lowest to highest number.', 'Tap the sticky notes starting from the lowest number up to the largest.', {
      rounds: [
        {
          numbers: [4, 12, 29, 63],
          notes: [
            { id: 's1', number: 29, color: '#FFF59D', tilt: -4 },
            { id: 's2', number: 4, color: '#FFCC80', tilt: 6 },
            { id: 's3', number: 63, color: '#C8E6C9', tilt: -3 },
            { id: 's4', number: 12, color: '#B3E5FC', tilt: 5 }
          ]
        },
        {
          numbers: [7, 19, 35, 58, 82],
          notes: [
            { id: 's5', number: 35, color: '#F8BBD0', tilt: 3 },
            { id: 's6', number: 7, color: '#FFF59D', tilt: -5 },
            { id: 's7', number: 82, color: '#E1BEE7', tilt: 4 },
            { id: 's8', number: 19, color: '#C8E6C9', tilt: -2 },
            { id: 's9', number: 58, color: '#FFCC80', tilt: 6 }
          ]
        },
        {
          numbers: [3, 15, 28, 44, 71, 95],
          notes: [
            { id: 's10', number: 71, color: '#B3E5FC', tilt: -4 },
            { id: 's11', number: 3, color: '#C8E6C9', tilt: 5 },
            { id: 's12', number: 44, color: '#FFF59D', tilt: -2 },
            { id: 's13', number: 15, color: '#FFCC80', tilt: 6 },
            { id: 's14', number: 95, color: '#F8BBD0', tilt: -3 },
            { id: 's15', number: 28, color: '#E1BEE7', tilt: 4 }
          ]
        }
      ]
    }),
  game('word-association', 'Word Association', 'language-memory', ['mild'], 'choice',
    'Connect familiar words with related meanings in your preferred language.', 'Choose the word most closely connected to the prompt.', {
      languages: {
        en: [
          choice('Tea 🍵', [option('cup', 'Cup ☕'), option('shoe', 'Shoe 👟'), option('road', 'Road 🛣️'), option('lamp', 'Lamp 💡')], 'cup', 'Tea is lovingly served hot in a cup.'),
          choice('Rain 🌧️', [option('umbrella', 'Umbrella ☂️'), option('pillow', 'Pillow 🛏️'), option('plate', 'Plate 🍽️'), option('clock', 'Clock ⏰')], 'umbrella', 'An umbrella keeps us dry in the rain.'),
          choice('Garden 🌸', [option('flower', 'Flower 🌺'), option('train', 'Train 🚂'), option('radio', 'Radio 📻'), option('hammer', 'Hammer 🔨')], 'flower', 'Fragrant flowers blossom in the garden.'),
          choice('Bihu 🪘', [option('dhol', 'Dhol Drum 🥁'), option('bicycle', 'Bicycle 🚲'), option('calculator', 'Calculator 🔢'), option('ladder', 'Ladder 🪜')], 'dhol', 'The rhythmic dhol drum brings Bihu dancing alive.'),
          choice('River 🌊', [option('boat', 'Boat 🛶'), option('stove', 'Stove 🔥'), option('carpet', 'Carpet 🧶'), option('key', 'Key 🔑')], 'boat', 'A boat gently glides across the river waters.')
        ],
        as: [
          choice('চা 🍵', [option('cup', 'কাপ ☕'), option('shoe', 'জোতা 👟'), option('road', 'বাট 🛣️'), option('lamp', 'চাকি 💡')], 'cup', 'চা গৰমে গৰমে কাপত পৰিবেশন কৰা হয়।'),
          choice('বৰষুণ 🌧️', [option('umbrella', 'ছাটি ☂️'), option('pillow', 'গাৰু 🛏️'), option('plate', 'কাঁহী 🍽️'), option('clock', 'ঘড়ী ⏰')], 'umbrella', 'বৰষুণত ছাতিয়ে আমাক তিতাৰ পৰা ৰক্ষা কৰে।'),
          choice('ফুলনি 🌸', [option('flower', 'ফুল 🌺'), option('train', 'ৰে’ল 🚂'), option('radio', 'ৰেডিঅ’ 📻'), option('hammer', 'হাতুৰী 🔨')], 'flower', 'ফুলনিত ৰং-বিৰঙৰ ফুল ফুলে।'),
          choice('বিহু 🪘', [option('dhol', 'ঢোল 🥁'), option('bicycle', 'চাইকেল 🚲'), option('calculator', 'হিচাপ যন্ত্ৰ 🔢'), option('ladder', 'জখলা 🪜')], 'dhol', 'বিহুৰ আনন্দত ঢোলৰ চাপ অতি প্ৰিয়।'),
          choice('নৈ 🌊', [option('boat', 'নাও 🛶'), option('stove', 'চুলা 🔥'), option('carpet', 'দলিচা 🧶'), option('key', 'চাবি 🔑')], 'boat', 'নৈত নাও মেলি মানুহে পাৰাপাৰ হয়।')
        ],
        bn: [
          choice('চা 🍵', [option('cup', 'কাপ ☕'), option('shoe', 'জুতো 👟'), option('road', 'রাস্তা 🛣️'), option('lamp', 'বাতি 💡')], 'cup', 'গরম চা পেয়ালা বা কাপে পরিবেশন করা হয়।'),
          choice('বৃষ্টি 🌧️', [option('umbrella', 'ছাতা ☂️'), option('pillow', 'বালিশ 🛏️'), option('plate', 'থালা 🍽️'), option('clock', 'ঘড়ি ⏰')], 'umbrella', 'বৃষ্টির দিনে ছাতা আমাদের ভেজা থেকে বাঁচায়।'),
          choice('বাগান 🌸', [option('flower', 'ফুল 🌺'), option('train', 'ট্রেন 🚂'), option('radio', 'রেডিও 📻'), option('hammer', 'হাতুড়ি 🔨')], 'flower', 'বাগানে সুন্দর ফুল ফুটে থাকে।'),
          choice('নদী 🌊', [option('boat', 'নৌকা 🛶'), option('stove', 'উনুন 🔥'), option('carpet', 'কার্পেট 🧶'), option('key', 'চাবি 🔑')], 'boat', 'নদীর বুকে শান্তভাবে নৌকা ভেসে চলে।')
        ],
        hi: [
          choice('चाय 🍵', [option('cup', 'प्याला / कप ☕'), option('shoe', 'जूता 👟'), option('road', 'सड़क 🛣️'), option('lamp', 'दीपक 💡')], 'cup', 'चाय गरमा-गरम कप में पी जाती है।'),
          choice('बारिश 🌧️', [option('umbrella', 'छाता ☂️'), option('pillow', 'तकिया 🛏️'), option('plate', 'थाली 🍽️'), option('clock', 'घड़ी ⏰')], 'umbrella', 'बारिश में छाता हमें भीगने से बचाता है।'),
          choice('बगीचा 🌸', [option('flower', 'फूल 🌺'), option('train', 'रेलगाड़ी 🚂'), option('radio', 'रेडियो 📻'), option('hammer', 'हथौड़ा 🔨')], 'flower', 'बगीचे में खुशबूदार फूल खिलते हैं।'),
          choice('नदी 🌊', [option('boat', 'नाव 🛶'), option('stove', 'चूल्हा 🔥'), option('carpet', 'कालीन 🧶'), option('key', 'चाबी 🔑')], 'boat', 'नदी में नाव धीरे-धीरे तैरती है।')
        ],
        brx: [
          choice('साहा (Tea) 🍵', [option('cup', 'खाब (Cup) ☕'), option('shoe', 'जुथा (Shoe) 👟'), option('road', 'लामा (Road) 🛣️')], 'cup', 'साहाखौ खाबाव लोंनाय जायो।'),
          choice('अखा (Rain) 🌧️', [option('umbrella', 'साथि (Umbrella) ☂️'), option('pillow', 'उन्दुनै (Pillow) 🛏️'), option('plate', 'थाला (Plate) 🍽️')], 'umbrella', 'अखा हानायाव साथिया गोनांथार।'),
          choice('बारगं (Garden) 🌸', [option('flower', 'बारबार (Flower) 🌺'), option('train', 'रेल (Train) 🚂'), option('radio', 'रेडियो (Radio) 📻')], 'flower', 'बारगंआव समायना बिबार बारो।')
        ]
      },
      rounds: [
        choice('Tea', [option('cup', 'Cup'), option('shoe', 'Shoe'), option('road', 'Road')], 'cup', 'Tea is served in a cup.'),
        choice('Rain', [option('umbrella', 'Umbrella'), option('pillow', 'Pillow'), option('plate', 'Plate')], 'umbrella', 'An umbrella helps in rain.'),
        choice('Garden', [option('flower', 'Flower'), option('train', 'Train'), option('radio', 'Radio')], 'flower', 'Flowers grow in a garden.')
      ]
    }),
  game('proverb-completion', 'Fill in the Blank Proverbs', 'language-memory', ['mild', 'moderate'], 'choice',
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
  if (games.length !== 28) errors.push('catalog must contain 28 games');
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
