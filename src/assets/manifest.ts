/** Individual assets supplied with the project. Kept in public Assets so Vite preserves originals. */
const source = `${import.meta.env.BASE_URL}Assets/`;
export const assets = {
  brand: { cat: source + 'mascot-cat.png', stars: source + 'deco-stars-cluster.png' },
  focus: { crown: source + 'focus-timer-crown.png', emblem: source + 'focus-star-emblem.png', ornaments: source + 'focus-timer-ornaments.png', cat: source + 'mascot-cat-focus.png' },
  profile: { cat: source + 'mascot-cat-happy.png', moon: source + '13_moon.png' },
  rewards: { crown: source + 'reward-crown.png', star: source + 'achievement-star.png', crystal: source + 'points-crystal.png' },
  decorations: { wand: source + '12_magic_wand.png', cloud: source + '16_cloud.png', clock: source + '17_alarm_clock.png' }
} as const;
