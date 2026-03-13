export const mockGames = [
  {
    id: '1',
    title: 'Neon Drift',
    developer: 'Cyber Studios',
    genre: 'Racing / Cyberpunk',
    rating: 4.8,
    description: 'High-speed cyberpunk racing game with deep customization and an intense vaporwave soundtrack. Drift through neon-lit streets and dominate the underground scene.',
    price: 29.99,
    thumbnail: 'https://images.unsplash.com/photo-1614050212061-f3b194f18378?auto=format&fit=crop&q=80&w=600',
    banner: 'https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?auto=format&fit=crop&q=80&w=1200',
    screenshots: [
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?auto=format&fit=crop&q=80&w=600',
    ],
    features: ['Multiplayer', 'Controller Support', 'Cloud Saves']
  },
  {
    id: '2',
    title: 'Cosmic Frontier',
    developer: 'Stellar Games',
    genre: 'RPG / Space Exploration',
    rating: 4.9,
    description: 'Explore a vast, procedurally generated universe. Trade, fight, and discover alien civilizations in this massive open-world space epic.',
    price: 59.99,
    thumbnail: 'https://images.unsplash.com/photo-1614729939124-032f0b56c9ce?auto=format&fit=crop&q=80&w=600',
    banner: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&q=80&w=1200',
    screenshots: [
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&q=80&w=600'
    ],
    features: ['Single Player', 'VR Supported', 'Workshop']
  },
  {
    id: '3',
    title: 'Shadow Tactics',
    developer: 'Ninja Works',
    genre: 'Strategy / Stealth',
    rating: 4.6,
    description: 'Hardcore tactical stealth game set in feudal Japan. Take control of a team of deadly specialists and sneak in the shadows.',
    price: 19.99,
    thumbnail: 'https://images.unsplash.com/photo-1538481199005-cb22e30cd284?auto=format&fit=crop&q=80&w=600',
    banner: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=1200',
    screenshots: [
      'https://images.unsplash.com/photo-1542320868-f4d80389e1c4?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1542320868-f4d80389e1c4?auto=format&fit=crop&q=80&w=600'
    ],
    features: ['Single Player', 'Achievements', 'Trading Cards']
  },
  {
    id: '4',
    title: 'Pixel Forge',
    developer: 'Indie Dev Co',
    genre: 'Sandbox / Building',
    rating: 4.5,
    description: 'Build your dream world block by block. Gather resources, craft tools, and survive the night.',
    price: 9.99,
    thumbnail: 'https://images.unsplash.com/photo-1560419015-7c427e8ae5ba?auto=format&fit=crop&q=80&w=600',
    banner: 'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?auto=format&fit=crop&q=80&w=1200',
    screenshots: [
      'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=600'
    ],
    features: ['Co-op', 'Cross-Platform', 'Level Editor']
  },
  {
    id: '5',
    title: 'Void Walker',
    developer: 'Dark Matter Studios',
    genre: 'Action / Roguelike',
    rating: 4.7,
    description: 'Fast-paced roguelike set in a dying universe. Master void magic and defeat endless hordes of cosmic horrors.',
    price: 14.99,
    thumbnail: 'https://images.unsplash.com/photo-1551103782-8ab07afd45c1?auto=format&fit=crop&q=80&w=600',
    banner: 'https://images.unsplash.com/photo-1618336306637-bf7d0e40bed8?auto=format&fit=crop&q=80&w=1200',
    screenshots: [
      'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=600'
    ],
    features: ['Single Player', 'Leaderboards', 'Full Controller Support']
  }
];

export const mockUser = {
  id: 'u1',
  username: 'PlayerOne',
  avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&q=80&w=200',
  joinDate: 'Jan 2024',
  level: 42,
  stats: {
    gamesOwned: 124,
    hoursPlayed: 1405,
    achievements: 342
  },
  recentlyPlayed: ['1', '5', '3'],
  favorites: ['2', '1']
};

export const categories = [
  'Action', 'RPG', 'Strategy', 'Adventure', 'Indie', 'Racing', 'Simulation'
];
