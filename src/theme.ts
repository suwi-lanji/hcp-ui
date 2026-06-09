import { createTheme, rem } from '@mantine/core';

const theme = createTheme({
  primaryColor: 'sapBlue',
  fontFamily: '"72", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  defaultRadius: 'md',
  headings: {
    fontWeight: '600',
    sizes: {
      h1: { fontSize: '2rem' },
      h2: { fontSize: '1.6rem' },
      h3: { fontSize: '1.3rem' },
      h4: { fontSize: '1.1rem' },
    },
  },
  colors: {
    sapBlue: [
      '#e5f0fb', '#c7dcf5', '#97bfeb', '#609fdf', '#3580d5',
      '#1a66cc', '#0854a0', '#06478d', '#043a79', '#022d66',
    ],
    brand: [
      '#eef3ff', '#dce4f5', '#b8c9eb', '#8fa9df', '#6a8dd5',
      '#5077ce', '#4269ca', '#3356b3', '#28479e', '#1c3889',
    ],
    sapPositive: [
      '#f0faf0', '#d4f0d4', '#a8e6a8', '#6ed46e', '#4db14b',
      '#3a9e38', '#2d8a2d', '#207020', '#155815', '#0b400b',
    ],
    sapNegative: [
      '#fef0f0', '#fcd4d4', '#f8a8a8', '#f46e6e', '#e0001a',
      '#c80017', '#b00014', '#980012', '#80000f', '#68000c',
    ],
    sapCritical: [
      '#fff6e6', '#ffe4b8', '#ffc980', '#ffaa3d', '#e9730c',
      '#d1640a', '#ba580a', '#a04c09', '#864008', '#6c3407',
    ],
    sapInformative: [
      '#e5f0fb', '#c7dcf5', '#97bfeb', '#609fdf', '#0854a0',
      '#074a90', '#064080', '#053670', '#042c60', '#032250',
    ],
  },
  spacing: {
    xs: rem(4),
    sm: rem(8),
    md: rem(12),
    lg: rem(16),
    xl: rem(24),
  },
  components: {
    Card: {
      defaultProps: {
        shadow: 'xs',
        radius: 'md',
        withBorder: true,
      },
    },
    Button: {
      defaultProps: {
        radius: 'md',
      },
    },
    Badge: {
      defaultProps: {
        radius: 'md',
        variant: 'light',
      },
    },
  },
});

export default theme;