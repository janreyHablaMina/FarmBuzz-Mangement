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
    male: 'Razor 014',
    female: 'Ruby 032',
    maleImage: ROOSTER_IMAGE,
    femaleImage: BROWN_HEN_IMAGE,
    eggCount: 6,
    oldestDays: 5,
    collected: 'Aug 24',
    status: 'Ready to set',
  },
  {
    id: 'holding-blade-queen',
    male: 'Blade 089',
    female: 'Queen 061',
    maleImage: BLACK_ROOSTER_IMAGE,
    femaleImage: HEN_IMAGE,
    eggCount: 5,
    oldestDays: 4,
    collected: 'Aug 25',
    status: 'Ready to set',
  },
  {
    id: 'holding-storm-lady',
    male: 'Storm 057',
    female: 'Lady 103',
    maleImage: ROOSTER_IMAGE,
    femaleImage: HEN_IMAGE,
    eggCount: 4,
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
    id: 'B-001',
    eggCount: 11,
    eggs: '11 eggs',
    dayNumber: 8,
    day: 'Day 8',
    progress: 38,
    startDate: 'Aug 22, 2026',
    estimatedHatch: 'Sep 12, 2026',
    daysLeft: 13,
    eventLabel: 'Candling',
    eventValue: 'In 6 days',
    candlingDueDay: 14,
    temperature: '37.5 C',
    humidity: '55%',
    incubator: 'Incubator 1',
    source: 'Razor 014 x Ruby 032, Blade 089 x Queen 061',
    note: 'Shells checked and positioned correctly.',
  },
  {
    id: 'B-002',
    eggCount: 9,
    eggs: '9 eggs',
    dayNumber: 5,
    day: 'Day 5',
    progress: 24,
    startDate: 'Aug 25, 2026',
    estimatedHatch: 'Sep 15, 2026',
    daysLeft: 16,
    eventLabel: 'Candling',
    eventValue: 'In 9 days',
    candlingDueDay: 14,
    temperature: '37.5 C',
    humidity: '54%',
    incubator: 'Incubator 2',
    source: 'Storm 057 x Lady 103, Apollo 028 x Scarlet 044',
    note: 'Batch is stable with no alerts.',
  },
];
