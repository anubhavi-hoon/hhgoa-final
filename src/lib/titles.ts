export const BUILDER_TITLES = [
  'NIGHT SHIFT BUILDER',
  'BEACH CODE ARCHITECT',
  'SHIP-IT NOMAD',
  'STACK SURFER',
  'BUG HUNTER',
  'TERMINAL NOMAD',
  'MIDNIGHT HACKER',
  'CODE & CHAI ENGINEER',
  'SEA-BREEZE SHIPPER',
  'PRODUCTION CRASHER',
  'PROD NOMAD',
  'GOA SHIP-IT SPECIALIST',
  'COFFEE-TO-CODE COMPILER',
  'GIT PUSH NOMAD',
  'COASTAL TECH ARCHITECT',
  'VIBE ENGINEER'
];

/**
 * Returns a random builder title.
 * Optionally excludes the current title to avoid repeating the same title on click.
 */
export function getRandomBuilderTitle(currentTitle?: string): string {
  const filtered = currentTitle
    ? BUILDER_TITLES.filter((t) => t !== currentTitle)
    : BUILDER_TITLES;
  
  const randomIndex = Math.floor(Math.random() * filtered.length);
  return filtered[randomIndex];
}
