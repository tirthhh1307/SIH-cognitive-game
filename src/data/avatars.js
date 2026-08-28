export const AVATAR_OPTIONS = [
  {
    id: 'apoi',
    name: 'Apoi (Grandmother - Classic Bun)',
    gender: 'female',
    style: 'Classic Grey Bun & Glasses',
    src: '/avatars/avatar_apoi.jpg',
    defaultName: 'Apoi'
  },
  {
    id: 'dada',
    name: 'Dada (Grandfather - Gamosa Scarf)',
    gender: 'male',
    style: 'Silver Hair & Mustache',
    src: '/avatars/avatar_dada.jpg',
    defaultName: 'Dada'
  },
  {
    id: 'aai_short',
    name: 'Aai (Grandmother - Short Hair)',
    gender: 'female',
    style: 'Chic Short Wavy Silver Hair',
    src: '/avatars/avatar_aai_short.jpg',
    defaultName: 'Aai'
  },
  {
    id: 'koka_beard',
    name: 'Koka (Grandfather - White Beard)',
    gender: 'male',
    style: 'Neat Silver Beard & Royal Kurta',
    src: '/avatars/avatar_koka_beard.jpg',
    defaultName: 'Koka'
  },
  {
    id: 'elder_braid',
    name: 'Baideo (Grandmother - Braided Hair)',
    gender: 'female',
    style: 'Silver Braid with Flower & Marigold Saree',
    src: '/avatars/avatar_elder_braid.jpg',
    defaultName: 'Baideo'
  },
  {
    id: 'elder_clean',
    name: 'Babu (Grandfather - Clean Shaven)',
    gender: 'male',
    style: 'Side-Parted Silver Hair & Sky Blue Kurta',
    src: '/avatars/avatar_elder_clean.jpg',
    defaultName: 'Babu'
  },
  {
    id: 'elder_glasses_bun',
    name: 'Maji (Grandmother - Curly High Bun)',
    gender: 'female',
    style: 'Curly High Bun & Rose Pink Saree',
    src: '/avatars/avatar_elder_glasses_bun.jpg',
    defaultName: 'Maji'
  }
];

export function getAvatarSrc(avatarId) {
  if (!avatarId) return '/avatars/avatar_apoi.jpg';
  if (avatarId.startsWith('/') || avatarId.startsWith('http')) return avatarId;
  const found = AVATAR_OPTIONS.find(a => a.id === avatarId);
  return found ? found.src : '/avatars/avatar_apoi.jpg';
}
