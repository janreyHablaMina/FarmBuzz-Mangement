export const ROOSTER_IMAGE =
  'https://images.unsplash.com/photo-1730360037813-9777f13b88bb?auto=format&fit=crop&w=300&q=82';
export const BLACK_ROOSTER_IMAGE =
  'https://images.unsplash.com/photo-1551127501-d4385c7484b4?auto=format&fit=crop&w=300&q=82';
export const HEN_IMAGE =
  'https://images.unsplash.com/photo-1770221499235-11dd1041e181?auto=format&fit=crop&w=300&q=82';
export const BROWN_HEN_IMAGE =
  'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&w=300&q=82';

export const HOLDING_GROUPS = [
  {
    id: 'holding-razor-ruby',
    groupName: 'Main Breeders',
    male: 'Sweater',
    female: 'Kelso',
    maleImage: ROOSTER_IMAGE,
    femaleImage: BROWN_HEN_IMAGE,
    eggCount: 18,
    oldestDays: 5,
    collected: 'Aug 24',
    status: 'Ready to set',
  },
  {
    id: 'holding-blade-queen',
    groupName: 'Group B',
    male: 'Kelso',
    female: '',
    maleImage: BLACK_ROOSTER_IMAGE,
    femaleImage: HEN_IMAGE,
    eggCount: 14,
    oldestDays: 4,
    collected: 'Aug 25',
    status: 'Ready to set',
  },
  {
    id: 'holding-storm-lady',
    groupName: 'Group C',
    male: 'Roundhead',
    female: 'Hatch',
    maleImage: ROOSTER_IMAGE,
    femaleImage: HEN_IMAGE,
    eggCount: 16,
    oldestDays: 3,
    collected: 'Aug 26',
    status: 'Holding',
  },
  {
    id: 'holding-apollo-scarlet',
    male: 'Apollo 028',
    female: 'Scarlet 044',
    maleImage: BLACK_ROOSTER_IMAGE,
    femaleImage: BROWN_HEN_IMAGE,
    eggCount: 3,
    oldestDays: 2,
    collected: 'Aug 27',
    status: 'Holding',
  },
];

export const HOLDING_EGG_TOTAL = HOLDING_GROUPS.reduce(
  (total, group) => total + group.eggCount,
  0,
);

export const INCUBATION_BATCHES = [
  {
    id: 'INC-024',
    eggCount: 48,
    eggs: '48 eggs',
    dayNumber: 7,
    day: 'Day 7',
    progress: 33,
    startDate: 'Sep 10, 2026',
    estimatedHatch: 'Oct 1, 2026',
    daysLeft: 14,
    status: 'Candling Due',
    eventLabel: 'Candling Due',
    eventValue: 'Due today',
    candlingDueDay: 7,
    temperature: '37.5 C',
    humidity: '55%',
    incubator: 'Incubator 2',
    source: 'Main Breeders, Group B, Group C',
    sources: [
      { groupName: 'Main Breeders', cross: 'Sweater x Kelso', eggs: 18 },
      { groupName: 'Group B', cross: 'Kelso', eggs: 14 },
      { groupName: 'Group C', cross: 'Roundhead x Hatch', eggs: 16 },
    ],
    note: 'Shells checked and positioned correctly.',
  },
  {
    id: 'INC-023',
    eggCount: 36,
    eggs: '36 eggs',
    dayNumber: 18,
    day: 'Day 18',
    progress: 86,
    startDate: 'Aug 30, 2026',
    estimatedHatch: 'Sep 20, 2026',
    daysLeft: 3,
    status: 'Hatching Soon',
    eventLabel: 'Hatching Soon',
    eventValue: 'In 3 days',
    candlingDueDay: 7,
    temperature: '37.5 C',
    humidity: '54%',
    incubator: 'Incubator 2',
    source: 'Main Breeders, Group C',
    sources: [
      { groupName: 'Main Breeders', cross: 'Sweater x Kelso', eggs: 20 },
      { groupName: 'Group C', cross: 'Roundhead x Hatch', eggs: 16 },
    ],
    note: 'Batch is stable with no alerts.',
  },
  {
    id: 'INC-022', eggCount: 29, eggs: '29 eggs', dayNumber: 11, day: 'Day 11', progress: 52,
    startDate: 'Sep 6, 2026', estimatedHatch: 'Sep 27, 2026', daysLeft: 10,
    status: 'Candled', eventLabel: 'Candling', eventValue: 'Completed', candlingDueDay: 7,
    temperature: '37.5 C', humidity: '56%', incubator: 'Main Hatchery', source: 'Group B',
    sources: [{ groupName: 'Group B', cross: 'Kelso', eggs: 29 }],
    note: 'Candling complete. Batch remains stable.',
  },
];
