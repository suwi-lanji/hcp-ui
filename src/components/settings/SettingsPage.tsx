import { Card, Text, Stack } from '@mantine/core';

export function SettingsPage() {
  return (
    <div className="erp-content-inner" style={{ paddingTop: '1.5rem' }}>
      <Stack gap="md">
        <Text size="xl" fw={600}>Settings</Text>
        <Card shadow="xs" radius="md" withBorder p="xl">
          <Text c="dimmed">Application settings</Text>
          <Text c="dimmed" size="sm" mt="xs">Coming soon...</Text>
        </Card>
      </Stack>
    </div>
  );
}
