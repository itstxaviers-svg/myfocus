/** Individual assets supplied with the project. Kept in public Assets so Vite preserves originals. */
const source = `${import.meta.env.BASE_URL}Assets/`;
export const assets = {
  brand: { cat: source + 'mascot-cat.webp', stars: source + 'deco-stars-cluster.webp' },
  focus: { crown: source + 'focus-timer-crown.webp', emblem: source + 'focus-star-emblem.webp', ornaments: source + 'focus-timer-ornaments.webp', cat: source + 'mascot-cat-focus.webp' },
  profile: { cat: source + 'mascot-cat-happy.webp', moon: source + '13_moon.webp' },
  moods: {
    great: source + '31_mood_amazing.webp',
    good: source + '32_mood_good.webp',
    neutral: source + '33_mood_neutral.webp',
    tired: source + '34_mood_tired.webp',
    low: source + '35_mood_sad.webp'
  },
  rewards: {
    crown: source + 'reward-crown.webp', star: source + 'achievement-star.webp', crystal: source + 'points-crystal.webp',
    achievement: source + '21_achievement_badge.webp', dailyGoal: source + '39_daily_goal_badge.webp', streak: source + '40_streak_badge.webp'
  },
  mascots: {
    taskComplete: source + '36_mascot_task_complete.webp', focusComplete: source + '37_mascot_focus_complete.webp',
    threeTasks: source + '38_mascot_three_tasks.webp', emptyTodo: source + '11_cat_happy.webp', emptyCalendar: source + '42_empty_calendar_mascot.webp'
  },
  decorations: {
    wand: source + '12_magic_wand.webp', cloud: source + '16_cloud.webp', clock: source + '17_alarm_clock.webp',
    sparkles: source + '22_magic_sparkles_01.webp', swirl: source + '23_magic_sparkle_swirl.webp', flame: source + '24_magic_flame.webp',
    bow: source + '25_magic_bow.webp', moonStars: source + '26_deco_moon_stars.webp', crystals: source + '27_deco_crystal_cluster.webp',
    hearts: source + '28_deco_hearts_cluster.webp', sparkleTrail: source + '29_magic_sparkles_02.webp', profileFrame: source + '30_magical_profile_frame.webp'
  }
} as const;
