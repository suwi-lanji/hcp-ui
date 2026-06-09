import { Card, Text, Stack } from '@mantine/core';
import { useParams } from 'react-router-dom';

export function CustomPage() {
  const { pageKey } = useParams<{ pageKey: string }>();

  return (
    <div className="erp-content-inner" style={{ paddingTop: '1.5rem' }}>
      <Stack gap="md">
        <Text size="xl" fw={600}>Custom Page</Text>
        <Card shadow="xs" radius="md" withBorder p="xl">
          <Text c="dimmed">Custom page: <strong>{pageKey || 'unknown'}</strong></Text>
          <Text c="dimmed" size="sm" mt="xs">Coming soon...</Text>
        </Card>
      </Stack>
    </div>
  );
}
