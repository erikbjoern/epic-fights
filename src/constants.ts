export enum ColorName {
  amber = 'amber',
  gray = 'gray',
  lime = 'lime',
  rose = 'rose',
  sky = 'sky'
}
export type ColorIntensity = 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900

type Constants = {
  GRID_HEIGHT: number,
  GRID_WIDTH: number,
  DEFAULT_HP: number,
  BOX_SHADOWS: {
    [key in ColorName]: {
      highlight: string
    }
  },
  COLORS: {
    [key in ColorName]: {
      [key in ColorIntensity]: string
    }
  }
}

const constants: Constants = {
  GRID_HEIGHT: 6,
  GRID_WIDTH: 6,
  DEFAULT_HP: 20,
  BOX_SHADOWS: {
    amber: {
      highlight: '0 0 15px 7px rgba(255 220 200 / 90%), 0 0 5px 1px rgba(65 50 25 / 80%)',
    },
    gray: {
      highlight: '0 0 15px 7px rgba(190 190 190 / 70%), 0 0 5px 1px rgba(15 15 15 / 70%)',
    },
    lime: {
      highlight: '0 0 15px 7px rgba(190 255 190 / 70%), 0 0 5px 1px rgba(15 50 15 / 70%)',
    },
    rose: {
      highlight: '0 0 15px 7px rgba(255 190 190 / 70%), 0 0 5px 1px rgba(50 15 15 / 70%)',
    },
    sky: {
      highlight: '0 0 15px 7px rgba(190 190 255 / 70%), 0 0 5px 1px rgba(15 15 50 / 70%)',
    },
  },
  COLORS: {
    gray: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
    },
    amber: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f',
    },
    lime: {
      50: '#f7fee7',
      100: '#ecfccb',
      200: '#d9f99d',
      300: '#bef264',
      400: '#a3e635',
      500: '#84cc16',
      600: '#65a30d',
      700: '#4d7c0f',
      800: '#3f6212',
      900: '#365314',
    },
    sky: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#0ea5e9',
      600: '#0284c7',
      700: '#0369a1',
      800: '#075985',
      900: '#0c4a6e',
    },
    rose: {
      50: '#fff1f2',
      100: '#ffe4e6',
      200: '#fecdd3',
      300: '#fda4af',
      400: '#fb7185',
      500: '#f43f5e',
      600: '#e11d48',
      700: '#be123c',
      800: '#9f1239',
      900: '#881337',
    }
  }
}

export default constants