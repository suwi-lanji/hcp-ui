import { MantineProvider as MP } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { DatesProvider } from '@mantine/dates';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/notifications/styles.css';
import 'dayjs/locale/en';
import theme from '../theme';

export function MantineProvider({ children }: { children: React.ReactNode }) {
  return (
    <MP theme={theme} defaultColorScheme="light">
      <DatesProvider settings={{ locale: 'en' }}>
        <Notifications position="top-right" />
        {children}
      </DatesProvider>
    </MP>
  );
}