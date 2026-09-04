/** Individual assets supplied with the project. Kept in public Assets so Vite preserves originals. */
const source = `${import.meta.env.BASE_URL}Assets/`;
export const assets = {
  brand: { cat: source + 'mascot-cat.png', stars: source + 'deco-stars-cluster.png' },
  focus: { crown: source + 'focus-timer-crown.png', emblem: source + 'focus-star-emblem.png', ornaments: source + 'focus-timer-ornaments.png', cat: source + 'mascot-cat-focus.png' },
  profile: { cat: source + 'mascot-cat-happy.png', moon: source + '13_moon.png' },
  moods: {
    great: source + '31_mood_amazing.png',
    good: source + '32_mood_good.png',
    neutral: source + '33_mood_neutral.png',
    tired: source + '34_mood_tired.png',
    low: source + '35_mood_sad.png'
  },
  rewards: {
    crown: source + 'reward-crown.png', star: source + 'achievement-star.png', crystal: source + 'points-crystal.png',
    achievement: source + '21_achievement_badge.png', dailyGoal: source + '39_daily_goal_badge.png', streak: source + '40_streak_badge.png'
  },
  mascots: {
    taskComplete: source + '36_mascot_task_complete.png', focusComplete: source + '37_mascot_focus_complete.png',
    threeTasks: source + '38_mascot_three_tasks.png', emptyTodo: source + '41_empty_todo_mascot.png', emptyCalendar: source + '42_empty_calendar_mascot.png'
  },
  decorations: {
    wand: source + '12_magic_wand.png', cloud: source + '16_cloud.png', clock: source + '17_alarm_clock.png',
    sparkles: source + '22_magic_sparkles_01.png', swirl: source + '23_magic_sparkle_swirl.png', flame: source + '24_magic_flame.png',
    bow: source + '25_magic_bow.png', moonStars: source + '26_deco_moon_stars.png', crystals: source + '27_deco_crystal_cluster.png',
    hearts: source + '28_deco_hearts_cluster.png', sparkleTrail: source + '29_magic_sparkles_02.png', profileFrame: source + '30_magical_profile_frame.png'
  }
} as const;
