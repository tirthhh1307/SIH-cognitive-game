export const GARDEN_PLANTS = [
  {
    id: 'orchid',
    name: 'Kopou Orchid',
    regionalName: 'কপৌ ফুল (Assam Bihu Orchid)',
    category: 'Festive Flower',
    seedPrice: 20,
    stages: ['🌱 Seed', '🌿 Sprout', '🌸 Budding', '🌺 Full Bloom', '✨ Radiant Blossom'],
    stageIcons: ['🌱', '🌿', '🌷', '🌸', '🌺'],
    description: 'The beloved purple foxtail orchid worn during joyful Rongali Bihu celebrations in Assam.',
    starYield: 8,
    funFact: 'In North East India, Kopou orchid symbolizes affection, spring renewal, and celebration!'
  },
  {
    id: 'tea',
    name: 'Assam Tea Bush',
    regionalName: 'অসমীয়া চাহ (Golden Tips Tea)',
    category: 'Heritage Shrub',
    seedPrice: 25,
    stages: ['🌱 Seedling', '🌿 Green Shoots', '🍃 Lush Bush', '🍵 Golden Tips', '✨ Master Reserve'],
    stageIcons: ['🌱', '🌿', '🪴', '🍃', '🍵'],
    description: 'Verdant green tea bushes that carpet the misty hills of the Brahmaputra Valley.',
    starYield: 10,
    funFact: 'Assam produces some of the most aromatic and soothing black teas in the world.'
  },
  {
    id: 'hibiscus',
    name: 'Red Hibiscus',
    regionalName: 'জবা ফুল (Jaba Kusum)',
    category: 'Sacred Blossom',
    seedPrice: 15,
    stages: ['🌱 Seed', '🌿 Tiny Shoot', '🌷 Bud', '🌺 Crimson Bloom', '✨ Sacred Crown'],
    stageIcons: ['🌱', '🌿', '🌷', '🌺', '✨'],
    description: 'Bright red traditional flower that attracts colorful sunbirds and fluttering butterflies.',
    starYield: 6,
    funFact: 'Hibiscus blossoms bring warmth and vibrant color to village gardens across the North East.'
  },
  {
    id: 'lotus',
    name: 'Pink Sacred Lotus',
    regionalName: 'পদ্ম ফুল (Padma)',
    category: 'Aquatic Wonder',
    seedPrice: 35,
    stages: ['🌰 Pod', '🍃 Floating Leaf', '🪷 Budding Stem', '🌸 Majestic Lotus', '✨ Spiritual Essence'],
    stageIcons: ['🌰', '🍃', '🪷', '🌸', '✨'],
    description: 'A serene pink lotus that blossoms with grace upon tranquil highland ponds.',
    starYield: 14,
    funFact: 'Lotus leaves naturally repel water drops, keeping their blossoms pristine and pure.'
  },
  {
    id: 'bamboo',
    name: 'Golden Bamboo',
    regionalName: 'ভালুকা বাঁহ (Bhaluka Bamboo)',
    category: 'Resilient Reed',
    seedPrice: 30,
    stages: ['🌱 Shoot', '🎋 Sturdy Reed', '🎍 Tall Cane', '🎋 Golden Grove', '✨ Whispering Bamboo'],
    stageIcons: ['🌱', '🎋', '🎍', '🎋', '✨'],
    description: 'Strong, graceful bamboo stems that sway gently in the refreshing mountain breeze.',
    starYield: 12,
    funFact: 'Bamboo is woven into traditional fishing traps, hats, and musical instruments across the 8 NE states.'
  },
  {
    id: 'jasmine',
    name: 'Night Jasmine (Sewali)',
    regionalName: 'শেৱালী ফুল (Coral Jasmine)',
    category: 'Fragrant Autumn',
    seedPrice: 20,
    stages: ['🌱 Seed', '🌿 Small Branch', '🤍 White Buds', '🌼 Fragrant Night Bloom', '✨ Starlight Jasmine'],
    stageIcons: ['🌱', '🌿', '🤍', '🌼', '✨'],
    description: 'Delicate white blossoms with orange stems that carpet the morning grass with sweet scent.',
    starYield: 9,
    funFact: 'Sewali flowers bloom under the starlight and gently drop at dawn, signaling the autumn harvest season.'
  },
  {
    id: 'marigold',
    name: 'Golden Marigold',
    regionalName: 'গেন্দা ফুল (Gendha)',
    category: 'Auspicious Flower',
    seedPrice: 15,
    stages: ['🌱 Seed', '🌿 Sprout', '🟡 Golden Bud', '🌻 Sunny Bloom', '✨ Festive Garland'],
    stageIcons: ['🌱', '🌿', '🟡', '🌻', '✨'],
    description: 'Radiant golden blossoms strung into garlands for welcoming loved ones home.',
    starYield: 7,
    funFact: 'Marigolds naturally protect nearby garden herbs and keep away insects with their peppery scent.'
  },
  {
    id: 'brahma_kamal',
    name: 'Brahma Kamal',
    regionalName: 'ব্ৰহ্ম কমল (Himalayan Sacred Lotus)',
    category: 'Legendary Flora',
    seedPrice: 50,
    stages: ['🌰 Mystic Seed', '🌿 Alpine Leaves', '🤍 Snow Bud', '🪷 Star of the Himalayas', '✨ Celestial Bloom'],
    stageIcons: ['🌰', '🌿', '🤍', '🪷', '✨'],
    description: 'Rare alpine blossom native to the high Himalayan mountain peaks, blooming under night skies.',
    starYield: 20,
    funFact: 'Legend says witnessing a blooming Brahma Kamal brings lifelong peace and good fortune.'
  }
];

export const MARKET_SUPPLIES = [
  {
    id: 'spring_water',
    name: 'Spring Mountain Water',
    type: 'water',
    price: 10,
    amount: 5,
    icon: '💧',
    description: 'Pure mineral water collected from mountain streams. Hydrates 5 plants instantly.'
  },
  {
    id: 'organic_fertilizer',
    name: 'Organic Herb Compost',
    type: 'fertilizer',
    price: 15,
    amount: 3,
    icon: '🌿',
    description: 'Nutrient-rich natural compost that accelerates plant growth by one full stage.'
  },
  {
    id: 'sun_blessing',
    name: 'Himalayan Sunlight Lamp',
    type: 'sunlight',
    price: 25,
    amount: 2,
    icon: '☀️',
    description: 'Warm, golden light that makes blooming plants shine and drop bonus stars.'
  },
  {
    id: 'wind_chime',
    name: 'Bamboo Wind Chime',
    type: 'music',
    price: 20,
    amount: 2,
    icon: '🎐',
    description: 'Gentle chimes that play calming melodies, keeping plants happy and radiant.'
  }
];
