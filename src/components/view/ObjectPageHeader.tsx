import type * as React from 'react';
import { Card, Group, Text, Badge } from '@mantine/core';
import { Link } from 'react-router-dom';
import * as Icons from '@tabler/icons-react';
import type { ModuleConfig } from '@/types/moduleConfig';

interface ObjectPageHeaderProps {
  module: ModuleConfig;
  appKey?: string;
  appLabel?: string;
  identifier: string;
  title?: string;
  status?: string;
  statusLabel?: string;
  statusColor?: string;
  accentColor: string;
  quickInfo?: Array<{ label: string; value: string }>;
  actions?: React.ReactNode;
}

export function ObjectPageHeader({
  module,
  appKey,
  appLabel,
  identifier,
  title,
  status,
  statusLabel,
  statusColor = 'gray',
  accentColor,
  quickInfo = [],
  actions,
}: ObjectPageHeaderProps) {
  const iconKey = module.icon
    ? (`Icon${module.icon.charAt(0).toUpperCase()}${module.icon.slice(1)}` as keyof typeof Icons)
    : null;
  const IconComponent = (iconKey && (Icons as unknown as Record<string, React.ComponentType<{ size?: number }>>)[iconKey]) || Icons.IconFile;

  return (
    <>
      {/* Breadcrumbs */}
      <Group gap={8} mb="sm" style={{ fontSize: 12, color: 'var(--mantine-color-dimmed)' }}>
        <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>Home</Link>
        <Text>/</Text>
        {appKey && appLabel && (
          <>
            <Link to={`/app/${appKey}`} style={{ color: 'inherit', textDecoration: 'none' }}>
              {appLabel}
            </Link>
            <Text>/</Text>
          </>
        )}
        <Link to={`${module.basePath}/list?entity=${module.key}`} style={{ color: 'inherit', textDecoration: 'none' }}>
          {module.label}
        </Link>
        <Text>/</Text>
        <Text fw={600}>{identifier}</Text>
      </Group>

      {/* Header Card */}
      <Card
        shadow="xs"
        radius="md"
        withBorder
        mb="md"
        style={{ borderBottom: `2px solid ${accentColor}` }}
      >
        <Group justify="space-between" align="flex-start" p="md">
          <Group gap="md" align="flex-start">
            <div
              style={{
                width: 44,
                height: 44,
                background: accentColor,
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <IconComponent size={26} color="white" />
            </div>
            <div>
              <Group gap="sm" align="center">
                <Text size="xl" fw={800}>{identifier}</Text>
                {status && <Badge variant="light" color={statusColor} size="md">{statusLabel || status}</Badge>}
              </Group>
              {title && <Text size="sm" mt={4} c="dimmed">{title}</Text>}
              {quickInfo.length > 0 && (
                <Group gap="lg" mt="sm">
                  {quickInfo.map((info, idx) => (
                    <div key={idx}>
                      <Text size="xs" fw={500} c="dimmed">{info.label}</Text>
                      <Text size="sm" fw={600}>{info.value}</Text>
                    </div>
                  ))}
                </Group>
              )}
            </div>
          </Group>
          {actions}
        </Group>
      </Card>
    </>
  );
}
