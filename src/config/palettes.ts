export type PaletteName =
  | 'warm-earth'
  | 'ocean-calm'
  | 'forest-rest'
  | 'lavender-dusk';

export type Palette = {
  name: PaletteName;
  label: string;
  metaThemeColor: string;
  cssVariables: Record<string, string>;
};

const baseVariables = {
  destructive: '0 84% 60%',
  'destructive-foreground': '0 0% 98%',
  radius: '1rem',
};

export const palettes: Record<PaletteName, Palette> = {
  'warm-earth': {
    name: 'warm-earth',
    label: 'Warm Earth',
    metaThemeColor: '#c9dbba',
    cssVariables: {
      background: '40 33% 96%',
      foreground: '25 10% 30%',
      primary: '6 78% 75%',
      'primary-foreground': '25 10% 20%',
      secondary: '140 25% 85%',
      'secondary-foreground': '140 30% 25%',
      card: '0 0% 100%',
      'card-foreground': '25 10% 30%',
      popover: '0 0% 100%',
      'popover-foreground': '25 10% 30%',
      muted: '40 20% 90%',
      'muted-foreground': '25 10% 50%',
      accent: '45 80% 90%',
      'accent-foreground': '25 10% 30%',
      border: '40 20% 90%',
      input: '40 20% 90%',
      ring: '6 78% 75%',
      ...baseVariables,
    },
  },
  'ocean-calm': {
    name: 'ocean-calm',
    label: 'Ocean Calm',
    metaThemeColor: '#8fb9c7',
    cssVariables: {
      background: '200 45% 97%',
      foreground: '205 35% 22%',
      primary: '196 42% 55%',
      'primary-foreground': '0 0% 100%',
      secondary: '38 45% 88%',
      'secondary-foreground': '205 35% 24%',
      card: '0 0% 100%',
      'card-foreground': '205 35% 22%',
      popover: '0 0% 100%',
      'popover-foreground': '205 35% 22%',
      muted: '198 28% 91%',
      'muted-foreground': '205 18% 45%',
      accent: '184 38% 86%',
      'accent-foreground': '205 35% 22%',
      border: '198 28% 88%',
      input: '198 28% 88%',
      ring: '196 42% 55%',
      ...baseVariables,
    },
  },
  'forest-rest': {
    name: 'forest-rest',
    label: 'Forest Rest',
    metaThemeColor: '#7d9a72',
    cssVariables: {
      background: '45 40% 96%',
      foreground: '120 18% 20%',
      primary: '109 24% 47%',
      'primary-foreground': '0 0% 100%',
      secondary: '87 32% 86%',
      'secondary-foreground': '120 22% 22%',
      card: '0 0% 100%',
      'card-foreground': '120 18% 20%',
      popover: '0 0% 100%',
      'popover-foreground': '120 18% 20%',
      muted: '60 20% 90%',
      'muted-foreground': '115 12% 42%',
      accent: '32 45% 84%',
      'accent-foreground': '120 18% 20%',
      border: '75 22% 86%',
      input: '75 22% 86%',
      ring: '109 24% 47%',
      ...baseVariables,
    },
  },
  'lavender-dusk': {
    name: 'lavender-dusk',
    label: 'Lavender Dusk',
    metaThemeColor: '#afa4c8',
    cssVariables: {
      background: '255 38% 97%',
      foreground: '260 18% 24%',
      primary: '259 28% 62%',
      'primary-foreground': '0 0% 100%',
      secondary: '286 28% 89%',
      'secondary-foreground': '260 18% 24%',
      card: '0 0% 100%',
      'card-foreground': '260 18% 24%',
      popover: '0 0% 100%',
      'popover-foreground': '260 18% 24%',
      muted: '255 25% 91%',
      'muted-foreground': '260 12% 46%',
      accent: '330 30% 90%',
      'accent-foreground': '260 18% 24%',
      border: '255 24% 88%',
      input: '255 24% 88%',
      ring: '259 28% 62%',
      ...baseVariables,
    },
  },
};
